/**
 * Integration Tests for User Service
 * 
 * Tests using real MySQL 8.4 database via testcontainers
 */

import { UserService } from '../../../../src/features/user/user.service';
import { getTestDatabase } from '../../../setup/testcontainers.setup';
import { SimplifiedUser, User } from '../../../../src/features/user/user.types';
import { UserNotFoundError } from '../../../../src/domain/errors/user.errors';

describe('UserService Integration Tests', () => {
  let userService: UserService;
  let db: ReturnType<typeof getTestDatabase>;

  beforeAll(() => {
    db = getTestDatabase();
    userService = new UserService(db);
  });

  describe('getAllUsers', () => {
    it('should return all users with simplified fields', async () => {
      const result = await userService.getAllUsers();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('firstName');
      expect(result[0]).toHaveProperty('lastName');
      expect(result[0]).toHaveProperty('city');
      expect(result[0]).toHaveProperty('countryCode');
      
      // Verify it's a SimplifiedUser (should not have full User fields)
      const user = result[0] as SimplifiedUser;
      expect(user).not.toHaveProperty('address');
      expect(user).not.toHaveProperty('region');
      expect(user).not.toHaveProperty('timezone');
    });

    it('should return users with valid data structure', async () => {
      const result = await userService.getAllUsers();

      result.forEach((user) => {
        expect(typeof user.id).toBe('number');
        expect(user.id).toBeGreaterThan(0);
        expect(typeof user.firstName).toBe('string');
        expect(user.firstName.length).toBeGreaterThan(0);
        expect(typeof user.lastName).toBe('string');
        expect(user.lastName.length).toBeGreaterThan(0);
        expect(typeof user.city).toBe('string');
        expect(user.city.length).toBeGreaterThan(0);
        expect(typeof user.countryCode).toBe('string');
        expect(user.countryCode.length).toBeGreaterThan(0);
      });
    });

    it('should return unique users', async () => {
      const result = await userService.getAllUsers();

      if (result.length > 1) {
        const userIds = result.map((u) => u.id);
        const uniqueIds = new Set(userIds);
        expect(uniqueIds.size).toBe(userIds.length);
      }
    });
  });

  describe('getUserById', () => {
    it('should return a user with complete information when found', async () => {
      // First get a user ID from the database
      const users = await db.query<{ id: number }>('SELECT id FROM user LIMIT 1');
      
      if (users.length === 0) {
        throw new Error('No users found in test database');
      }

      const userId = users[0].id;
      const result = await userService.getUserById(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('region');
      expect(result).toHaveProperty('countryCode');
      expect(result).toHaveProperty('timezone');
      
      // Verify data types
      expect(typeof result.id).toBe('number');
      expect(typeof result.firstName).toBe('string');
      expect(result.firstName.length).toBeGreaterThan(0);
      expect(typeof result.lastName).toBe('string');
      expect(result.lastName.length).toBeGreaterThan(0);
      expect(typeof result.address).toBe('string');
      expect(result.address.length).toBeGreaterThan(0);
      expect(typeof result.city).toBe('string');
      expect(result.city.length).toBeGreaterThan(0);
      expect(result.region === null || typeof result.region === 'string').toBe(true);
      expect(typeof result.countryCode).toBe('string');
      expect(result.countryCode.length).toBeGreaterThan(0);
      expect(typeof result.timezone).toBe('string');
      expect(result.timezone.length).toBeGreaterThan(0);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const nonExistentUserId = 999999;

      await expect(userService.getUserById(nonExistentUserId)).rejects.toThrow(
        UserNotFoundError
      );
    });

    it('should return correct user data for different user IDs', async () => {
      // Get multiple user IDs
      const users = await db.query<{ id: number }>('SELECT id FROM user LIMIT 2');
      
      if (users.length < 2) {
        throw new Error('Not enough users in test database');
      }

      const [user1, user2] = await Promise.all([
        userService.getUserById(users[0].id),
        userService.getUserById(users[1].id),
      ]);

      expect(user1.id).toBe(users[0].id);
      expect(user2.id).toBe(users[1].id);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should handle user with null region', async () => {
      // Find a user with null region or create one
      const usersWithNullRegion = await db.query<{ id: number }>(
        'SELECT id FROM user WHERE region IS NULL LIMIT 1'
      );

      if (usersWithNullRegion.length > 0) {
        const userId = usersWithNullRegion[0].id;
        const result = await userService.getUserById(userId);

        expect(result.region).toBeNull();
        expect(result).toHaveProperty('region');
      }
    });

    it('should handle user with non-null region', async () => {
      // Find a user with non-null region
      const usersWithRegion = await db.query<{ id: number }>(
        'SELECT id FROM user WHERE region IS NOT NULL LIMIT 1'
      );

      if (usersWithRegion.length > 0) {
        const userId = usersWithRegion[0].id;
        const result = await userService.getUserById(userId);

        expect(result.region).not.toBeNull();
        expect(typeof result.region).toBe('string');
        expect(result.region!.length).toBeGreaterThan(0);
      }
    });
  });
});
