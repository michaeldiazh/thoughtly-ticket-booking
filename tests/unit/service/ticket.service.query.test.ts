/**
 * Tests for Ticket Service Query Builder
 */

import {
  buildAvailableTicketsCountQuery,
  buildAvailableTicketsSelectQuery,
} from '../../../src/service/query/ticket/get-tickets.query';
import { GetTicketsQuery, SimplifiedTicket } from '../../../src/domain/dtos';
import { OrderByConfig } from '../../../src/service/types';

describe('buildAvailableTicketsCountQuery', () => {
  it('should build COUNT query without WHERE clause when no filters', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsCountQuery(query);

    expect(result.sql).toContain('SELECT COUNT(*) as total');
    expect(result.sql).toContain('FROM ticket t');
    expect(result.sql).toContain('INNER JOIN event e ON t.event_id = e.id');
    expect(result.sql).toContain('INNER JOIN venue v ON e.venue_id = v.id');
    expect(result.sql).not.toContain('WHERE');
    expect(result.params).toEqual([]);
  });

  it('should build COUNT query with WHERE clause when filters are present', () => {
    const query: GetTicketsQuery = {
      ticketIds: [1, 2, 3],
      eventName: 'Concert',
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsCountQuery(query);

    expect(result.sql).toContain('SELECT COUNT(*) as total');
    expect(result.sql).toContain('WHERE');
    expect(result.sql).toContain('t.id IN (?,?,?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.params).toEqual([1, 2, 3, '%Concert%']);
  });

  it('should use correct WHERE clause conditions order', () => {
    const query: GetTicketsQuery = {
      ticketIds: [1],
      tierCodes: ['GA'],
      eventName: 'Test',
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsCountQuery(query);

    expect(result.sql).toContain('t.id IN (?)');
    expect(result.sql).toContain('t.tier_code IN (?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.params).toEqual([1, 'GA', '%Test%']);
  });
});

describe('buildAvailableTicketsSelectQuery', () => {
  it('should build SELECT query without WHERE clause when no filters', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.sql).toContain('SELECT');
    expect(result.sql).toContain('t.id');
    expect(result.sql).toContain('e.name as eventName');
    expect(result.sql).toContain('FROM ticket t');
    expect(result.sql).toContain('INNER JOIN event e ON t.event_id = e.id');
    expect(result.sql).toContain('INNER JOIN venue v ON e.venue_id = v.id');
    expect(result.sql).toContain('INNER JOIN price_tier pt ON t.tier_code = pt.code');
    expect(result.sql).toContain('ORDER BY e.start_time ASC, t.id ASC');
    expect(result.sql).toContain('LIMIT ? OFFSET ?');
    expect(result.sql).not.toContain('WHERE');
    expect(result.params).toEqual([10, 0]);
  });

  it('should build SELECT query with WHERE clause when filters are present', () => {
    const query: GetTicketsQuery = {
      ticketIds: [1, 2],
      eventName: 'Concert',
      limit: 5,
      offset: 10,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.sql).toContain('WHERE');
    expect(result.sql).toContain('t.id IN (?,?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.params).toEqual([1, 2, '%Concert%', 5, 10]);
  });

  it('should use provided limit and offset', () => {
    const query: GetTicketsQuery = {
      ticketIds: [1],
      limit: 5,
      offset: 2,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.params).toEqual([1, 5, 2]);
  });

  it('should include all SELECT columns', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.sql).toContain('t.id');
    expect(result.sql).toContain('e.name as eventName');
    expect(result.sql).toContain('pt.display_name as tierDisplayName');
    expect(result.sql).toContain('t.remaining');
    expect(result.sql).toContain('t.price');
    expect(result.sql).toContain('v.name as venueName');
    expect(result.sql).toContain('v.city as venueCity');
    expect(result.sql).toContain('v.country_code as venueCountryCode');
    expect(result.sql).toContain('DATE_FORMAT(e.start_time');
  });

  it('should handle all filters together', () => {
    const query: GetTicketsQuery = {
      ticketIds: [1, 2, 3],
      tierCodes: ['GA', 'VIP'],
      eventName: 'Concert',
      eventStartDate: new Date('2024-01-01T00:00:00Z'),
      eventEndDate: new Date('2024-12-31T23:59:59Z'),
      venueName: 'Madison',
      venueCountryCode: 'USAS',
      limit: 20,
      offset: 5,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.sql).toContain('WHERE');
    // 7 filter params: ticketIds(3) + tierCodes(2) + eventName(1) + eventStartDate(1) + eventEndDate(1) + venueName(1) + venueCountryCode(1) = 10
    // Plus 2 pagination params = 12 total
    expect(result.params.length).toBe(12);
    expect(result.params[result.params.length - 2]).toBe(20); // limit
    expect(result.params[result.params.length - 1]).toBe(5); // offset
  });

  it('should use default orderBy when not provided', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildAvailableTicketsSelectQuery(query);

    expect(result.sql).toContain('ORDER BY e.start_time ASC, t.id ASC');
  });

  it('should use custom orderBy when provided', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };
    const orderBy: OrderByConfig<SimplifiedTicket>[] = [
      { key: 'price', op: 'DESC' },
      { key: 'remaining', op: 'ASC' },
    ];

    const result = buildAvailableTicketsSelectQuery(query, orderBy);

    expect(result.sql).toContain('ORDER BY t.price DESC, t.remaining ASC');
  });

  it('should handle single orderBy field', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };
    const orderBy: OrderByConfig<SimplifiedTicket>[] = [
      { key: 'eventName', op: 'ASC' },
    ];

    const result = buildAvailableTicketsSelectQuery(query, orderBy);

    expect(result.sql).toContain('ORDER BY e.name ASC');
  });

  it('should handle empty orderBy array by using default', () => {
    const query: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };
    const orderBy: OrderByConfig<SimplifiedTicket>[] = [];

    const result = buildAvailableTicketsSelectQuery(query, orderBy);

    // Empty array should fall back to default
    expect(result.sql).toContain('ORDER BY e.start_time ASC, t.id ASC');
  });
});

