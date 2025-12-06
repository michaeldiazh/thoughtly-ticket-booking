/**
 * Get Ticket By ID Query Builder
 * 
 * Raw SQL query for GET /tickets/:id endpoint
 */

import { QueryResult } from '../../../shared/types';

/**
 * Build SELECT query for a single ticket by ID
 * Returns ticket with nested event and venue information as JSON
 * 
 * @param ticketId - The ticket ID to query
 * @returns QueryResult with SQL and parameters
 */
export const buildTicketByIdQuery = (ticketId: number): QueryResult => {
  return {
    sql: buildTicketByIdSql(),
    params: [ticketId],
  };
};

/**
 * Build JSON_OBJECT SQL for venue information
 * Returns SQL fragment for venue JSON object with all venue fields
 */
const buildVenueJSONObject = (): string => {
  return `JSON_OBJECT(
    'id', v.id,
    'name', v.name,
    'address', v.address,
    'city', v.city,
    'region', v.region,
    'countryCode', v.country_code,
    'timezone', v.timezone
  )`;
};

/**
 * Build JSON_OBJECT SQL for event information with nested venue
 * Returns SQL fragment for event JSON object with all event fields and nested venue
 */
const buildEventJSONObject = (): string => {
  return `JSON_OBJECT(
    'id', e.id,
    'name', e.name,
    'description', e.description,
    'startTime', DATE_FORMAT(e.start_time, '%Y-%m-%dT%H:%i:%sZ'),
    'endTime', DATE_FORMAT(e.end_time, '%Y-%m-%dT%H:%i:%sZ'),
    'venue', ${buildVenueJSONObject()}
  )`;
};

/**
 * Build the SQL query for getting a ticket by ID
 */
const buildTicketByIdSql = (): string => {
  return `
    SELECT 
      t.id,
      pt.code AS tierCode,
      pt.display_name AS tierDisplayName,
      t.capacity,
      t.remaining,
      t.price,
      DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt,
      DATE_FORMAT(t.last_updated, '%Y-%m-%dT%H:%i:%sZ') AS lastUpdated,
      ${buildEventJSONObject()} AS event
    FROM ticket t
    INNER JOIN price_tier pt ON pt.code = t.tier_code
    INNER JOIN event e ON t.event_id = e.id
    INNER JOIN venue v ON e.venue_id = v.id
    WHERE t.id = ?
  `.trim();
};
