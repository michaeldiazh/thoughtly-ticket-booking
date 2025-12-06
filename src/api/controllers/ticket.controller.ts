/**
 * Ticket Controller
 * 
 * Handles HTTP requests for ticket endpoints
 */

import { Request, Response } from 'express';
import { APIResponse, GetTicketsQuery, getTicketsQueryErrorConverter, GetTicketsQuerySchema, Ticket } from '../../domain/dtos';
import { SimplifiedTicket } from '../../domain/dtos/ticket/simplified-ticket.dto';
import { handleError, stringifyQueryParams } from '../utils';
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
      
      // Call ticket service to get tickets
      const result = await this.ticketService.getAllAvailableTickets(queryParams);
      
      const response: APIResponse<SimplifiedTicket[]> = {
        status: 'OK',
        data: result.tickets,
        perPage: queryParams.limit,
        offset: queryParams.offset,
        total: result.total,
      };
      
      res.status(200).json(response);
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
      // Parse ticket ID from route parameters
      const ticketId = parseInt(req.params.id, 10);
      
      // Validate ticket ID
      if (isNaN(ticketId) || ticketId <= 0) {
        throw new InvalidRequestError({
          id: {
            issue: 'Invalid ticket ID. Must be a positive integer.',
            detail: 'The ticket ID must be a valid positive integer.',
          },
        });
      }

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

