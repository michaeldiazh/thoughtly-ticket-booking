/**
 * Database Configuration
 * 
 * Centralized database configuration management
 */

import { MySQLConfig } from '../../shared/database';

/**
 * Creates database configuration from environment variables
 * @returns MySQLConfig object
 */
export function createDatabaseConfig(): MySQLConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'thoughtly_ticket_booking',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  };
}
