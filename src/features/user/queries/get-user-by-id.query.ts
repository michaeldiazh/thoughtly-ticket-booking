/**
 * Get User By ID Query
 * 
 * Raw SQL query for GET /user/:id endpoint
 */

import { QueryResult } from '../../../shared/types';

/**
 * Build SELECT query for a single user by ID with user tickets
 * @param userId - The user ID to query
 * @returns QueryResult with SQL and parameters
 */
export function getUserByIdQuery(userId: number): QueryResult {
  return {
    sql: buildGetUserByIdSql(),
    params: [userId],
  };
}

/**
 * Build the SQL query for getting a user by ID with user tickets
 */
const buildGetUserByIdSql = (): string => {
  return `
    SELECT 
      u.id,
      u.first_name AS 'firstName',
      u.last_name AS 'lastName',
      u.address,
      u.city,
      u.region,
      u.country_code AS 'countryCode',
      u.timezone,
      ${buildUserTicketsJSONArray()}
    FROM user u
    LEFT JOIN user_ticket ut ON u.id = ut.user_id
    LEFT JOIN ticket t ON ut.ticket_id = t.id
    LEFT JOIN price_tier pt ON pt.code = t.tier_code
    LEFT JOIN event e ON t.event_id = e.id
    LEFT JOIN venue v ON e.venue_id = v.id
    WHERE u.id = ?
    GROUP BY u.id
  `.trim();
};

/**
 * Build JSON_ARRAYAGG SQL for user tickets information
 * Returns SQL fragment for user tickets JSON array
 * COALESCE converts NULL (when user has no tickets) to empty array
 */
const buildUserTicketsJSONArray = (): string => {
  return `COALESCE(
    JSON_ARRAYAGG(
      ${buildUserTicketJSONObject()}
    ),
    JSON_ARRAY()
  ) AS userTickets`;
};

/**
 * Build JSON_OBJECT SQL for user ticket information
 * Returns SQL fragment for user ticket JSON object with all ticket fields
 */
const buildUserTicketJSONObject = (): string => {
  return `JSON_OBJECT(
    'userTicketId', ut.id,
    'eventName', e.name,
    'venueName', v.name,
    'tier', pt.display_name,
    'ticketAmount', ut.ticket_amount,
    'totalPrice', ut.unit_price * ut.ticket_amount,
    'datePurchased', DATE_FORMAT(ut.date_purchased, '%Y-%m-%dT%H:%i:%sZ')
  )`;
};
