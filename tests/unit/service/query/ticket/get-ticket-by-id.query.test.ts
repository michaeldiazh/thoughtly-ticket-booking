/**
 * Tests for Get Ticket By ID Query Builder
 */

import { buildTicketByIdQuery } from '../../../../../src/service/query/ticket/get-ticket-by-id.query';

describe('buildTicketByIdQuery', () => {
  it('should build SELECT query with correct structure', () => {
    const ticketId = 123;
    const result = buildTicketByIdQuery(ticketId);

    // Verify SQL structure
    expect(result.sql).toContain('SELECT');
    expect(result.sql).toContain('FROM ticket t');
    expect(result.sql).toContain('INNER JOIN price_tier pt ON pt.code = t.tier_code');
    expect(result.sql).toContain('INNER JOIN event e ON t.event_id = e.id');
    expect(result.sql).toContain('INNER JOIN venue v ON e.venue_id = v.id');
    expect(result.sql).toContain('WHERE t.id = ?');
  });

  it('should include all required ticket fields in SELECT', () => {
    const ticketId = 456;
    const result = buildTicketByIdQuery(ticketId);

    expect(result.sql).toContain('t.id');
    expect(result.sql).toContain('e.id AS eventId');
    expect(result.sql).toContain('pt.code AS tierCode');
    expect(result.sql).toContain('pt.display_name AS tierDisplayName');
    expect(result.sql).toContain('t.capacity');
    expect(result.sql).toContain('t.remaining');
    expect(result.sql).toContain('t.price');
    expect(result.sql).toContain('DATE_FORMAT(t.created_at');
    expect(result.sql).toContain('AS createdAt');
    expect(result.sql).toContain('DATE_FORMAT(t.last_updated');
    expect(result.sql).toContain('AS lastUpdated');
  });

  it('should include event JSON object with nested venue', () => {
    const ticketId = 789;
    const result = buildTicketByIdQuery(ticketId);

    // Verify event JSON object structure
    expect(result.sql).toContain('JSON_OBJECT');
    expect(result.sql).toContain("'id', e.id");
    expect(result.sql).toContain("'name', e.name");
    expect(result.sql).toContain("'description', e.description");
    expect(result.sql).toContain("'startTime'");
    expect(result.sql).toContain("'endTime'");
    expect(result.sql).toContain("'venue'");
    
    // Verify nested venue JSON object
    expect(result.sql).toContain("'countryCode', v.country_code");
    expect(result.sql).toContain("'timezone', v.timezone");
  });

  it('should format datetime fields to ISO 8601', () => {
    const ticketId = 101;
    const result = buildTicketByIdQuery(ticketId);

    expect(result.sql).toContain("DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%sZ')");
    expect(result.sql).toContain("DATE_FORMAT(t.last_updated, '%Y-%m-%dT%H:%i:%sZ')");
    expect(result.sql).toContain("DATE_FORMAT(e.start_time, '%Y-%m-%dT%H:%i:%sZ')");
    expect(result.sql).toContain("DATE_FORMAT(e.end_time, '%Y-%m-%dT%H:%i:%sZ')");
  });

  it('should include ticket ID in params array', () => {
    const ticketId = 999;
    const result = buildTicketByIdQuery(ticketId);

    expect(result.params).toEqual([ticketId]);
    expect(result.params.length).toBe(1);
  });

  it('should have exactly one placeholder matching params length', () => {
    const ticketId = 555;
    const result = buildTicketByIdQuery(ticketId);

    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(1);
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should include all venue fields in nested JSON object', () => {
    const ticketId = 222;
    const result = buildTicketByIdQuery(ticketId);

    // Verify all venue fields are present
    expect(result.sql).toContain("'id', v.id");
    expect(result.sql).toContain("'name', v.name");
    expect(result.sql).toContain("'address', v.address");
    expect(result.sql).toContain("'city', v.city");
    expect(result.sql).toContain("'region', v.region");
    expect(result.sql).toContain("'countryCode', v.country_code");
    expect(result.sql).toContain("'timezone', v.timezone");
  });

  it('should return QueryResult with sql and params', () => {
    const ticketId = 333;
    const result = buildTicketByIdQuery(ticketId);

    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('params');
    expect(typeof result.sql).toBe('string');
    expect(Array.isArray(result.params)).toBe(true);
  });

  it('should handle different ticket IDs correctly', () => {
    const ticketId1 = 1;
    const ticketId2 = 999999;
    
    const result1 = buildTicketByIdQuery(ticketId1);
    const result2 = buildTicketByIdQuery(ticketId2);

    // SQL should be the same (only params differ)
    expect(result1.sql).toBe(result2.sql);
    
    // Params should be different
    expect(result1.params).toEqual([ticketId1]);
    expect(result2.params).toEqual([ticketId2]);
  });
});
