/**
 * Event Routes
 * 
 * Defines routes for event-related endpoints
 */

import express, { Router } from 'express';
import { EventController } from './event.controller';

/**
 * Create event routes with dependency injection
 * @param eventController - The event controller instance
 * @returns Express router with event routes
 */
export function createEventRoutes(eventController: EventController): Router {
  const router: Router = express.Router();

  /**
   * GET /api/v1/event
   * Get all events with optional filtering
   */
  router.get('/', async (req, res) => {
    await eventController.getEvents(req, res);
  });

  /**
   * GET /api/v1/event/:id
   * Get a single event by ID with nested venue and tier information
   */
  router.get('/:id', async (req, res) => {
    await eventController.getEventById(req, res);
  });

  return router;
}
