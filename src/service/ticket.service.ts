/**
 * Ticket Service
 * 
 * Business logic for ticket operations
 */

import { MySQLConnector } from './database';
import { GetTicketsQuery } from '../domain/dtos';
import { SimplifiedTicket } from '../domain/dtos/simplified-ticket.dto';
import { buildAvailableTicketsCountQuery, buildAvailableTicketsSelectQuery } from './query/ticket/get-tickets.query';
import { OrderByConfig } from './types';

export class TicketService {
  constructor(private readonly db: MySQLConnector) {}

  /**
   * Get all available tickets with optional filtering
   */
  async getAllAvailableTickets(query: GetTicketsQuery, orderBy?: OrderByConfig<SimplifiedTicket>[]): Promise<{
    tickets: SimplifiedTicket[];
    total: number;
  }> {
    const [tickets, total] = await Promise.all([
      this.getTicketsQuery(query, orderBy),
      this.getTicketsCount(query),
    ]);

    return {
      tickets,
      total,
    };
  }

  /**
   * Get total count of tickets matching the filters
   */
  private async getTicketsCount(query: GetTicketsQuery): Promise<number> {
    const { sql, params } = buildAvailableTicketsCountQuery(query);
    const countResult = await this.db.queryOne<{ total: number }>(sql, params);
    return countResult?.total || 0;
  }

  /**
   * Get paginated tickets matching the filters
   */
  private async getTicketsQuery(query: GetTicketsQuery, orderBy?: OrderByConfig<SimplifiedTicket>[]): Promise<SimplifiedTicket[]> {
    const { sql, params } = buildAvailableTicketsSelectQuery(query, orderBy);
    return this.db.query<SimplifiedTicket>(sql, params);
  }
}
