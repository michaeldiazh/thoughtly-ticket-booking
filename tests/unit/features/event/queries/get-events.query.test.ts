/**
 * Tests for Get Events Query Builder
 */

import {
  buildEventsCountQuery,
  buildEventsSelectQuery,
} from '../../../../../src/features/event/queries/get-events.query';
import { GetEventsQuery, EventListItem } from '../../../../../src/features/event/domain/dtos';
import { OrderByConfig } from '../../../../../src/shared/types';

describe('buildEventsCountQuery', () => {
  it('should build COUNT query without WHERE clause when no filters', () => {
    const query: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildEventsCountQuery(query);

    expect(result.sql).toContain('SELECT COUNT(*) as total');
    expect(result.sql).toContain('FROM event e');
    expect(result.sql).toContain('INNER JOIN venue v ON e.venue_id = v.id');
    expect(result.sql).not.toContain('WHERE');
    expect(result.params).toEqual([]);
    
    // Verify placeholder count matches params length
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should build COUNT query with WHERE clause when filters are present', () => {
    const query: GetEventsQuery = {
      eventIds: [1, 2, 3],
      eventName: 'Concert',
      limit: 10,
      offset: 0,
    };

    const result = buildEventsCountQuery(query);

    expect(result.sql).toContain('SELECT COUNT(*) as total');
    expect(result.sql).toContain('WHERE');
    expect(result.sql).toContain('e.id IN (?,?,?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.params).toEqual([1, 2, 3, '%Concert%']);
    
    // Verify placeholder count matches params length
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should use correct WHERE clause conditions order', () => {
    const query: GetEventsQuery = {
      eventIds: [1],
      eventName: 'Test',
      venueCountryCode: 'USAS',
      limit: 10,
      offset: 0,
    };

    const result = buildEventsCountQuery(query);

    expect(result.sql).toContain('e.id IN (?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.sql).toContain('v.country_code = ?');
    expect(result.params).toEqual([1, '%Test%', 'USAS']);
    
    // Verify placeholder count matches params length
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should handle date filters', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-12-31T23:59:59Z');
    const query: GetEventsQuery = {
      eventStartDate: startDate,
      eventEndDate: endDate,
      limit: 10,
      offset: 0,
    };

    const result = buildEventsCountQuery(query);

    expect(result.sql).toContain('e.start_time >= ?');
    expect(result.sql).toContain('e.end_time <= ?');
    expect(result.params).toEqual([startDate, endDate]);
    
    // Verify placeholder count matches params length
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should handle venue filters', () => {
    const query: GetEventsQuery = {
      venueName: 'Madison',
      venueCountryCode: 'USAS',
      limit: 10,
      offset: 0,
    };

    const result = buildEventsCountQuery(query);

    expect(result.sql).toContain('v.name LIKE ?');
    expect(result.sql).toContain('v.country_code = ?');
    expect(result.params).toEqual(['%Madison%', 'USAS']);
    
    // Verify placeholder count matches params length
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });
});

describe('buildEventsSelectQuery', () => {
  it('should build SELECT query with all required fields', () => {
    const query: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildEventsSelectQuery(query);

    expect(result.sql).toContain('SELECT');
    expect(result.sql).toContain('e.id');
    expect(result.sql).toContain('e.name');
    expect(result.sql).toContain('e.description');
    expect(result.sql).toContain('DATE_FORMAT(e.start_time');
    expect(result.sql).toContain('AS startTime');
    expect(result.sql).toContain('DATE_FORMAT(e.end_time');
    expect(result.sql).toContain('AS endTime');
    expect(result.sql).toContain('v.name AS venueName');
    expect(result.sql).toContain('v.city AS venueCity');
    expect(result.sql).toContain('v.country_code AS venueCountryCode');
    expect(result.sql).toContain('v.timezone AS venueTimezone');
    expect(result.sql).toContain('FROM event e');
    expect(result.sql).toContain('INNER JOIN venue v ON e.venue_id = v.id');
    expect(result.sql).toContain('LIMIT ? OFFSET ?');
  });

  it('should include limit and offset in params', () => {
    const query: GetEventsQuery = {
      limit: 20,
      offset: 10,
    };

    const result = buildEventsSelectQuery(query);

    expect(result.params).toEqual([20, 10]);
    expect(result.params.length).toBe(2);
  });

  it('should include WHERE clause when filters are present', () => {
    const query: GetEventsQuery = {
      eventName: 'Concert',
      limit: 10,
      offset: 0,
    };

    const result = buildEventsSelectQuery(query);

    expect(result.sql).toContain('WHERE');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.params).toEqual(['%Concert%', 10, 0]);
  });

  it('should use default ORDER BY when not provided', () => {
    const query: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildEventsSelectQuery(query);

    expect(result.sql).toContain('ORDER BY');
    expect(result.sql).toContain('e.start_time ASC');
    expect(result.sql).toContain('e.id ASC');
  });

  it('should use custom ORDER BY when provided', () => {
    const query: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };
    const orderBy: OrderByConfig<EventListItem>[] = [
      { key: 'name', op: 'DESC' },
      { key: 'startTime', op: 'ASC' },
    ];

    const result = buildEventsSelectQuery(query, orderBy);

    expect(result.sql).toContain('ORDER BY');
    expect(result.sql).toContain('e.name DESC');
    expect(result.sql).toContain('e.start_time ASC');
  });

  it('should handle all filter types together', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-12-31T23:59:59Z');
    const query: GetEventsQuery = {
      eventIds: [1, 2],
      eventName: 'Summer',
      eventStartDate: startDate,
      eventEndDate: endDate,
      venueName: 'Garden',
      venueCountryCode: 'USAS',
      limit: 5,
      offset: 10,
    };

    const result = buildEventsSelectQuery(query);

    expect(result.sql).toContain('WHERE');
    expect(result.sql).toContain('e.id IN (?,?)');
    expect(result.sql).toContain('e.name LIKE ?');
    expect(result.sql).toContain('e.start_time >= ?');
    expect(result.sql).toContain('e.end_time <= ?');
    expect(result.sql).toContain('v.name LIKE ?');
    expect(result.sql).toContain('v.country_code = ?');
    expect(result.params).toEqual([1, 2, '%Summer%', startDate, endDate, '%Garden%', 'USAS', 5, 10]);
  });

  it('should have correct placeholder count matching params length', () => {
    const query: GetEventsQuery = {
      eventIds: [1, 2, 3],
      limit: 10,
      offset: 0,
    };

    const result = buildEventsSelectQuery(query);

    // 3 eventIds + 1 limit + 1 offset = 5 params
    expect(result.params.length).toBe(5);
    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should return QueryResult with sql and params', () => {
    const query: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };

    const result = buildEventsSelectQuery(query);

    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('params');
    expect(typeof result.sql).toBe('string');
    expect(Array.isArray(result.params)).toBe(true);
  });
});
