/**
 * Ticket Service
 * 
 * Business logic for ticket operations
 */

import { MySQLConnector } from './database';
import { GetTicketsQuery } from '../domain/dtos';
import { SimplifiedTicket } from '../domain/dtos/ticket/simplified-ticket.dto';
import { Ticket, TicketSchema, ticketErrorConverter, StringifiedTicket } from '../domain/dtos/ticket/ticket.dto';
import { buildAvailableTicketsCountQuery, buildAvailableTicketsSelectQuery } from './query/ticket/get-tickets.query';
import { buildTicketByIdQuery } from './query/ticket/get-ticket-by-id.query';
import { OrderByConfig } from './types';
import { Validator } from '../domain/validator/validator.interface';
import { createZodValidator } from '../domain/validator/zod-validator.factory';

export class TicketService {
  private ticketsValidator: Validator<Ticket>;

  constructor(private readonly db: MySQLConnector) {
    this.ticketsValidator = createZodValidator<Ticket>(TicketSchema, ticketErrorConverter);
  }

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

  /**
   * Get a single ticket by ID with nested event and venue information
   * 
   * @param ticketId - The ticket ID to retrieve
   * @returns Ticket DTO with nested event and venue, or null if not found
   */
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    const { sql, params } = buildTicketByIdQuery(ticketId);
    const result = await this.db.queryOne< {
      id: number;
      eventId: number;
      tierCode: string;
      tierDisplayName: string;
      capacity: number;
      remaining: number;
      price: number;
      createdAt: string;
      lastUpdated: string;
      event: string}>(sql, params);

    if (!result) {
      return null;
    }

    // Preprocessing (JSON parsing) is handled by TicketSchema
    // Validate the ticket data before returning
    return this.ticketsValidator.validate(result);
  }
}
