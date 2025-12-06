/**
 * Server Bootstrap
 * 
 * Starts the HTTP server
 */

import { createApp } from './app';
import { getServerPort } from './config/server.config';

// Load environment variables
import 'dotenv/config';

// Create Express app
const app = createApp();

// Get server port
const PORT = getServerPort();

// Start server
app.listen(PORT, (err: Error | undefined) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log('Thoughtly Ticket Booking System');
  console.log(`Server running on http://localhost:${PORT}`);
});
