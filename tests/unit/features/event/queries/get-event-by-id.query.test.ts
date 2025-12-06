/**
 * Tests for Get Event By ID Query Builder
 */

import { getEventByIdQuery } from '../../../../../src/features/event/queries/get-event-by-id.query';

describe('getEventByIdQuery', () => {
  it('should build SELECT query with correct structure', () => {
    const eventId = 123;
    const result = getEventByIdQuery(eventId);

    // Verify SQL structure
    expect(result.sql).toContain('select');
    expect(result.sql).toContain('from event e');
    expect(result.sql).toContain('join venue v');
    expect(result.sql).toContain('join ticket t');
    expect(result.sql).toContain('join price_tier pt');
    expect(result.sql).toContain('where e.id = ?');
    expect(result.sql).toContain('group by');
  });

  it('should include all required event fields in SELECT', () => {
    const eventId = 456;
    const result = getEventByIdQuery(eventId);

    expect(result.sql).toContain('e.id');
    expect(result.sql).toContain('e.name');
    expect(result.sql).toContain('e.description');
    expect(result.sql).toContain('e.start_time');
    expect(result.sql).toContain('e.end_time');
  });

  it('should include venue JSON object', () => {
    const eventId = 789;
    const result = getEventByIdQuery(eventId);

    // Verify venue JSON object structure
    expect(result.sql).toContain('JSON_OBJECT');
    expect(result.sql).toContain("'id', v.id");
    expect(result.sql).toContain("'name', v.name");
    expect(result.sql).toContain("'address', v.address");
    expect(result.sql).toContain("'city', v.city");
    expect(result.sql).toContain("'region', v.region");
    expect(result.sql).toContain("'countryCode', v.country_code");
    expect(result.sql).toContain("'timezone', v.timezone");
    expect(result.sql).toContain('as venue');
  });

  it('should include tiers JSON object aggregation', () => {
    const eventId = 101;
    const result = getEventByIdQuery(eventId);

    // Verify tiers JSON aggregation
    expect(result.sql).toContain('JSON_OBJECTAGG');
    expect(result.sql).toContain('t.tier_code');
    expect(result.sql).toContain("'ticketId', t.id");
    expect(result.sql).toContain("'price', t.price");
    expect(result.sql).toContain("'remaining', t.remaining");
    expect(result.sql).toContain("'capacity', t.capacity");
    expect(result.sql).toContain('as tiers');
  });

  it('should include event ID in params array', () => {
    const eventId = 999;
    const result = getEventByIdQuery(eventId);

    expect(result.params).toEqual([eventId]);
    expect(result.params.length).toBe(1);
  });

  it('should have exactly one placeholder matching params length', () => {
    const eventId = 555;
    const result = getEventByIdQuery(eventId);

    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(1);
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should include group by clause', () => {
    const eventId = 222;
    const result = getEventByIdQuery(eventId);

    expect(result.sql).toContain('group by');
    expect(result.sql).toContain('e.id');
    expect(result.sql).toContain('v.id');
  });

  it('should return QueryResult with sql and params', () => {
    const eventId = 333;
    const result = getEventByIdQuery(eventId);

    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('params');
    expect(typeof result.sql).toBe('string');
    expect(Array.isArray(result.params)).toBe(true);
  });

  it('should handle different event IDs correctly', () => {
    const eventId1 = 1;
    const eventId2 = 999999;
    
    const result1 = getEventByIdQuery(eventId1);
    const result2 = getEventByIdQuery(eventId2);

    // SQL should be the same (only params differ)
    expect(result1.sql).toBe(result2.sql);
    
    // Params should be different
    expect(result1.params).toEqual([eventId1]);
    expect(result2.params).toEqual([eventId2]);
  });
});
