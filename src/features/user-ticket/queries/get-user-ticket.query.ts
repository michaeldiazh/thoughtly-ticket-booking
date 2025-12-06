import { QueryResult } from "../../../shared/types";

export const buildGetUserTicketQuery = (bookingId: number): QueryResult => {
  return {
    sql: buildGetUserTicketSQL(),
    params: [bookingId],
  };
};


export const buildGetUserTicketSQL = (): string => {
  return `SELECT 
    ut.id,
    ut.ticket_id as 'ticketId',
    ut.user_id as 'userId',
    ut.unit_price as 'unitPrice',
    ut.ticket_amount as 'ticketAmount',
    ut.unit_price * ut.ticket_amount as 'totalPrice',
    ut.date_purchased as 'datePurchased'
   FROM user_ticket ut WHERE ut.id = ?`;
};
