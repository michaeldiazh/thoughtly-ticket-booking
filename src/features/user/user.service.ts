/**
 * User Service
 * 
 * Business logic for user operations
 */

import { MySQLConnector } from '../../shared/database';
import { User, UserSchema, SimplifiedUser, SimplifiedUserSchema } from './user.types';
import { getUsersQuery } from './queries/get-users.query';
import { getUserByIdQuery } from './queries/get-user-by-id.query';
import { createZodValidator, Validator, convertValidationErrorToInvalidRequestError } from '../../shared/validator';
import { UserNotFoundError } from '../../domain/errors/user.errors';

export class UserService {
  private userValidator: Validator<User>;
  private simplifiedUserValidator: Validator<SimplifiedUser>;

  constructor(private readonly db: MySQLConnector) {
    this.userValidator = createZodValidator<User>(UserSchema, convertValidationErrorToInvalidRequestError);
    this.simplifiedUserValidator = createZodValidator<SimplifiedUser>(SimplifiedUserSchema, convertValidationErrorToInvalidRequestError);
  }

  /**
   * Get all users (simplified)
   */
  async getAllUsers(): Promise<SimplifiedUser[]> {
    const { sql, params } = getUsersQuery();
    const rows = await this.db.query<SimplifiedUser>(sql, params);
    
    // Validate each user
    return rows.map((row) => this.simplifiedUserValidator.validate(row));
  }

  /**
   * Get a single user by ID with complete information
   * @param userId - The user ID to retrieve
   * @returns User DTO with all fields, or throws UserNotFoundError if not found
   */
  async getUserById(userId: number): Promise<User> {
    const { sql, params } = getUserByIdQuery(userId);
    const result = await this.db.queryOne<User>(sql, params);
    
    if (!result) {
      throw new UserNotFoundError(userId);
    }
    
    return this.userValidator.validate(result);
  }
}
