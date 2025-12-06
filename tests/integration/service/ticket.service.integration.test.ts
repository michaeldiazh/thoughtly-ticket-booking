/**
 * Integration Tests for Ticket Service
 * 
 * Tests using real MySQL 8.4 database via testcontainers
 */

import { TicketService } from '../../../src/service/ticket.service';
import { getTestDatabase } from '../../setup/testcontainers.setup';
import { GetTicketsQuery } from '../../../src/domain/dtos';

describe('TicketService Integration Tests', () => {
  let ticketService: TicketService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeAll(() => {
    db = getTestDatabase();
    ticketService = new TicketService(db);
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await db.query('DELETE FROM user_ticket');
    await db.query('DELETE FROM ticket');
    await db.query('DELETE FROM event');
    await db.query('DELETE FROM venue');
    await db.query('DELETE FROM price_tier');
    await db.query('DELETE FROM user');

    // Insert test data
    await setupTestData(db);
  });

  describe('getAllAvailableTickets', () => {
    it('should return all tickets when no filters applied', async () => {
      const query: GetTicketsQuery = {
        limit: 10,
        offset: 0,
      };

      const result = await ticketService.getAllAvailableTickets(query);

      expect(result.total).toBeGreaterThan(0);
      expect(result.tickets.length).toBeGreaterThan(0);
      expect(result.tickets[0]).toHaveProperty('id');
      expect(result.tickets[0]).toHaveProperty('eventName');
      expect(result.tickets[0]).toHaveProperty('tierDisplayName');
    });

    it('should filter by tierCodes', async () => {
      const query: GetTicketsQuery = {
        tierCodes: ['VIP'],
        limit: 10,
        offset: 0,
      };

      const result = await ticketService.getAllAvailableTickets(query);

      expect(result.tickets.every((t) => t.tierDisplayName === 'VIP')).toBe(true);
    });

    it('should filter by multiple tierCodes', async () => {
      const query: GetTicketsQuery = {
        tierCodes: ['VIP', 'FRONT_ROW'],
        limit: 10,
        offset: 0,
      };

      const result = await ticketService.getAllAvailableTickets(query);

      expect(result.tickets.length).toBeGreaterThan(0);
      expect(
        result.tickets.every((t) => ['VIP', 'Front Row'].includes(t.tierDisplayName))
      ).toBe(true);
    });

    it('should filter by eventName', async () => {
      const query: GetTicketsQuery = {
        eventName: 'Summer',
        limit: 10,
        offset: 0,
      };

      const result = await ticketService.getAllAvailableTickets(query);

      expect(result.tickets.every((t) => t.eventName.includes('Summer'))).toBe(true);
    });

    it('should respect pagination with limit and offset', async () => {
      const query1: GetTicketsQuery = {
        limit: 2,
        offset: 0,
      };

      const query2: GetTicketsQuery = {
        limit: 2,
        offset: 2,
      };

      const result1 = await ticketService.getAllAvailableTickets(query1);
      const result2 = await ticketService.getAllAvailableTickets(query2);

      expect(result1.tickets.length).toBeLessThanOrEqual(2);
      expect(result2.tickets.length).toBeLessThanOrEqual(2);
      // Results should be different
      expect(result1.tickets[0]?.id).not.toBe(result2.tickets[0]?.id);
    });

    it('should return correct total count', async () => {
      const query: GetTicketsQuery = {
        limit: 1,
        offset: 0,
      };

      const result = await ticketService.getAllAvailableTickets(query);

      expect(result.total).toBeGreaterThan(0);
      expect(result.tickets.length).toBeLessThanOrEqual(1);
    });
  });
});

/**
 * Setup test data in the database
 */
async function setupTestData(db: ReturnType<typeof getTestDatabase>): Promise<void> {
  // Insert price tiers
  await db.query(`
    INSERT INTO price_tier (code, display_name, default_price) VALUES
    ('VIP', 'VIP', 100.00),
    ('FRONT_ROW', 'Front Row', 50.00),
    ('GA', 'General Admission', 10.00)
    ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)
  `);

  // Insert venue and get ID
  await db.query(`
    INSERT INTO venue (name, address, city, country_code, timezone) VALUES
    ('Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 'US', 'America/New_York')
  `);
  const venueResults = await db.query<{ id: number }>(`
    SELECT id FROM venue WHERE name = 'Madison Square Garden' LIMIT 1
  `);
  const venueId = venueResults[0]?.id;
  if (!venueId) {
    throw new Error('Failed to insert venue');
  }

  // Insert event and get ID
  await db.query(`
    INSERT INTO event (name, description, venue_id, start_time, end_time) VALUES
    ('Summer Concert 2024', 'A great summer concert', ?, '2024-07-15 19:00:00', '2024-07-15 22:00:00')
  `, [venueId]);
  const eventResults = await db.query<{ id: number }>(`
    SELECT id FROM event WHERE name = 'Summer Concert 2024' LIMIT 1
  `);
  const eventId = eventResults[0]?.id;
  if (!eventId) {
    throw new Error('Failed to insert event');
  }

  // Insert tickets
  await db.query(`
    INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
    (?, 'VIP', 50, 45, 100.00),
    (?, 'FRONT_ROW', 30, 20, 50.00),
    (?, 'GA', 200, 200, 10.00)
  `, [eventId, eventId, eventId]);
}
