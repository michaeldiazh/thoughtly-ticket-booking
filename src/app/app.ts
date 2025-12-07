/**
 * Express Application Setup
 * 
 * Creates and configures the Express application
 */

import express, { Express } from 'express';
import { MySQLConnector } from '../shared/database';
import { TicketService, TicketController } from '../features/ticket';
import { UserTicketService, UserTicketController } from '../features/user-ticket';
import { EventService, EventController } from '../features/event';
import { UserService, UserController } from '../features/user';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { createDatabaseConfig } from './config/database.config';

/**
 * Creates and configures the Express application
 * @returns Configured Express application instance
 */
export function createApp(): Express {
  const app: Express = express();

  // Setup middleware
  setupMiddleware(app);

  // Setup dependency injection
  const dbConfig = createDatabaseConfig();
  const db = new MySQLConnector(dbConfig);

  // Initialize services
  const ticketService = new TicketService(db);
  const ticketController = new TicketController(ticketService);

  const userTicketService = new UserTicketService(db);
  const userTicketController = new UserTicketController(userTicketService);

  const eventService = new EventService(db);
  const eventController = new EventController(eventService);

  const userService = new UserService(db);
  const userController = new UserController(userService);

  // Setup routes
  setupRoutes(app, ticketController, userTicketController, eventController, userController);

  return app;
}
