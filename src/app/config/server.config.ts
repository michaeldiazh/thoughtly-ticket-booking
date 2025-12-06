/**
 * Server Configuration
 * 
 * Centralized server configuration management
 */

/**
 * Gets the server port from environment variables
 * @returns Port number (default: 3000)
 */
export function getServerPort(): number {
  return parseInt(process.env.PORT || '3000', 10);
}
