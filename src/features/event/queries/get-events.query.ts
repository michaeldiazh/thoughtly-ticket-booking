/**
 * Get Events Query Builder
 * 
 * Raw SQL queries for GET /event endpoint
 */

import { GetEventsQuery, EventListItem } from '../domain/dtos';
import { QueryFilterMap, OrderByConfig, QueryResult, WhereParameterData } from '../../../shared/types';

/**
 * Build COUNT query for events
 */
export function buildEventsCountQuery(query: GetEventsQuery): QueryResult {
  const whereParameterData = buildEventsWhereClause(query);
  return {
    sql: buildCountSql(whereParameterData),
    params: whereParameterData.params,
  };
}

const buildCountSql = (whereParameterData: WhereParameterData): string => {
  return `
    SELECT COUNT(*) as total
    FROM event e
    INNER JOIN venue v ON e.venue_id = v.id
    ${whereParameterData.conditions.length > 0 ? `WHERE ${whereParameterData.conditions.join(' AND ')}` : ''}
  `.trim();
}

/**
 * Build SELECT query for events with pagination
 */
export function buildEventsSelectQuery(
  query: GetEventsQuery,
  orderBy?: OrderByConfig<EventListItem>[]
): QueryResult {
  const whereParameterData: WhereParameterData = buildEventsWhereClause(query);
  const {limit, offset} = query;
  return {
    sql: buildSelectSql(whereParameterData, orderBy),
    params: [...whereParameterData.params, limit, offset],
  };
}

const buildSelectSql = (
  whereParameterData: WhereParameterData,
  orderBy?: OrderByConfig<EventListItem>[]
): string => {
  const whereClause: string = whereParameterData.conditions.length > 0 ? `WHERE ${whereParameterData.conditions.join(' AND ')}` : '';
  const orderByClause = buildOrderByClause(orderBy);
  return `
    SELECT 
      e.id,
      e.name,
      e.description,
      DATE_FORMAT(e.start_time, '%Y-%m-%dT%H:%i:%sZ') AS startTime,
      DATE_FORMAT(e.end_time, '%Y-%m-%dT%H:%i:%sZ') AS endTime,
      v.name AS venueName,
      v.city AS venueCity,
      v.country_code AS venueCountryCode,
      v.timezone AS venueTimezone
    FROM event e
    INNER JOIN venue v ON e.venue_id = v.id
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `.trim();
}

/**
 * Build WHERE clause data from query parameters
 */
function buildEventsWhereClause(query: GetEventsQuery): WhereParameterData {
  const whereData: WhereParameterData = {
    conditions: [],
    params: [],
  };

  // Filter functions for each query field - return condition and params
  // Type-safe: each function receives the correct value type from GetEventsQuery[K]
  // Zod has already validated the values
  // Note: These functions are only called when value is defined (checked before calling)
  const filterMap: QueryFilterMap<GetEventsQuery> = {
    eventIds: (eventIds) => ({
      condition: `e.id IN (${eventIds!.map(() => '?').join(',')})`,
      params: eventIds!,
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
  (Object.keys(query) as Array<keyof GetEventsQuery>).forEach((key) => {
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
const DEFAULT_ORDER_BY: OrderByConfig<EventListItem>[] = [
  { key: 'startTime', op: 'ASC' },
  { key: 'id', op: 'ASC' },
];

/**
 * Build ORDER BY clause from orderBy configuration
 */
function buildOrderByClause(orderBy?: OrderByConfig<EventListItem>[]): string {
  // Use default if orderBy is undefined or empty array
  const orderByConfig = orderBy && orderBy.length > 0 ? orderBy : DEFAULT_ORDER_BY;

  // Column mapping functions for each orderable field
  // Type-safe: each function receives the correct key from EventListItem
  const columnMap: Record<keyof EventListItem, () => string> = {
    id: () => 'e.id',
    name: () => 'e.name',
    description: () => 'e.description',
    startTime: () => 'e.start_time',
    endTime: () => 'e.end_time',
    venueName: () => 'v.name',
    venueCity: () => 'v.city',
    venueCountryCode: () => 'v.country_code',
    venueTimezone: () => 'v.timezone',
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
