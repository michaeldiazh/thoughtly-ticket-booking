/**
 * Base Error Classes and Interfaces
 */

import { Exception } from '../types';

/**
 * Interface for errors that can be converted to Exception for API responses
 */
export interface ErrorToException {
  toException(...args: unknown[]): Exception;
}

/**
 * Base application error class
 * Extends native Error and implements ErrorToException interface
 */
export abstract class AppError extends Error implements ErrorToException {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    // Error.captureStackTrace is available in Node.js (V8 engine)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to an Exception DTO for API responses
   * @param args Optional additional arguments for extending or overriding the exception
   * Note: Rest parameters are inherently optional - you can call toException() with no arguments
   */
  toException(): Exception {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

