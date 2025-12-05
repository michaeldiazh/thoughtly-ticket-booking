/**
 * Thoughtly Ticket Booking System
 * Main entry point for the backend server
 */

import express, { Express } from 'express';
import ticketRoutes from './api/routes/ticket.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/ticket', ticketRoutes);

// Start server
app.listen(PORT, () => {
  console.log('Thoughtly Ticket Booking System');
  console.log(`Server running on http://localhost:${PORT}`);
});

