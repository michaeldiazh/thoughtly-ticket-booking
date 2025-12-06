/**
 * Integration Tests for Ticket Service
 * 
 * Tests using real MySQL 8.4 database via testcontainers
 */

import { TicketService } from '../../../src/service/ticket.service';
import { getTestDatabase, loadTestData } from '../../setup/testcontainers.setup';
import { GetTicketsQuery, TicketSchema } from '../../../src/domain/dtos';

describe('TicketService Integration Tests', () => {
  let ticketService: TicketService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeAll(() => {
    db = getTestDatabase();
    ticketService = new TicketService(db);
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

  describe('getTicketById', () => {
    it('should return a ticket with nested event and venue when found', async () => {
      // First, get a ticket ID from the test data
      const tickets = await db.query<{ id: number }>('SELECT id FROM ticket LIMIT 1');
      const ticketId = tickets[0]?.id;

      if (!ticketId) {
        throw new Error('No tickets found in test data');
      }

      const result = await ticketService.getTicketById(ticketId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(ticketId);

      // Validate using Zod schema - this ensures all required fields are present
      // and match the expected structure, including nested event and venue
      const validatedResult = TicketSchema.parse(result);
      
      // Verify event exists and is valid
      expect(validatedResult.event).toBeDefined();
      expect(validatedResult.event.id).toBeGreaterThan(0);
      expect(validatedResult.event.name).toBeTruthy();
      
      // Verify venue exists and is nested in event
      expect(validatedResult.event.venue).toBeDefined();
      expect(validatedResult.event.venue.id).toBeGreaterThan(0);
      expect(validatedResult.event.venue.name).toBeTruthy();
      expect(validatedResult.event.venue.address).toBeTruthy();
      expect(validatedResult.event.venue.city).toBeTruthy();
      expect(validatedResult.event.venue.countryCode.length).toBeGreaterThanOrEqual(2);
      expect(validatedResult.event.venue.countryCode.length).toBeLessThanOrEqual(4);
      expect(validatedResult.event.venue.timezone).toBeTruthy();
    });

    it('should return null when ticket not found', async () => {
      const nonExistentTicketId = 99999;

      const result = await ticketService.getTicketById(nonExistentTicketId);

      expect(result).toBeNull();
    });

    it('should return ticket with correct event and venue relationships', async () => {
      // Get a ticket ID
      const tickets = await db.query<{ id: number; event_id: number }>('SELECT id, event_id FROM ticket LIMIT 1');
      const ticketId = tickets[0]?.id;
      const expectedEventId = tickets[0]?.event_id;

      if (!ticketId || !expectedEventId) {
        throw new Error('No tickets found in test data');
      }

      const result = await ticketService.getTicketById(ticketId);

      expect(result).not.toBeNull();
      
      // Validate using Zod schema to ensure structure is correct
      const validatedResult = TicketSchema.parse(result);
      
      expect(validatedResult.event.id).toBe(expectedEventId);

      // Verify venue is correctly nested in event and is valid
      expect(validatedResult.event.venue).toBeDefined();
      expect(validatedResult.event.venue.id).toBeGreaterThan(0);
      expect(validatedResult.event.venue.name).toBeTruthy();
    });

    it('should validate ticket data structure matches DTO', async () => {
      const tickets = await db.query<{ id: number }>('SELECT id FROM ticket LIMIT 1');
      const ticketId = tickets[0]?.id;

      if (!ticketId) {
        throw new Error('No tickets found in test data');
      }

      const result = await ticketService.getTicketById(ticketId);

      // Validate using Zod schema - this ensures all fields match the DTO structure
      const validatedResult = TicketSchema.parse(result);
      
      expect(validatedResult).not.toBeNull();
      
      // All numeric fields should be numbers (validated by Zod)
      expect(Number.isInteger(validatedResult.id)).toBe(true);
      expect(Number.isInteger(validatedResult.capacity)).toBe(true);
      expect(Number.isInteger(validatedResult.remaining)).toBe(true);
      expect(typeof validatedResult.price).toBe('number');
      expect(validatedResult.price).toBeGreaterThan(0);

      // String fields should be non-empty (validated by Zod)
      expect(validatedResult.tierCode.length).toBeGreaterThan(0);
      expect(validatedResult.tierDisplayName.length).toBeGreaterThan(0);
      expect(validatedResult.createdAt.length).toBeGreaterThan(0);
      expect(validatedResult.lastUpdated.length).toBeGreaterThan(0);

      // Nested event MUST exist and be valid (validated by Zod)
      expect(validatedResult.event).toBeDefined();
      expect(validatedResult.event.id).toBeGreaterThan(0);
      expect(validatedResult.event.name.length).toBeGreaterThan(0);
      
      // Nested venue MUST exist in event and be valid (validated by Zod)
      expect(validatedResult.event.venue).toBeDefined();
      expect(validatedResult.event.venue.id).toBeGreaterThan(0);
      expect(validatedResult.event.venue.name.length).toBeGreaterThan(0);
      expect(validatedResult.event.venue.countryCode.length).toBeGreaterThanOrEqual(2);
      expect(validatedResult.event.venue.countryCode.length).toBeLessThanOrEqual(4);
    });
  });
});
