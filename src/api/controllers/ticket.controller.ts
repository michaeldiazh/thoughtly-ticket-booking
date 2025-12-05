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

export class TicketController {
    private getTicketsValidator: Validator<GetTicketsQuery>;
    constructor(){
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
      
      // TODO: Call ticket service to get tickets
      // const result = await this.ticketService.getAllAvailableTickets(queryParams);
      
      // Placeholder response for now
      const response: APIResponse<SimplifiedTicket[]> = {
        status: 'OK',
        data: [],
        perPage: queryParams.limit,
        offset: queryParams.offset,
        total: 0,
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

