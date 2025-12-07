/**
 * Get Users Query
 * 
 * Raw SQL query for GET /user endpoint
 */

import { QueryResult } from '../../../shared/types';

/**
 * Build SELECT query for all users (simplified)
 */
export function getUsersQuery(): QueryResult {
  return {
    sql: `
      SELECT 
        id,
        first_name AS 'firstName',
        last_name AS 'lastName',
        city,
        country_code AS 'countryCode'
      FROM user
    `.trim(),
    params: [],
  };
}
