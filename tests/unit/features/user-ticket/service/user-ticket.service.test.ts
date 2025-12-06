/**
 * Tests for User Ticket Service
 */

import { UserTicketService } from '../../../../../src/features/user-ticket/user-ticket.service';
import { MySQLConnector } from '../../../../../src/shared/database/mysql.connector';
import { buildInsertUserTicketQuery } from '../../../../../src/features/user-ticket/queries/insert-user-ticket.query';
import { buildGetUserTicketQuery } from '../../../../../src/features/user-ticket/queries/get-user-ticket.query';
import { buildUpdateTicketRemainingQuery } from '../../../../../src/features/ticket/queries/update-ticket-remaining.query';
import { UserTicketRequest, UserTicket } from '../../../../../src/features/user-ticket/user-ticket.types';
import { InsufficientTicketsError } from '../../../../../src/domain/errors';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Mock the MySQLConnector and query builders
jest.mock('../../../../../src/shared/database/mysql.connector');
jest.mock('../../../../../src/features/user-ticket/queries/insert-user-ticket.query');
jest.mock('../../../../../src/features/user-ticket/queries/get-user-ticket.query');
jest.mock('../../../../../src/features/ticket/queries/update-ticket-remaining.query');

describe('UserTicketService', () => {
  let userTicketService: UserTicketService;
  let mockDb: jest.Mocked<MySQLConnector>;
  let mockConnection: any;

  beforeEach(() => {
    // Create a mock connection
    mockConnection = {
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    // Create a mock MySQLConnector
    mockDb = {
      beginTransaction: jest.fn().mockResolvedValue(mockConnection),
      query: jest.fn(),
      queryOne: jest.fn(),
      getConnection: jest.fn(),
      close: jest.fn(),
      getPool: jest.fn(),
    } as unknown as jest.Mocked<MySQLConnector>;

    userTicketService = new UserTicketService(mockDb);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('addNewUserTicket', () => {
    const mockRequest: UserTicketRequest = {
      userId: 10,
      ticketId: 5,
      quantity: 2,
    };

    const mockUserTicket: UserTicket = {
      id: 100,
      ticketId: 5,
      userId: 10,
      unitPrice: 50.00,
      ticketAmount: 2,
      totalPrice: 100.00,
      datePurchased: '2024-01-15T14:30:00.000Z',
    };

    const mockUpdateQuery = {
      sql: 'UPDATE ticket SET remaining = remaining - ? WHERE id = ? AND remaining >= ?',
      params: [2, 5, 2],
    };

    const mockInsertQuery = {
      sql: 'INSERT INTO user_ticket ...',
      params: [10, 5, 2, 5],
    };

    const mockGetQuery = {
      sql: 'SELECT ... FROM user_ticket ut WHERE ut.id = ?',
      params: [100],
    };

    it('should successfully add a new user ticket', async () => {
      // Setup mocks
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);
      (buildInsertUserTicketQuery as jest.Mock).mockReturnValue(mockInsertQuery);
      (buildGetUserTicketQuery as jest.Mock).mockReturnValue(mockGetQuery);

      const updateResult = {
        affectedRows: 1,
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const insertResult = {
        affectedRows: 1,
        insertId: 100,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const getUserTicketResult = [
        {
          id: 100,
          ticketId: 5,
          userId: 10,
          unitPrice: '50.00',
          ticketAmount: 2,
          totalPrice: '100.00',
          datePurchased: '2024-01-15 14:30:00.000',
        },
      ];

      mockConnection.query
        .mockResolvedValueOnce([updateResult, []]) // update ticket remaining
        .mockResolvedValueOnce([insertResult, []]) // insert user ticket
        .mockResolvedValueOnce([getUserTicketResult, []]); // get user ticket

      const result = await userTicketService.addNewUserTicket(mockRequest);

      // Verify transaction flow
      expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(3);
      expect(mockConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);

      // Verify query calls
      expect(buildUpdateTicketRemainingQuery).toHaveBeenCalledWith(5, 2);
      expect(buildInsertUserTicketQuery).toHaveBeenCalledWith(mockRequest);
      expect(buildGetUserTicketQuery).toHaveBeenCalledWith(100);

      // Verify result
      expect(result).toEqual(mockUserTicket);
    });

    it('should throw InsufficientTicketsError when no tickets available', async () => {
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);

      const updateResult = {
        affectedRows: 0, // No rows affected = insufficient tickets
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      mockConnection.query.mockResolvedValueOnce([updateResult, []]);

      await expect(userTicketService.addNewUserTicket(mockRequest)).rejects.toThrow(
        InsufficientTicketsError
      );

      // Verify transaction was rolled back
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction on error during insert', async () => {
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);
      (buildInsertUserTicketQuery as jest.Mock).mockReturnValue(mockInsertQuery);

      const updateResult = {
        affectedRows: 1,
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      mockConnection.query
        .mockResolvedValueOnce([updateResult, []])
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(userTicketService.addNewUserTicket(mockRequest)).rejects.toThrow(
        'Database error'
      );

      // Verify transaction was rolled back
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction on error during get user ticket', async () => {
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);
      (buildInsertUserTicketQuery as jest.Mock).mockReturnValue(mockInsertQuery);
      (buildGetUserTicketQuery as jest.Mock).mockReturnValue(mockGetQuery);

      const updateResult = {
        affectedRows: 1,
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const insertResult = {
        affectedRows: 1,
        insertId: 100,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      mockConnection.query
        .mockResolvedValueOnce([updateResult, []])
        .mockResolvedValueOnce([insertResult, []])
        .mockRejectedValueOnce(new Error('User ticket not found'));

      await expect(userTicketService.addNewUserTicket(mockRequest)).rejects.toThrow(
        'User ticket not found'
      );

      // Verify transaction was rolled back
      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockConnection.commit).not.toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should handle different request values correctly', async () => {
      const differentRequest: UserTicketRequest = {
        userId: 999,
        ticketId: 888,
        quantity: 5,
      };

      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue({
        sql: 'UPDATE ticket ...',
        params: [5, 888, 5],
      });
      (buildInsertUserTicketQuery as jest.Mock).mockReturnValue({
        sql: 'INSERT ...',
        params: [999, 888, 5, 888],
      });
      (buildGetUserTicketQuery as jest.Mock).mockReturnValue({
        sql: 'SELECT ...',
        params: [200],
      });

      const updateResult = {
        affectedRows: 1,
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const insertResult = {
        affectedRows: 1,
        insertId: 200,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const getUserTicketResult = [
        {
          id: 200,
          ticketId: 888,
          userId: 999,
          unitPrice: '25.50',
          ticketAmount: 5,
          totalPrice: '127.50',
          datePurchased: '2024-01-20 10:00:00.000',
        },
      ];

      mockConnection.query
        .mockResolvedValueOnce([updateResult, []])
        .mockResolvedValueOnce([insertResult, []])
        .mockResolvedValueOnce([getUserTicketResult, []]);

      const result = await userTicketService.addNewUserTicket(differentRequest);

      expect(buildUpdateTicketRemainingQuery).toHaveBeenCalledWith(888, 5);
      expect(buildInsertUserTicketQuery).toHaveBeenCalledWith(differentRequest);
      expect(buildGetUserTicketQuery).toHaveBeenCalledWith(200);
      expect(result.id).toBe(200);
      expect(result.ticketId).toBe(888);
      expect(result.userId).toBe(999);
      expect(result.ticketAmount).toBe(5);
    });

    it('should always release connection even on error', async () => {
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);

      mockConnection.query.mockRejectedValueOnce(new Error('Connection error'));

      await expect(userTicketService.addNewUserTicket(mockRequest)).rejects.toThrow();

      expect(mockConnection.release).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user ticket not found after insert', async () => {
      (buildUpdateTicketRemainingQuery as jest.Mock).mockReturnValue(mockUpdateQuery);
      (buildInsertUserTicketQuery as jest.Mock).mockReturnValue(mockInsertQuery);
      (buildGetUserTicketQuery as jest.Mock).mockReturnValue(mockGetQuery);

      const updateResult = {
        affectedRows: 1,
        insertId: 0,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      const insertResult = {
        affectedRows: 1,
        insertId: 100,
        warningStatus: 0,
        changedRows: 0,
        fieldCount: 0,
        info: '',
        serverStatus: 0,
      };

      // Empty result - user ticket not found
      const getUserTicketResult: RowDataPacket[] = [];

      mockConnection.query
        .mockResolvedValueOnce([updateResult, []])
        .mockResolvedValueOnce([insertResult, []])
        .mockResolvedValueOnce([getUserTicketResult, []]);

      await expect(userTicketService.addNewUserTicket(mockRequest)).rejects.toThrow(
        'User ticket with id 100 not found'
      );

      expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
    });
  });
});
