/**
 * User-related error classes
 */

import { AppError } from './base.error';

/**
 * Error thrown when a user is not found
 */
export class UserNotFoundError extends AppError {
  constructor(userId: number | string) {
    super(
      'USER_NOT_FOUND',
      `User with ID ${userId} not found`,
      { userId }
    );
  }
}

/**
 * Error thrown when user ID format is invalid
 */
export class InvalidUserIdError extends AppError {
  constructor(userId: unknown) {
    super(
      'INVALID_USER_ID',
      'Invalid user ID format',
      { userId }
    );
  }
}
