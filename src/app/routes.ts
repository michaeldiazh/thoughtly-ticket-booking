/**
 * Routes Setup
 * 
 * Configures all application routes
 */

import { Express } from 'express';
import { TicketController } from '../features/ticket';
import { UserTicketController } from '../features/user-ticket';
import { EventController } from '../features/event';
import { UserController } from '../features/user';
import { createTicketRoutes } from '../features/ticket';
import { createUserTicketRoutes } from '../features/user-ticket';
import { createEventRoutes } from '../features/event';
import { createUserRoutes } from '../features/user';

/**
 * Sets up all application routes
 * @param app - Express application instance
 * @param ticketController - Ticket controller instance
 * @param userTicketController - User ticket controller instance
 * @param eventController - Event controller instance
 * @param userController - User controller instance
 */
export function setupRoutes(
  app: Express,
  ticketController: TicketController,
  userTicketController: UserTicketController,
  eventController: EventController,
  userController: UserController
): void {
  // Ticket routes
  app.use('/api/v1/ticket', createTicketRoutes(ticketController));
  
  // User ticket routes
  app.use('/api/v1/user/ticket', createUserTicketRoutes(userTicketController));
  
  // Event routes
  app.use('/api/v1/event', createEventRoutes(eventController));
  
  // User routes
  app.use('/api/v1/user', createUserRoutes(userController));
}
