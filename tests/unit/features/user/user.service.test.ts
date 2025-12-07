/**
 * Tests for User Service
 */

import { UserService } from '../../../../src/features/user/user.service';
import { MySQLConnector } from '../../../../src/shared/database/mysql.connector';
import { getUsersQuery } from '../../../../src/features/user/queries/get-users.query';
import { getUserByIdQuery } from '../../../../src/features/user/queries/get-user-by-id.query';
import { SimplifiedUser, User } from '../../../../src/features/user/user.types';
import { UserNotFoundError } from '../../../../src/domain/errors/user.errors';

// Mock the MySQLConnector and query builders
jest.mock('../../../../src/shared/database/mysql.connector');
jest.mock('../../../../src/features/user/queries/get-users.query');
jest.mock('../../../../src/features/user/queries/get-user-by-id.query');

describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<MySQLConnector>;

  beforeEach(() => {
    // Create a mock MySQLConnector
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      getConnection: jest.fn(),
      beginTransaction: jest.fn(),
      close: jest.fn(),
      getPool: jest.fn(),
    } as unknown as jest.Mocked<MySQLConnector>;

    userService = new UserService(mockDb);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    const mockSimplifiedUsers: SimplifiedUser[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        countryCode: 'US',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        city: 'Los Angeles',
        countryCode: 'US',
      },
    ];

    it('should return all simplified users', async () => {
      const mockQuery = {
        sql: 'SELECT id, first_name AS \'firstName\', last_name AS \'lastName\', city, country_code AS \'countryCode\' FROM user',
        params: [],
      };

      (getUsersQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.query.mockResolvedValue(mockSimplifiedUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockSimplifiedUsers);
      expect(getUsersQuery).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should return empty array when no users found', async () => {
      const mockQuery = {
        sql: 'SELECT id, first_name AS \'firstName\', last_name AS \'lastName\', city, country_code AS \'countryCode\' FROM user',
        params: [],
      };

      (getUsersQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.query.mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
      expect(getUsersQuery).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should validate each user and throw error on invalid data', async () => {
      const mockQuery = {
        sql: 'SELECT id, first_name AS \'firstName\', last_name AS \'lastName\', city, country_code AS \'countryCode\' FROM user',
        params: [],
      };

      const invalidUsers = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          city: 'New York',
          // Missing countryCode
        },
      ];

      (getUsersQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.query.mockResolvedValue(invalidUsers);

      await expect(userService.getAllUsers()).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    const mockUser: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'New York',
      region: 'NY',
      countryCode: 'US',
      timezone: 'America/New_York',
      userTickets: [
        {
          userTicketId: 1,
          eventName: 'Summer Concert',
          venueName: 'Madison Square Garden',
          tier: 'VIP',
          ticketAmount: 2,
          totalPrice: 200.00,
          datePurchased: '2024-07-15T14:30:00Z',
        },
      ],
    };

    it('should return a user by ID with user tickets', async () => {
      const userId = 1;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(getUserByIdQuery).toHaveBeenCalledWith(userId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should throw UserNotFoundError when user not found', async () => {
      const userId = 999;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(UserNotFoundError);
      expect(getUserByIdQuery).toHaveBeenCalledWith(userId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should throw UserNotFoundError when user is undefined', async () => {
      const userId = 999;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(undefined);

      await expect(userService.getUserById(userId)).rejects.toThrow(UserNotFoundError);
    });

    it('should validate user data and throw error on invalid data', async () => {
      const userId = 1;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      const invalidUser = {
        id: 1,
        firstName: 'John',
        // Missing required fields
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(invalidUser);

      await expect(userService.getUserById(userId)).rejects.toThrow();
    });

    it('should handle user with empty user tickets array', async () => {
      const userId = 1;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      const userWithNoTickets: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'New York',
        region: 'NY',
        countryCode: 'US',
        timezone: 'America/New_York',
        userTickets: [],
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(userWithNoTickets);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(userWithNoTickets);
      expect(result.userTickets).toEqual([]);
    });

    it('should handle user with multiple user tickets', async () => {
      const userId = 42;
      const mockQuery = {
        sql: expect.stringContaining('SELECT'),
        params: [userId],
      };

      const differentUser: User = {
        id: 42,
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        region: 'CA',
        countryCode: 'US',
        timezone: 'America/Los_Angeles',
        userTickets: [
          {
            userTicketId: 10,
            eventName: 'Winter Festival',
            venueName: 'Red Rocks',
            tier: 'General',
            ticketAmount: 1,
            totalPrice: 50.00,
            datePurchased: '2024-12-20T10:00:00Z',
          },
          {
            userTicketId: 11,
            eventName: 'Summer Concert',
            venueName: 'Madison Square Garden',
            tier: 'VIP',
            ticketAmount: 2,
            totalPrice: 300.00,
            datePurchased: '2024-07-15T14:30:00Z',
          },
        ],
      };

      (getUserByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(differentUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(differentUser);
      expect(result.userTickets).toHaveLength(2);
      expect(getUserByIdQuery).toHaveBeenCalledWith(42);
    });
  });
});
