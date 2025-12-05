/**
 * Validation-related error classes
 */

import { AppError } from './base.error';

/**
 * Field validation issue structure
 */
export interface FieldIssue {
  issue: string;
  detail: unknown;
}

/**
 * Map of field names to their validation issues
 */
export type FieldIssues = {
  [fieldName: string]: FieldIssue;
};

/**
 * Error thrown when request validation fails
 * Supports multiple fields with different issues
 */
export class InvalidRequestError extends AppError {
  constructor(fieldIssues: FieldIssues) {
    const fieldNames = Object.keys(fieldIssues);
    const message = fieldNames.length === 1
      ? `Invalid request parameter: ${fieldNames[0]}`
      : `Invalid request parameters: ${fieldNames.join(', ')}`;

    super(
      'INVALID_REQUEST',
      message,
      fieldIssues
    );
  }
}

/**
 * Error thrown when query parameter validation fails
 * Supports multiple parameters with different issues
 */
export class InvalidQueryParameterError extends AppError {
  constructor(fieldIssues: FieldIssues) {
    const fieldNames = Object.keys(fieldIssues);
    const message = fieldNames.length === 1
      ? `Invalid query parameter: ${fieldNames[0]}`
      : `Invalid query parameters: ${fieldNames.join(', ')}`;

    super(
      'INVALID_QUERY_PARAMETER',
      message,
      fieldIssues
    );
  }
}

