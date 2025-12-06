/**
 * Integration Tests for User Ticket Service
 * 
 * Tests using real MySQL 8.4 database via testcontainers
 * Includes concurrency tests to verify double-booking prevention
 */

import { UserTicketService } from '../../../src/service/user-ticket.service';
import { getTestDatabase } from '../../setup/testcontainers.setup';
import { UserTicketRequest, UserTicket } from '../../../src/domain/dtos';
import { InsufficientTicketsError } from '../../../src/domain/errors';
import { createUserTicketRequest } from '../../mocks/user-ticket-request.factory';
import { MySQLConnector } from '../../../src/service/database/mysql.connector';

describe('UserTicketService Integration Tests', () => {
  let userTicketService: UserTicketService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeAll(() => {
    db = getTestDatabase();
    userTicketService = new UserTicketService(db);
  });

  // Clean up user_ticket records created during tests
  afterEach(async () => {
    // Clean up user_ticket records for tickets 1-10 to avoid test interference
    await db.query('DELETE FROM user_ticket WHERE ticket_id BETWEEN 1 AND 10');
    // Reset remaining counts for test tickets
    await db.query(`
      UPDATE ticket 
      SET remaining = capacity 
      WHERE id BETWEEN 1 AND 10
    `);
  });

  describe('addNewUserTicket', () => {
    it('should successfully book tickets when available', async () => {
      // Use ticket ID 1 (assuming it exists in test data with remaining > 0)
      const request: UserTicketRequest = createUserTicketRequest(1, 1, 1);
      const result = await userTicketService.addNewUserTicket(request);
      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.ticketId).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.ticketAmount).toBe(1);
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.totalPrice).toBe(result.unitPrice * result.ticketAmount);
      expect(result.datePurchased).toBeDefined();
    });

    it('should prevent two users from booking the same ticket simultaneously', async () => {
      const ticketId = 2;
      await setupSameTicketSimultaneousBookingTestCase(db, ticketId);
      const request1 = createUserTicketRequest(1, 2, 1);
      const request2 = createUserTicketRequest(2, 2, 1);

      const [successes, failures] = await executeSimultaneousBooking(userTicketService, request1, request2);
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1)
      const failure = failures[0] as PromiseRejectedResult;
      const successfulBooking = successes[0] as PromiseFulfilledResult<UserTicket>;
      verifyRejectedInsufficientTicketsError(failure, ticketId);
      await Promise.all([      
          verifyRemainingCountIsZero(db, ticketId),
          verifySuccessfulBookingInSimultaneousBooking(db, successfulBooking, ticketId)
        ]);
    });

    it('should prevent booking when requesting more tickets than available', async () => {
      // Set ticket to have 2 remaining
      await db.query('UPDATE ticket SET remaining = 2 WHERE id = 3');

      const request = createUserTicketRequest(1, 3, 5); // Requesting more than available

      await expect(userTicketService.addNewUserTicket(request)).rejects.toThrow(
        InsufficientTicketsError
      );

      // Verify ticket count was not decremented
      await verifyRemainingCountIsXTickets(db, 3, 2);
    });

    it('should handle concurrent requests for different quantities correctly', async () => {
      // Set ticket to have 3 remaining
      await db.query('UPDATE ticket SET remaining = 3 WHERE id = 4');
      const request1 = createUserTicketRequest(1, 4, 2); // Requesting 2 tickets
      const request2 = createUserTicketRequest(2, 4, 2); // Also requesting 2 tickets (total 4, but only 3 available)
      const [successes, failures] = await executeSimultaneousBooking(userTicketService, request1, request2);
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);
      // Verify the remaining count is correct (3 - 2 = 1)
      await verifyRemainingCountIsXTickets(db, 4, 1);
    });
  });
});

const setupSameTicketSimultaneousBookingTestCase = async (db: MySQLConnector, ticketId: number): Promise<void> => {
  // Clean up any existing bookings for this ticket first
  // Set the ticket to have 1 remaining
  await db.query('DELETE FROM user_ticket WHERE ticket_id = ?', [ticketId]);
  await db.query('UPDATE ticket SET remaining = 1 WHERE id = ?', [ticketId]);

  // Verify the initial state
  const initialTicket = await db.queryOne<{ remaining: number; capacity: number }>(
    'SELECT remaining, capacity FROM ticket WHERE id = 2'
  );
  expect(initialTicket?.remaining).toBe(1);
}

const executeSimultaneousBooking = async (userTicketService: UserTicketService, request1: UserTicketRequest, request2: UserTicketRequest): Promise<[PromiseSettledResult<UserTicket>[], PromiseSettledResult<UserTicket>[]]> => {
  const promise1 = userTicketService.addNewUserTicket(request1);
  const promise2 = userTicketService.addNewUserTicket(request2);
  // Wait for both to complete
  // Return the results as an array of successes and failures
  const [result1, result2] = await Promise.allSettled([promise1, promise2]);

  // Filter the results to get the successes and failures
  // Return the results as an array of successes and failures
  const successes = [result1, result2].filter((r) => r.status === 'fulfilled');
  const failures = [result1, result2].filter((r) => r.status === 'rejected');
  return [successes, failures];
}

const verifyRejectedInsufficientTicketsError = (failure: PromiseRejectedResult, ticketId: number): void => {
  expect(failure.reason).toBeInstanceOf(InsufficientTicketsError);
  expect(failure.reason.code).toBe('INSUFFICIENT_TICKETS');
  expect(failure.reason.details?.ticketId).toBe(ticketId);
}

const verifyRemainingCountIsZero = async (db: MySQLConnector, ticketId: number): Promise<void> => verifyRemainingCountIsXTickets(db, ticketId, 0);

const verifyRemainingCountIsXTickets = async (db: MySQLConnector, ticketId: number, expectedRemaining: number): Promise<void> => {
  const ticketResult = await db.queryOne<{ remaining: number }>(
    'SELECT remaining FROM ticket WHERE id = ?', [ticketId]
  );
  expect(ticketResult?.remaining ?? -1).toBe(expectedRemaining);
}

const verifySuccessfulBookingInSimultaneousBooking= async (db: MySQLConnector, succeeded: PromiseFulfilledResult<UserTicket>, ticketId: number): Promise<void> => {
  const userTickets = await db.query<{ id: number; ticket_id: number; user_id: number }>(
    'SELECT id, ticket_id, user_id FROM user_ticket WHERE ticket_id = 2 ORDER BY id DESC LIMIT 2'
  );
  expect(userTickets.length).toBe(1);
  expect([1, 2]).toContain(succeeded.value.userId);
}