/**
 * Tests for Insert User Ticket Query Builder
 */

import { buildInsertUserTicketQuery, buildInsertUserTicketSQL } from '../../../../../src/features/user-ticket/queries/insert-user-ticket.query';
import { UserTicketRequest } from '../../../../../src/features/user-ticket/user-ticket.types';

describe('buildInsertUserTicketQuery', () => {
  it('should build INSERT query with correct structure', () => {
    const request: UserTicketRequest = {
      userId: 10,
      ticketId: 5,
      quantity: 2,
    };
    const result = buildInsertUserTicketQuery(request);

    // Verify SQL structure
    expect(result.sql).toContain('insert into user_ticket');
    expect(result.sql).toContain('user_id, ticket_id, unit_price, ticket_amount');
    expect(result.sql.toLowerCase()).toContain('select');
    expect(result.sql).toContain('from ticket');
    expect(result.sql).toContain('where id = ?');
  });

  it('should include all required columns in INSERT', () => {
    const request: UserTicketRequest = {
      userId: 1,
      ticketId: 2,
      quantity: 1,
    };
    const result = buildInsertUserTicketQuery(request);

    expect(result.sql).toContain('user_id');
    expect(result.sql).toContain('ticket_id');
    expect(result.sql).toContain('unit_price');
    expect(result.sql).toContain('ticket_amount');
  });

  it('should select price from ticket table', () => {
    const request: UserTicketRequest = {
      userId: 3,
      ticketId: 4,
      quantity: 3,
    };
    const result = buildInsertUserTicketQuery(request);

    expect(result.sql.toLowerCase()).toContain('select ?, ?, price, ? from ticket');
  });

  it('should include correct parameters in correct order', () => {
    const request: UserTicketRequest = {
      userId: 10,
      ticketId: 5,
      quantity: 2,
    };
    const result = buildInsertUserTicketQuery(request);

    // Parameters should be: [userId, ticketId, quantity, ticketId]
    expect(result.params).toEqual([10, 5, 2, 5]);
    expect(result.params.length).toBe(4);
  });

  it('should have exactly 4 placeholders matching params length', () => {
    const request: UserTicketRequest = {
      userId: 1,
      ticketId: 2,
      quantity: 1,
    };
    const result = buildInsertUserTicketQuery(request);

    const placeholderCount = (result.sql.match(/\?/g) || []).length;
    expect(placeholderCount).toBe(4);
    expect(placeholderCount).toBe(result.params.length);
  });

  it('should return QueryResult with sql and params', () => {
    const request: UserTicketRequest = {
      userId: 1,
      ticketId: 1,
      quantity: 1,
    };
    const result = buildInsertUserTicketQuery(request);

    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('params');
    expect(typeof result.sql).toBe('string');
    expect(Array.isArray(result.params)).toBe(true);
  });

  it('should handle different request values correctly', () => {
    const request1: UserTicketRequest = {
      userId: 1,
      ticketId: 10,
      quantity: 1,
    };
    const request2: UserTicketRequest = {
      userId: 999,
      ticketId: 888,
      quantity: 5,
    };

    const result1 = buildInsertUserTicketQuery(request1);
    const result2 = buildInsertUserTicketQuery(request2);

    // SQL should be the same (only params differ)
    expect(result1.sql).toBe(result2.sql);

    // Params should be different
    expect(result1.params).toEqual([1, 10, 1, 10]);
    expect(result2.params).toEqual([999, 888, 5, 888]);
  });

  it('should use ticketId twice in params (for WHERE clause)', () => {
    const request: UserTicketRequest = {
      userId: 100,
      ticketId: 50,
      quantity: 3,
    };
    const result = buildInsertUserTicketQuery(request);

    // ticketId should appear twice: once for selecting price, once for WHERE clause
    expect(result.params[1]).toBe(50); // ticketId in SELECT
    expect(result.params[3]).toBe(50); // ticketId in WHERE
    expect(result.params[1]).toBe(result.params[3]);
  });
});

describe('buildInsertUserTicketSQL', () => {
  it('should return SQL string without parameters', () => {
    const sql = buildInsertUserTicketSQL();

    expect(typeof sql).toBe('string');
    expect(sql.toLowerCase()).toContain('insert into user_ticket');
    expect(sql.toLowerCase()).toContain('select');
    expect(sql.toLowerCase()).toContain('from ticket');
  });

  it('should contain all required SQL keywords', () => {
    const sql = buildInsertUserTicketSQL();

    expect(sql).toContain('insert');
    expect(sql).toContain('into');
    expect(sql.toLowerCase()).toContain('select');
    expect(sql.toLowerCase()).toContain('from');
    expect(sql.toLowerCase()).toContain('where');
  });
});
