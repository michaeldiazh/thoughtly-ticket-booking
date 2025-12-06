/**
 * Shared Types
 * 
 * Types used across multiple features
 */

/**
 * SQL query result containing the query string and parameters
 */
export interface QueryResult {
  sql: string;
  params: any[];
}
