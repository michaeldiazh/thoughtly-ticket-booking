/**
 * Ticket Controller
 * 
 * Handles HTTP requests for ticket endpoints
 */

import { Request, Response } from 'express';
import { GetTicketsQuery, getTicketsQueryErrorConverter, GetTicketsQuerySchema } from '../domain/dtos';
import { Ticket } from '../domain/dtos';
import { buildSucceededPaginatedResponse, buildSucceededSingleResponse } from '../../../domain/common.dto';
import { handleError, stringifyQueryParams, parsePositiveInt } from '../../../shared/utils';
import { Validator } from '../../../shared/validator';
import { createZodValidator } from '../../../shared/validator';
import { TicketService } from '../service/ticket.service';
import { TicketNotFoundError } from '../../../domain/errors';

export class TicketController {
    private getTicketsValidator: Validator<GetTicketsQuery>;
    constructor(private readonly ticketService: TicketService){
        this.getTicketsValidator = createZodValidator<GetTicketsQuery>(GetTicketsQuerySchema, getTicketsQueryErrorConverter);
    }
  /**
   * GET /api/v1/ticket
   * Get all available tickets with optional filtering
   */
  async getTickets(req: Request, res: Response): Promise<void> {
    try {
      // Parse and validate query parameters
      const queryParams = this.parseQueryParams(req.query);
      const result = await this.ticketService.getAllAvailableTickets(queryParams);
      res.status(200)
        .json(
          buildSucceededPaginatedResponse(result.tickets, queryParams.limit, queryParams.offset, result.total)
        );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * GET /api/v1/ticket/:id
   * Get a single ticket by ID with nested event and venue information
   */
  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parsePositiveInt(req.params.id, 'id');

      // Call ticket service to get ticket
      const ticket = await this.ticketService.getTicketById(ticketId);

      if (!ticket) {
        throw new TicketNotFoundError(ticketId);
      }

      res.status(200)
        .json(
          buildSucceededSingleResponse(ticket)
        );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Parse and validate query parameters using Zod
   * Throws InvalidQueryParameterError if validation fails
   */
  private parseQueryParams(query: any): GetTicketsQuery {
    const stringifiedQuery = stringifyQueryParams(query);
    // getTicketsValidator will throw InvalidQueryParameterError if validation fails
    return this.getTicketsValidator.validate(stringifiedQuery);
  }
}

