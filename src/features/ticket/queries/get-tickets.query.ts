/**
 * Get Tickets Query Builder
 * 
 * Raw SQL queries for GET /tickets endpoint
 */

import { GetTicketsQuery, SimplifiedTicket } from '../ticket.types';
import { QueryFilterMap, OrderByConfig, QueryResult, WhereParameterData } from '../../../shared/types';

/**
 * Build COUNT query for tickets
 */
export function buildAvailableTicketsCountQuery(query: GetTicketsQuery): QueryResult {
  const whereParameterData = buildAvailableTicketsWhereClause(query);
  return {
    sql: buildCountSql(whereParameterData),
    params: whereParameterData.params,
  };
}


const buildCountSql = (whereParameterData: WhereParameterData): string => {
  return `
    SELECT COUNT(*) as total
    FROM ticket t
    INNER JOIN event e ON t.event_id = e.id
    INNER JOIN venue v ON e.venue_id = v.id
    ${whereParameterData.conditions.length > 0 ? `WHERE ${whereParameterData.conditions.join(' AND ')}` : ''}
  `;
}


/**
 * Build SELECT query for tickets with pagination
 */
export function buildAvailableTicketsSelectQuery(
  query: GetTicketsQuery,
  orderBy?: OrderByConfig<SimplifiedTicket>[]
): QueryResult {
  const whereParameterData: WhereParameterData = buildAvailableTicketsWhereClause(query);
  const {limit, offset} = query;
  return {
    sql: buildSelectSql(whereParameterData, orderBy),
    params: [...whereParameterData.params, limit, offset],
  };
}

const buildSelectSql = (
  whereParameterData: WhereParameterData,
  orderBy?: OrderByConfig<SimplifiedTicket>[]
): string => {
  const whereClause: string = whereParameterData.conditions.length > 0 ? `WHERE ${whereParameterData.conditions.join(' AND ')}` : '';
  const orderByClause = buildOrderByClause(orderBy);
  return `
    SELECT 
      t.id,
      e.name as eventName,
      pt.display_name as tierDisplayName,
      t.remaining,
      t.price,
      v.name as venueName,
      v.city as venueCity,
      v.country_code as venueCountryCode,
      DATE_FORMAT(e.start_time, '%Y-%m-%dT%H:%i:%sZ') as eventStartTime
    FROM ticket t
    INNER JOIN event e ON t.event_id = e.id
    INNER JOIN venue v ON e.venue_id = v.id
    INNER JOIN price_tier pt ON t.tier_code = pt.code
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `.trim();
}

/**
 * Build WHERE clause data from query parameters
 */
function buildAvailableTicketsWhereClause(query: GetTicketsQuery): WhereParameterData {
  const whereData: WhereParameterData = {
    conditions: [],
    params: [],
  };

  // Filter functions for each query field - return condition and params
  // Type-safe: each function receives the correct value type from GetTicketsQuery[K]
  // Zod has already validated the values (arrays have min(1), so they're non-empty if present)
  // Note: These functions are only called when value is defined (checked before calling)
  const filterMap: QueryFilterMap<GetTicketsQuery> = {
    ticketIds: (ticketIds) => ({
      condition: `t.id IN (${ticketIds!.map(() => '?').join(',')})`,
      params: ticketIds!,
    }),
    tierCodes: (tierCodes) => ({
      condition: `t.tier_code IN (${tierCodes!.map(() => '?').join(',')})`,
      params: tierCodes!,
    }),
    eventName: (eventName) => ({
      condition: 'e.name LIKE ?',
      params: [`%${eventName}%`],
    }),
    eventStartDate: (eventStartDate) => ({
      condition: 'e.start_time >= ?',
      params: [eventStartDate],
    }),
    eventEndDate: (eventEndDate) => ({
      condition: 'e.end_time <= ?',
      params: [eventEndDate],
    }),
    venueName: (venueName) => ({
      condition: 'v.name LIKE ?',
      params: [`%${venueName}%`],
    }),
    venueCountryCode: (venueCountryCode) => ({
      condition: 'v.country_code = ?',
      params: [venueCountryCode],
    }),
  };

  // Apply filters using Object.entries with type-safe access
  (Object.keys(query) as Array<keyof GetTicketsQuery>).forEach((key) => {
    // Skip limit and offset as they're not WHERE clause filters
    if (key === 'limit' || key === 'offset') {
      return;
    }

    const filterFn = filterMap[key];
    const value = query[key];
    
    // Only apply filter if value is defined (Zod ensures it's valid if present)
    if (filterFn && value !== undefined) {
      const result = filterFn(value as any);
      whereData.conditions.push(result.condition);
      whereData.params.push(...result.params);
    }
  });

  return whereData;
}

/**
 * Default order by configuration
 */
const DEFAULT_ORDER_BY: OrderByConfig<SimplifiedTicket>[] = [
  { key: 'eventStartTime', op: 'ASC' },
  { key: 'id', op: 'ASC' },
];

/**
 * Build ORDER BY clause from orderBy configuration
 */
function buildOrderByClause(orderBy?: OrderByConfig<SimplifiedTicket>[]): string {
  // Use default if orderBy is undefined or empty array
  const orderByConfig = orderBy && orderBy.length > 0 ? orderBy : DEFAULT_ORDER_BY;

  // Column mapping functions for each orderable field
  // Type-safe: each function receives the correct key from SimplifiedTicket
  const columnMap: Record<keyof SimplifiedTicket, () => string> = {
    id: () => 't.id',
    eventName: () => 'e.name',
    tierDisplayName: () => 'pt.display_name',
    remaining: () => 't.remaining',
    price: () => 't.price',
    venueName: () => 'v.name',
    venueCity: () => 'v.city',
    venueCountryCode: () => 'v.country_code',
    eventStartTime: () => 'e.start_time',
  };

  const orderByParts = orderByConfig.map(({ key, op }) => {
    const getColumn = columnMap[key];
    if (!getColumn) {
      throw new Error(`Invalid orderBy key: ${String(key)}`);
    }
    const column = getColumn();
    return `${column} ${op}`;
  });

  return `ORDER BY ${orderByParts.join(', ')}`;
}
