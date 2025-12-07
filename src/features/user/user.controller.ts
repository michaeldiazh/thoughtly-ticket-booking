/**
 * User Controller
 * 
 * Handles HTTP requests for user endpoints
 */

import { Request, Response } from 'express';
import { buildSucceededSingleResponse } from '../../domain/common.dto';
import { handleError, parsePositiveInt } from '../../shared/utils';
import { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/v1/user
   * Get all users (simplified)
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(buildSucceededSingleResponse(users));
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * GET /api/v1/user/:id
   * Get a single user by ID with complete information
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parsePositiveInt(req.params.id, 'id');
      const user = await this.userService.getUserById(userId);
      res.status(200).json(buildSucceededSingleResponse(user));
    } catch (error) {
      handleError(error, res);
    }
  }
}
