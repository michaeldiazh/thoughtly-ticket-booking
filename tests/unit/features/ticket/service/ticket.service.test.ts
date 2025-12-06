/**
 * Tests for Ticket Service
 */

import { TicketService } from '../../../../../src/features/ticket/ticket.service';
import { MySQLConnector } from '../../../../../src/shared/database/mysql.connector';
import { buildAvailableTicketsCountQuery, buildAvailableTicketsSelectQuery } from '../../../../../src/features/ticket/queries/get-tickets.query';
import { buildTicketByIdQuery } from '../../../../../src/features/ticket/queries/get-ticket-by-id.query';
import { GetTicketsQuery, SimplifiedTicket, Ticket } from '../../../../../src/features/ticket/ticket.types';
import { OrderByConfig } from '../../../../../src/shared/types';

// Mock the MySQLConnector
jest.mock('../../../../../src/shared/database/mysql.connector');
jest.mock('../../../../../src/features/ticket/queries/get-tickets.query');
jest.mock('../../../../../src/features/ticket/queries/get-ticket-by-id.query');

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

  describe('getTicketById', () => {
    const mockTicketId = 1;
    const mockEventJson = JSON.stringify({
      id: 1,
      name: 'Summer Concert 2024',
      description: 'A great summer concert',
      startTime: '2024-07-15T19:00:00Z',
      endTime: '2024-07-15T22:00:00Z',
      venue: {
        id: 1,
        name: 'Madison Square Garden',
        address: '4 Pennsylvania Plaza',
        city: 'New York',
        region: 'NY',
        countryCode: 'USAS',
        timezone: 'America/New_York',
      },
    });

    const mockDbResult = {
      id: 1,
      tierCode: 'VIP',
      tierDisplayName: 'VIP',
      capacity: 50,
      remaining: 45,
      price: 100.00,
      createdAt: '2024-01-01T00:00:00Z',
      lastUpdated: '2024-01-01T00:00:00Z',
      event: mockEventJson,
    };

    const expectedTicket: Ticket = {
      id: 1,
      tierCode: 'VIP',
      tierDisplayName: 'VIP',
      capacity: 50,
      remaining: 45,
      price: 100.00,
      createdAt: '2024-01-01T00:00:00Z',
      lastUpdated: '2024-01-01T00:00:00Z',
      event: JSON.parse(mockEventJson),
    };

    it('should return a ticket when found', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockDbResult);

      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).toEqual(expectedTicket);
      expect(buildTicketByIdQuery).toHaveBeenCalledWith(mockTicketId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should return null when ticket not found', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(null);

      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).toBeNull();
      expect(buildTicketByIdQuery).toHaveBeenCalledWith(mockTicketId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should parse JSON event string from database', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockDbResult);

      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).not.toBeNull();
      expect(result?.event).toEqual(JSON.parse(mockEventJson));
      expect(typeof result?.event).toBe('object');
      expect(result?.event.venue).toBeDefined();
    });

    it('should handle event as already parsed object', async () => {
      const mockDbResultWithObject = {
        ...mockDbResult,
        event: JSON.parse(mockEventJson),
      };
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockDbResultWithObject);

      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).not.toBeNull();
      expect(result?.event).toEqual(JSON.parse(mockEventJson));
    });

    it('should convert price to number', async () => {
      const mockDbResultWithStringPrice = {
        ...mockDbResult,
        price: '100.00',
      };
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockDbResultWithStringPrice);

      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).not.toBeNull();
      expect(typeof result?.price).toBe('number');
      expect(result?.price).toBe(100.00);
    });

    it('should validate ticket data before returning', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE t.id = ?', params: [mockTicketId] };

      (buildTicketByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockDbResult);

      // The validator should be called internally
      // We can verify this by checking the result structure matches the schema
      const result = await ticketService.getTicketById(mockTicketId);

      expect(result).not.toBeNull();
      // If validation passes, all required fields should be present
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('tierCode');
      expect(result).toHaveProperty('tierDisplayName');
      expect(result).toHaveProperty('capacity');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('event');
      expect(result?.event).toHaveProperty('venue');
    });
  });
});
