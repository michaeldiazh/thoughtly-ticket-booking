import { ResultSetHeader, RowDataPacket, PoolConnection } from "mysql2/promise";
import { MySQLConnector } from ".";
import { UserTicketRequest } from "../domain/dtos";
import { InsufficientTicketsError } from "../domain/errors";
import { buildInsertUserTicketQuery } from "./query/user-ticket/insert-user-ticket.query";
import { buildUpdateTicketRemainingQuery } from "./query/ticket/update-ticket-remaining.query";
import { buildGetUserTicketQuery } from "./query/user-ticket/get-user-ticket.query";
import { UserTicket, UserTicketSchema, userTicketErrorConverter } from "../domain/dtos/user-ticket/user-ticket.dto";
import { Validator } from "../domain/validator/validator.interface";
import { createZodValidator } from "../domain/validator/zod-validator.factory";

export class UserTicketService {
    private userTicketValidator: Validator<UserTicket>;

    constructor(private readonly db: MySQLConnector) {
        this.userTicketValidator = createZodValidator<UserTicket>(UserTicketSchema, userTicketErrorConverter);
    }

    async addNewUserTicket(request: UserTicketRequest): Promise<UserTicket> {
        const connection: PoolConnection = await this.db.beginTransaction();
        try {
            await this.removeTicketsFromInventory(connection, request.ticketId, request.quantity);
            const newId: number = await this.insertUserTicket(connection, request);
            const userTicket: UserTicket = await this.getUserTicketById(connection, newId);
            await connection.commit();
            return userTicket;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    private async removeTicketsFromInventory(connection: PoolConnection, ticketId: number, quantity: number): Promise<void> {
        const updateTicketRemainingQuery = buildUpdateTicketRemainingQuery(ticketId, quantity);
        const results = await connection.query(updateTicketRemainingQuery.sql, updateTicketRemainingQuery.params);
        const rowdata = results[0] as ResultSetHeader;
        if(rowdata.affectedRows === 0) {
            throw new InsufficientTicketsError(ticketId, quantity);
        }
    }

    private async insertUserTicket(connection: PoolConnection, request: UserTicketRequest): Promise<number> {
        const insertUserTicketQuery = buildInsertUserTicketQuery(request);
        const insertResults = await connection.query(insertUserTicketQuery.sql, insertUserTicketQuery.params);
        const insertRowdata = insertResults[0] as ResultSetHeader;
        const newId = insertRowdata.insertId;
        return newId;
    }

    private async getUserTicketById(connection: PoolConnection, id: number): Promise<UserTicket> {
        const getUserTicketQuery = buildGetUserTicketQuery(id);
        const [rows] = await connection.query(getUserTicketQuery.sql, getUserTicketQuery.params);
        const getUserTicketResults = rows as RowDataPacket[];
        const rawBookingData: unknown = getUserTicketResults[0];
        
        if (!rawBookingData) {
            throw new Error(`User ticket with id ${id} not found`);
        }
        
        return this.userTicketValidator.validate(rawBookingData);
    }
}
