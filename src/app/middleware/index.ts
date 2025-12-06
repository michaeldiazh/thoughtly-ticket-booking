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
  // JSON body parser
  app.use(express.json());
}
