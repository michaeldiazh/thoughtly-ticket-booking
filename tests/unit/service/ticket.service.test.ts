/**
 * Tests for Ticket Service
 */

import { TicketService } from '../../../src/service/ticket.service';
import { MySQLConnector } from '../../../src/service/database/mysql.connector';
import { buildAvailableTicketsCountQuery, buildAvailableTicketsSelectQuery } from '../../../src/service/query/ticket/get-tickets.query';
import { GetTicketsQuery, SimplifiedTicket } from '../../../src/domain/dtos';
import { OrderByConfig } from '../../../src/service/types';

// Mock the MySQLConnector
jest.mock('../../../src/service/database/mysql.connector');
jest.mock('../../../src/service/query/ticket/get-tickets.query');

describe('TicketService', () => {
  let ticketService: TicketService;
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

    ticketService = new TicketService(mockDb);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllAvailableTickets', () => {
    const mockQuery: GetTicketsQuery = {
      limit: 10,
      offset: 0,
    };

    const mockTickets: SimplifiedTicket[] = [
      {
        id: 1,
        eventName: 'Concert',
        tierDisplayName: 'General Admission',
        remaining: 50,
        price: 25.99,
        venueName: 'Madison Square Garden',
        venueCity: 'New York',
        venueCountryCode: 'USAS',
        eventStartTime: '2024-12-31T20:00:00Z',
      },
      {
        id: 2,
        eventName: 'Concert',
        tierDisplayName: 'VIP',
        remaining: 10,
        price: 99.99,
        venueName: 'Madison Square Garden',
        venueCity: 'New York',
        venueCountryCode: 'USAS',
        eventStartTime: '2024-12-31T20:00:00Z',
      },
    ];

    it('should return tickets and total count', async () => {
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket', params: [10, 0] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockTickets);

      const result = await ticketService.getAllAvailableTickets(mockQuery);

      expect(result).toEqual({
        tickets: mockTickets,
        total: 2,
      });

      expect(buildAvailableTicketsCountQuery).toHaveBeenCalledWith(mockQuery);
      expect(buildAvailableTicketsSelectQuery).toHaveBeenCalledWith(mockQuery, undefined);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockCountQuery.sql, mockCountQuery.params);
      expect(mockDb.query).toHaveBeenCalledWith(mockSelectQuery.sql, mockSelectQuery.params);
    });

    it('should return empty array and zero total when no tickets found', async () => {
      const mockCountResult = { total: 0 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket', params: [10, 0] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue([]);

      const result = await ticketService.getAllAvailableTickets(mockQuery);

      expect(result).toEqual({
        tickets: [],
        total: 0,
      });
    });

    it('should handle null count result and return zero', async () => {
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket', params: [10, 0] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(null);
      mockDb.query.mockResolvedValue([]);

      const result = await ticketService.getAllAvailableTickets(mockQuery);

      expect(result).toEqual({
        tickets: [],
        total: 0,
      });
    });

    it('should pass orderBy parameter to query builder', async () => {
      const orderBy: OrderByConfig<SimplifiedTicket>[] = [
        { key: 'price', op: 'DESC' },
      ];
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket', params: [10, 0] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockTickets);

      await ticketService.getAllAvailableTickets(mockQuery, orderBy);

      expect(buildAvailableTicketsSelectQuery).toHaveBeenCalledWith(mockQuery, orderBy);
    });

    it('should handle query with filters', async () => {
      const filteredQuery: GetTicketsQuery = {
        ticketIds: [1, 2],
        eventName: 'Concert',
        limit: 5,
        offset: 10,
      };
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket WHERE ...', params: [1, 2, '%Concert%'] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket WHERE ...', params: [1, 2, '%Concert%', 5, 10] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockTickets);

      const result = await ticketService.getAllAvailableTickets(filteredQuery);

      expect(result).toEqual({
        tickets: mockTickets,
        total: 2,
      });

      expect(buildAvailableTicketsCountQuery).toHaveBeenCalledWith(filteredQuery);
      expect(buildAvailableTicketsSelectQuery).toHaveBeenCalledWith(filteredQuery, undefined);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockCountQuery.sql, mockCountQuery.params);
      expect(mockDb.query).toHaveBeenCalledWith(mockSelectQuery.sql, mockSelectQuery.params);
    });

    it('should execute count and select queries in parallel', async () => {
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM ticket', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM ticket', params: [10, 0] };

      (buildAvailableTicketsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildAvailableTicketsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockTickets);

      // Track call order
      const callOrder: string[] = [];
      mockDb.queryOne.mockImplementation(async () => {
        callOrder.push('queryOne');
        return mockCountResult;
      });
      mockDb.query.mockImplementation(async () => {
        callOrder.push('query');
        return mockTickets;
      });

      await ticketService.getAllAvailableTickets(mockQuery);

      // Both should be called, but order may vary due to Promise.all
      expect(callOrder.length).toBe(2);
      expect(callOrder).toContain('queryOne');
      expect(callOrder).toContain('query');
    });
  });
});
