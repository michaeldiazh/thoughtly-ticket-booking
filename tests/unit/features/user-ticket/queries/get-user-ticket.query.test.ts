/**
 * Tests for Get User Ticket Query Builder
 */

import { buildGetUserTicketQuery, buildGetUserTicketSQL } from '../../../../../src/features/user-ticket/queries/get-user-ticket.query';

describe('buildGetUserTicketQuery', () => {
  it('should build SELECT query with correct structure', () => {
    const bookingId = 123;
    const result = buildGetUserTicketQuery(bookingId);

    // Verify SQL structure
    expect(result.sql).toContain('SELECT');
    expect(result.sql).toContain('FROM user_ticket ut');
    expect(result.sql).toContain('INNER JOIN ticket t');
    expect(result.sql).toContain('INNER JOIN event e');
    expect(result.sql).toContain('INNER JOIN venue v');
    expect(result.sql).toContain('WHERE ut.id = ?');
  });

  it('should include all required user ticket fields in SELECT', () => {
    const bookingId = 456;
    const result = buildGetUserTicketQuery(bookingId);

    expect(result.sql).toContain('ut.id');
    expect(result.sql).toContain('ut.ticket_id as \'ticketId\'');
    expect(result.sql).toContain('ut.user_id as \'userId\'');
    expect(result.sql).toContain('ut.unit_price as \'unitPrice\'');
    expect(result.sql).toContain('ut.ticket_amount as \'ticketAmount\'');
    expect(result.sql).toContain('datePurchased');
    expect(result.sql).toContain('e.name as \'eventName\'');
    expect(result.sql).toContain('v.name as \'venueName\'');
    expect(result.sql).toContain('startTime');
    expect(result.sql).toContain('endTime');
  });

  it('should calculate totalPrice as unit_price * ticket_amount', () => {
    const bookingId = 789;
    const result = buildGetUserTicketQuery(bookingId);

    expect(result.sql).toContain('ut.unit_price * ut.ticket_amount as \'totalPrice\'');
  });

  it('should include booking ID in params array', () => {
    const bookingId = 999;
    const result = buildGetUserTicketQuery(bookingId);

    expect(result.params).toEqual([bookingId]);
    expect(result.params.length).toBe(1);
  });

  it('should have exactly one placeholder matching params length', () => {
    const bookingId = 555;
    const result = buildGetUserTicketQuery(bookingId);

    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(1);
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should use table aliases correctly for all columns', () => {
    const bookingId = 222;
    const result = buildGetUserTicketQuery(bookingId);

    // All column references should use proper aliases
    expect(result.sql).toContain('ut.id');
    expect(result.sql).toContain('ut.ticket_id');
    expect(result.sql).toContain('ut.user_id');
    expect(result.sql).toContain('ut.unit_price');
    expect(result.sql).toContain('ut.ticket_amount');
    expect(result.sql).toContain('ut.date_purchased');
    expect(result.sql).toContain('e.name');
    expect(result.sql).toContain('v.name');
    expect(result.sql).toContain('e.start_time');
    expect(result.sql).toContain('e.end_time');
  });

  it('should return QueryResult with sql and params', () => {
    const bookingId = 333;
    const result = buildGetUserTicketQuery(bookingId);

    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('params');
    expect(typeof result.sql).toBe('string');
    expect(Array.isArray(result.params)).toBe(true);
  });

  it('should handle different booking IDs correctly', () => {
    const bookingId1 = 1;
    const bookingId2 = 999999;
    
    const result1 = buildGetUserTicketQuery(bookingId1);
    const result2 = buildGetUserTicketQuery(bookingId2);

    // SQL should be the same (only params differ)
    expect(result1.sql).toBe(result2.sql);
    
    // Params should be different
    expect(result1.params).toEqual([bookingId1]);
    expect(result2.params).toEqual([bookingId2]);
  });

  it('should use camelCase aliases for all fields', () => {
    const bookingId = 100;
    const result = buildGetUserTicketQuery(bookingId);

    // Verify camelCase aliases
    expect(result.sql).toContain('ticketId');
    expect(result.sql).toContain('userId');
    expect(result.sql).toContain('unitPrice');
    expect(result.sql).toContain('ticketAmount');
    expect(result.sql).toContain('totalPrice');
    expect(result.sql).toContain('datePurchased');
    expect(result.sql).toContain('eventName');
    expect(result.sql).toContain('venueName');
    expect(result.sql).toContain('startTime');
    expect(result.sql).toContain('endTime');
  });
});

describe('buildGetUserTicketSQL', () => {
  it('should return SQL string without parameters', () => {
    const sql = buildGetUserTicketSQL();

    expect(typeof sql).toBe('string');
    expect(sql).toContain('SELECT');
    expect(sql).toContain('FROM user_ticket ut');
    expect(sql).toContain('WHERE ut.id = ?');
  });

  it('should contain all required SQL keywords', () => {
    const sql = buildGetUserTicketSQL();

    expect(sql).toContain('SELECT');
    expect(sql).toContain('FROM');
    expect(sql).toContain('WHERE');
  });
});
