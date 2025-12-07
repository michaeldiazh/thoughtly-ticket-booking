/**
 * Middleware Setup
 * 
 * Configures Express middleware
 */

import express, { Express } from 'express';

/**
 * Sets up all Express middleware
 * @param app - Express application instance
 */
export function setupMiddleware(app: Express): void {
  // CORS middleware - allow requests from frontend
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  // JSON body parser
  app.use(express.json());
}
