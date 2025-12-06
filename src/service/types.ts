/**
 * Service Layer Types
 * 
 * Shared types used across service layer
 */

/**
 * Filter result containing condition and params
 */
export interface FilterResult {
  condition: string;
  params: any[];
}

/**
 * Generic type for query filter maps
 * Maps query field keys to filter functions that return FilterResult
 */
export type QueryFilterMap<T> = {
  [K in keyof T]?: (value: T[K]) => FilterResult;
};

/**
 * Generic order by configuration
 */
export interface OrderByConfig<T> {
  key: keyof T;
  op: 'ASC' | 'DESC';
}

/**
 * SQL query result containing the query string and parameters
 */
export interface QueryResult {
  sql: string;
  params: any[];
}

/**
 * Data structure for building WHERE clause conditions and parameters
 */
export interface WhereParameterData {
  conditions: string[];
  params: any[];
}

