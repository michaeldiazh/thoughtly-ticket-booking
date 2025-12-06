import { QueryResult } from "../../../shared/types";
import { UserTicketRequest } from "../domain/dtos";
export const buildInsertUserTicketQuery = (request: UserTicketRequest): QueryResult => {
    return {
        sql: buildInsertUserTicketSQL(),
        params: [request.userId, request.ticketId, request.quantity, request.ticketId],
    };
}

export const buildInsertUserTicketSQL = (): string => {
    return `
    insert into user_ticket (user_id, ticket_id, unit_price, ticket_amount)
        select ?, ?, price, ? from ticket where id = ?;
    `;
}
