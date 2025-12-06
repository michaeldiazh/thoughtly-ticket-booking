/**
 * Event Controller
 * 
 * Handles HTTP requests for event endpoints
 */

import { Request, Response } from 'express';
import { GetEventsQuery, getEventsQueryErrorConverter, GetEventsQuerySchema } from '../domain/dtos';
import { buildSucceededPaginatedResponse, buildSucceededSingleResponse } from '../../../domain/common.dto';
import { handleError, stringifyQueryParams, parsePositiveInt } from '../../../shared/utils';
import { Validator } from '../../../shared/validator';
import { createZodValidator } from '../../../shared/validator';
import { EventService } from '../service/event.service';

export class EventController {
    private getEventsValidator: Validator<GetEventsQuery>;
    constructor(private readonly eventService: EventService){
        this.getEventsValidator = createZodValidator<GetEventsQuery>(GetEventsQuerySchema, getEventsQueryErrorConverter);
    }
  /**
   * GET /api/v1/event
   * Get all events with optional filtering
   */
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      // Parse and validate query parameters
      const queryParams = this.parseQueryParams(req.query);
      const result = await this.eventService.getEvents(queryParams);
      res.status(200)
        .json(
          buildSucceededPaginatedResponse(result.events, queryParams.limit, queryParams.offset, result.total)
        );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * GET /api/v1/event/:id
   * Get a single event by ID with nested venue and tier information
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parsePositiveInt(req.params.id, 'id');

      // Call event service to get event
      const event = await this.eventService.getEventById(eventId);

      res.status(200)
        .json(
          buildSucceededSingleResponse(event)
        );
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Parse and validate query parameters using Zod
   * Throws InvalidQueryParameterError if validation fails
   */
  private parseQueryParams(query: any): GetEventsQuery {
    const stringifiedQuery = stringifyQueryParams(query);
    // getEventsValidator will throw InvalidQueryParameterError if validation fails
    return this.getEventsValidator.validate(stringifiedQuery);
  }
}
