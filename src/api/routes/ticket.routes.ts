/**
 * Ticket Routes
 * 
 * Defines routes for ticket-related endpoints
 */

import express, { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';

const router: Router = express.Router();
const ticketController = new TicketController();

/**
 * GET /api/v1/ticket
 * Get all available tickets with optional filtering
 */
router.get('/', async (req, res) => {
  await ticketController.getTickets(req, res);
});

export default router;