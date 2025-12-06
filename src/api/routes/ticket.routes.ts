/**
 * Ticket Routes
 * 
 * Defines routes for ticket-related endpoints
 */

import express, { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';

/**
 * Create ticket routes with dependency injection
 * @param ticketController - The ticket controller instance
 * @returns Express router with ticket routes
 */
export function createTicketRoutes(ticketController: TicketController): Router {
  const router: Router = express.Router();

  /**
   * GET /api/v1/ticket
   * Get all available tickets with optional filtering
   */
  router.get('/', async (req, res) => {
    await ticketController.getTickets(req, res);
  });

  /**
   * GET /api/v1/ticket/:id
   * Get a single ticket by ID with nested event and venue information
   */
  router.get('/:id', async (req, res) => {
    await ticketController.getTicketById(req, res);
  });

  return router;
}