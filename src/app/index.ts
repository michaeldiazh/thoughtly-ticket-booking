/**
 * Application Module
 * 
 * Exports application setup and configuration
 */

export { createApp } from './app';
export { setupMiddleware } from './middleware';
export { setupRoutes } from './routes';
export { createDatabaseConfig } from './config/database.config';
export { getServerPort } from './config/server.config';
