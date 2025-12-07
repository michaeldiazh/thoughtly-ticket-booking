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
    DATE_FORMAT(ut.date_purchased, '%Y-%m-%dT%H:%i:%sZ') as 'datePurchased',
    e.name as 'eventName',
    v.name as 'venueName',
    DATE_FORMAT(e.start_time, '%Y-%m-%dT%H:%i:%sZ') as 'startTime',
    DATE_FORMAT(e.end_time, '%Y-%m-%dT%H:%i:%sZ') as 'endTime'
   FROM user_ticket ut
   INNER JOIN ticket t ON ut.ticket_id = t.id
   INNER JOIN event e ON t.event_id = e.id
   INNER JOIN venue v ON e.venue_id = v.id
   WHERE ut.id = ?`;
};
