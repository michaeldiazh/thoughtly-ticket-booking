/**
 * Thoughtly Ticket Booking System
 * Main entry point for the backend server
 */

// Load environment variables from .env file
import 'dotenv/config';

import express, { Express } from 'express';
import { createTicketRoutes } from './api/routes/ticket.routes';
import { TicketController } from './api/controllers/ticket.controller';
import { TicketService } from './service/ticket.service';
import { MySQLConnector, MySQLConfig } from './service/database';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dependency Injection Setup
const dbConfig: MySQLConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thoughtly_ticket_booking',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
};

const db = new MySQLConnector(dbConfig);
const ticketService = new TicketService(db);
const ticketController = new TicketController(ticketService);

// Routes
app.use('/api/v1/ticket', createTicketRoutes(ticketController));

// Start server
app.listen(Number(PORT), (err: Error | undefined) => {
  if(!!err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log('Thoughtly Ticket Booking System');
  console.log(`Server running on http://localhost:${PORT}`);
});

