/**
 * Ticket Controller
 * 
 * Handles HTTP requests for ticket endpoints
 */

import { Request, Response } from 'express';
import { APIResponse, GetTicketsQuery, getTicketsQueryErrorConverter, GetTicketsQuerySchema } from '../../domain/dtos';
import { SimplifiedTicket } from '../../domain/dtos/simplified-ticket.dto';
import { handleError, stringifyQueryParams } from '../utils';
import { Validator } from '../../domain/validator/validator.interface';
import { createZodValidator } from '../../domain/validator/zod-validator.factory';
import { TicketService } from '../../service/ticket.service';

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
   * Parse and validate query parameters using Zod
   * Throws InvalidQueryParameterError if validation fails
   */
  private parseQueryParams(query: any): GetTicketsQuery {
    const stringifiedQuery = stringifyQueryParams(query);
    // getTicketsValidator will throw InvalidQueryParameterError if validation fails
    return this.getTicketsValidator.validate(stringifiedQuery);
  }
}

