/**
 * Routes Setup
 * 
 * Configures all application routes
 */

import { Express } from 'express';
import { TicketController } from '../features/ticket';
import { UserTicketController } from '../features/user-ticket';
import { createTicketRoutes } from '../features/ticket';
import { createUserTicketRoutes } from '../features/user-ticket';

/**
 * Sets up all application routes
 * @param app - Express application instance
 * @param ticketController - Ticket controller instance
 * @param userTicketController - User ticket controller instance
 */
export function setupRoutes(
  app: Express,
  ticketController: TicketController,
  userTicketController: UserTicketController
): void {
  // Ticket routes
  app.use('/api/v1/ticket', createTicketRoutes(ticketController));
  
  // User ticket routes
  app.use('/api/v1/user/ticket', createUserTicketRoutes(userTicketController));
}
