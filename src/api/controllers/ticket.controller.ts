/**
 * Ticket Controller
 * 
 * Handles HTTP requests for ticket endpoints
 */

import { Request, Response } from 'express';
import { APIResponse, buildSucceededPaginatedResponse, GetTicketsQuery, getTicketsQueryErrorConverter, GetTicketsQuerySchema, Ticket } from '../../domain/dtos';
import { SimplifiedTicket } from '../../domain/dtos/ticket/simplified-ticket.dto';
import { handleError, stringifyQueryParams, parsePositiveInt } from '../utils';
import { Validator } from '../../domain/validator/validator.interface';
import { createZodValidator } from '../../domain/validator/zod-validator.factory';
import { TicketService } from '../../service/ticket.service';
import { InvalidRequestError, TicketNotFoundError } from '../../domain/errors';

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

      const response: APIResponse<Ticket> = {
        status: 'OK',
        data: ticket,
      };

      res.status(200).json(response);
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

