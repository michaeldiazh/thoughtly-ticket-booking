import { QueryResult } from '../../types';
export const buildUpdateTicketRemainingQuery = (ticketId: number, quantity: number): QueryResult => {
  return {
    sql: `UPDATE ticket SET remaining = remaining - ? WHERE id = ? AND remaining >= ?`,
    params: [quantity, ticketId, quantity],
  };
};
