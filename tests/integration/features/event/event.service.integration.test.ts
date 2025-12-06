/**
 * Integration Tests for Event Service
 * 
 * Tests using real MySQL 8.4 database via testcontainers
 */

import { EventService } from '../../../../src/features/event/service/event.service';
import { getTestDatabase, loadTestData } from '../../../setup/testcontainers.setup';
import { GetEventsQuery } from '../../../../src/features/event/domain/dtos';
import { EventSchema, EventListItemSchema } from '../../../../src/features/event/domain/dtos';
import { EventNotFoundError } from '../../../../src/domain/errors/event.errors';

describe('EventService Integration Tests', () => {
  let eventService: EventService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeAll(() => {
    db = getTestDatabase();
    eventService = new EventService(db);
  });

  describe('getEvents', () => {
    it('should return all events when no filters applied', async () => {
      const query: GetEventsQuery = {
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.total).toBeGreaterThan(0);
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events[0]).toHaveProperty('id');
      expect(result.events[0]).toHaveProperty('name');
      expect(result.events[0]).toHaveProperty('startTime');
      expect(result.events[0]).toHaveProperty('endTime');
      expect(result.events[0]).toHaveProperty('venueName');
      expect(result.events[0]).toHaveProperty('venueCity');
      expect(result.events[0]).toHaveProperty('venueCountryCode');
      expect(result.events[0]).toHaveProperty('venueTimezone');
    });

    it('should filter by eventName', async () => {
      const query: GetEventsQuery = {
        eventName: 'Summer',
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events.every((e) => e.name.includes('Summer'))).toBe(true);
    });

    it('should filter by eventIds', async () => {
      // First get some event IDs
      const events = await db.query<{ id: number }>('SELECT id FROM event LIMIT 2');
      const eventIds = events.map((e) => e.id);

      if (eventIds.length < 2) {
        throw new Error('Not enough events in test data');
      }

      const query: GetEventsQuery = {
        eventIds: eventIds,
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events.length).toBeLessThanOrEqual(2);
      expect(result.events.every((e) => eventIds.includes(e.id))).toBe(true);
    });

    it('should filter by venueCountryCode', async () => {
      const query: GetEventsQuery = {
        venueCountryCode: 'US',
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events.every((e) => e.venueCountryCode === 'US')).toBe(true);
    });

    it('should filter by venueName', async () => {
      const query: GetEventsQuery = {
        venueName: 'Garden',
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events.every((e) => e.venueName.includes('Garden'))).toBe(true);
    });

    it('should filter by eventStartDate', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const query: GetEventsQuery = {
        eventStartDate: startDate,
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      // All events should start on or after the start date
      result.events.forEach((e) => {
        const eventStart = new Date(e.startTime);
        expect(eventStart.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      });
    });

    it('should filter by eventEndDate', async () => {
      const endDate = new Date('2024-12-31T23:59:59Z');
      const query: GetEventsQuery = {
        eventEndDate: endDate,
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      // All events should end on or before the end date
      result.events.forEach((e) => {
        const eventEnd = new Date(e.endTime);
        expect(eventEnd.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should respect pagination with limit and offset', async () => {
      const query1: GetEventsQuery = {
        limit: 2,
        offset: 0,
      };

      const query2: GetEventsQuery = {
        limit: 2,
        offset: 2,
      };

      const result1 = await eventService.getEvents(query1);
      const result2 = await eventService.getEvents(query2);

      expect(result1.events.length).toBeLessThanOrEqual(2);
      expect(result2.events.length).toBeLessThanOrEqual(2);
      // Results should be different
      if (result1.events.length > 0 && result2.events.length > 0) {
        expect(result1.events[0]?.id).not.toBe(result2.events[0]?.id);
      }
    });

    it('should return correct total count', async () => {
      const query: GetEventsQuery = {
        limit: 1,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.total).toBeGreaterThan(0);
      expect(result.events.length).toBeLessThanOrEqual(1);
    });

    it('should validate event list items match schema', async () => {
      const query: GetEventsQuery = {
        limit: 10,
        offset: 0,
      };

      const result = await eventService.getEvents(query);

      expect(result.events.length).toBeGreaterThan(0);
      
      // Validate each event using Zod schema
      result.events.forEach((event) => {
        const validatedEvent = EventListItemSchema.parse(event);
        expect(validatedEvent).toBeDefined();
        expect(validatedEvent.id).toBeGreaterThan(0);
        expect(validatedEvent.name.length).toBeGreaterThan(0);
        expect(validatedEvent.venueName.length).toBeGreaterThan(0);
        expect(validatedEvent.venueCity.length).toBeGreaterThan(0);
        expect(validatedEvent.venueCountryCode.length).toBeGreaterThanOrEqual(2);
        expect(validatedEvent.venueCountryCode.length).toBeLessThanOrEqual(4);
        expect(validatedEvent.venueTimezone.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event with nested venue and tiers when found', async () => {
      // First, get an event ID from the test data
      const events = await db.query<{ id: number }>('SELECT id FROM event LIMIT 1');
      const eventId = events[0]?.id;

      if (!eventId) {
        throw new Error('No events found in test data');
      }

      const result = await eventService.getEventById(eventId);

      expect(result).not.toBeNull();
      expect(result.id).toBe(eventId);

      // Validate using Zod schema - this ensures all required fields are present
      // and match the expected structure, including nested venue and tiers
      const validatedResult = EventSchema.parse(result);
      
      // Verify venue exists and is valid
      expect(validatedResult.venue).toBeDefined();
      expect(validatedResult.venue.id).toBeGreaterThan(0);
      expect(validatedResult.venue.name).toBeTruthy();
      expect(validatedResult.venue.address).toBeTruthy();
      expect(validatedResult.venue.city).toBeTruthy();
      expect(validatedResult.venue.countryCode.length).toBeGreaterThanOrEqual(2);
      expect(validatedResult.venue.countryCode.length).toBeLessThanOrEqual(4);
      expect(validatedResult.venue.timezone).toBeTruthy();
      
      // Verify tiers exist (may be empty object if no tickets)
      expect(validatedResult.tiers).toBeDefined();
      expect(typeof validatedResult.tiers).toBe('object');
    });

    it('should throw EventNotFoundError when event not found', async () => {
      const nonExistentEventId = 99999;

      await expect(eventService.getEventById(nonExistentEventId)).rejects.toThrow(EventNotFoundError);
    });

    it('should return event with correct venue relationship', async () => {
      // Get an event ID with its venue_id
      const events = await db.query<{ id: number; venue_id: number }>('SELECT id, venue_id FROM event LIMIT 1');
      const eventId = events[0]?.id;
      const expectedVenueId = events[0]?.venue_id;

      if (!eventId || !expectedVenueId) {
        throw new Error('No events found in test data');
      }

      const result = await eventService.getEventById(eventId);

      expect(result).not.toBeNull();
      
      // Validate using Zod schema to ensure structure is correct
      const validatedResult = EventSchema.parse(result);
      
      expect(validatedResult.venue.id).toBe(expectedVenueId);
    });

    it('should validate event data structure matches DTO', async () => {
      const events = await db.query<{ id: number }>('SELECT id FROM event LIMIT 1');
      const eventId = events[0]?.id;

      if (!eventId) {
        throw new Error('No events found in test data');
      }

      const result = await eventService.getEventById(eventId);

      // Validate using Zod schema - this ensures all fields match the DTO structure
      const validatedResult = EventSchema.parse(result);
      
      expect(validatedResult).not.toBeNull();
      
      // All numeric fields should be numbers (validated by Zod)
      expect(Number.isInteger(validatedResult.id)).toBe(true);
      expect(Number.isInteger(validatedResult.venue.id)).toBe(true);

      // String fields should be non-empty (validated by Zod)
      expect(validatedResult.name.length).toBeGreaterThan(0);
      expect(validatedResult.startTime.length).toBeGreaterThan(0);
      expect(validatedResult.endTime.length).toBeGreaterThan(0);
      expect(validatedResult.venue.name.length).toBeGreaterThan(0);
      expect(validatedResult.venue.address.length).toBeGreaterThan(0);
      expect(validatedResult.venue.city.length).toBeGreaterThan(0);
      expect(validatedResult.venue.countryCode.length).toBeGreaterThanOrEqual(2);
      expect(validatedResult.venue.countryCode.length).toBeLessThanOrEqual(4);
      expect(validatedResult.venue.timezone.length).toBeGreaterThan(0);
      
      // Tiers should be an object (validated by Zod)
      expect(typeof validatedResult.tiers).toBe('object');
    });

    it('should return event with tiers when tickets exist', async () => {
      // Get an event ID that has tickets
      const eventsWithTickets = await db.query<{ id: number }>(
        'SELECT DISTINCT e.id FROM event e INNER JOIN ticket t ON e.id = t.event_id LIMIT 1'
      );
      const eventId = eventsWithTickets[0]?.id;

      if (!eventId) {
        throw new Error('No events with tickets found in test data');
      }

      const result = await eventService.getEventById(eventId);

      expect(result).not.toBeNull();
      
      // Validate using Zod schema
      const validatedResult = EventSchema.parse(result);
      
      // Tiers should exist and may have entries
      expect(validatedResult.tiers).toBeDefined();
      expect(typeof validatedResult.tiers).toBe('object');
      
      // If tiers exist, validate their structure
      if (Object.keys(validatedResult.tiers).length > 0) {
        const tierKey = Object.keys(validatedResult.tiers)[0];
        const tier = validatedResult.tiers[tierKey];
        expect(tier).toHaveProperty('ticketId');
        expect(tier).toHaveProperty('price');
        expect(tier).toHaveProperty('remaining');
        expect(tier).toHaveProperty('capacity');
        expect(Number.isInteger(tier.ticketId)).toBe(true);
        expect(typeof tier.price).toBe('number');
        expect(tier.price).toBeGreaterThan(0);
        expect(Number.isInteger(tier.remaining)).toBe(true);
        expect(Number.isInteger(tier.capacity)).toBe(true);
      }
    });
  });
});
