/**
 * User Routes
 * 
 * Defines routes for user-related endpoints
 */

import express, { Router } from 'express';
import { UserController } from './user.controller';

/**
 * Create user routes with dependency injection
 * @param userController - The user controller instance
 * @returns Express router with user routes
 */
export function createUserRoutes(userController: UserController): Router {
  const router: Router = express.Router();

  /**
   * GET /api/v1/user
   * Get all users (simplified)
   */
  router.get('/', async (req, res) => {
    await userController.getUsers(req, res);
  });

  /**
   * GET /api/v1/user/:id
   * Get a single user by ID with complete information
   */
  router.get('/:id', async (req, res) => {
    await userController.getUserById(req, res);
  });

  return router;
}
