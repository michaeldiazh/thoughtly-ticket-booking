/**
 * Get User By ID Query
 * 
 * Raw SQL query for GET /user/:id endpoint
 */

import { QueryResult } from '../../../shared/types';

/**
 * Build SELECT query for a single user by ID
 * @param userId - The user ID to query
 * @returns QueryResult with SQL and parameters
 */
export function getUserByIdQuery(userId: number): QueryResult {
  return {
    sql: `
      SELECT 
        id,
        first_name AS 'firstName',
        last_name AS 'lastName',
        address,
        city,
        region,
        country_code AS 'countryCode',
        timezone
      FROM user
      WHERE id = ?
    `.trim(),
    params: [userId],
  };
}
