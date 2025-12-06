/**
 * Ticket Service
 * 
 * Business logic for ticket operations
 */

import { MySQLConnector } from '../../shared/database';
import { GetTicketsQuery, SimplifiedTicket, Ticket, TicketSchema, StringifiedTicket } from './ticket.types';
import { buildAvailableTicketsCountQuery, buildAvailableTicketsSelectQuery } from './queries/get-tickets.query';
import { buildTicketByIdQuery } from './queries/get-ticket-by-id.query';
import { OrderByConfig } from '../../shared/types';
import { Validator } from '../../shared/validator';
import { createZodValidator, convertValidationErrorToInvalidRequestError } from '../../shared/validator';

export class TicketService {
  private ticketsValidator: Validator<Ticket>;

  constructor(private readonly db: MySQLConnector) {
    this.ticketsValidator = createZodValidator<Ticket>(TicketSchema, convertValidationErrorToInvalidRequestError);
  }

  /**
   * Get all available tickets with optional filtering
   */
  async getAllAvailableTickets(query: GetTicketsQuery, orderBy?: OrderByConfig<SimplifiedTicket>[]): Promise<{
    tickets: SimplifiedTicket[];
    total: number;
  }> {
    const [tickets, total] = await Promise.all([
      this.queryTickets(query, orderBy),
      this.queryTicketsCount(query),
    ]);

    return {
      tickets,
      total,
    };
  }

  /**
   * Get total count of tickets matching the filters
   */
  private async queryTicketsCount(query: GetTicketsQuery): Promise<number> {
    const { sql, params } = buildAvailableTicketsCountQuery(query);
    const countResult = await this.db.queryOne<{ total: number }>(sql, params);
    return countResult?.total || 0;
  }

  /**
   * Get paginated tickets matching the filters
   */
  private async queryTickets(query: GetTicketsQuery, orderBy?: OrderByConfig<SimplifiedTicket>[]): Promise<SimplifiedTicket[]> {
    const { sql, params } = buildAvailableTicketsSelectQuery(query, orderBy);
    return this.db.query<SimplifiedTicket>(sql, params);
  }

  /**
   * Get a single ticket by ID with nested event and venue information
   * 
   * @param ticketId - The ticket ID to retrieve
   * @returns Ticket DTO with nested event and venue, or null if not found
   */
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    const { sql, params } = buildTicketByIdQuery(ticketId);
    const result = await this.db.queryOne<StringifiedTicket>(sql, params);
    if (!result) {
      return null;
    }
    return this.ticketsValidator.validate(result);
  }
}
