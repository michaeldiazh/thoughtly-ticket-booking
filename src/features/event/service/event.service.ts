import { EventNotFoundError } from "../../../domain/errors/event.errors";
import { MySQLConnector } from "../../../shared/database";
import { OrderByConfig } from "../../../shared/types";
import { createZodValidator, Validator } from "../../../shared/validator";
import { eventErrorConverter, Event, EventSchema } from "../domain/dtos/event.dto";
import { GetEventsQuery } from "../domain/dtos/get-events-query.dto";
import { EventListItem } from "../domain/dtos/simplified-event.dto";
import { getEventByIdQuery } from "../queries/get-event-by-id.query";
import { buildEventsCountQuery, buildEventsSelectQuery } from "../queries/get-events.query";

export class EventService {
    private eventValidator: Validator<Event>;
    constructor(
        private readonly connector: MySQLConnector,
    ) {
        this.connector = connector;
        this.eventValidator = createZodValidator<Event>(EventSchema, eventErrorConverter);
    }

    async getEvents(query: GetEventsQuery, orderBy?: OrderByConfig<EventListItem>[]): Promise<{
        events: EventListItem[];
        total: number;
    }> {
        const [events, total] = await Promise.all([
            this.queryEvents(query, orderBy),
            this.queryEventsCount(query),
        ]);
        return {
            events,
            total,
        };
    }

    async getEventById(eventId: number): Promise<Event> {
        const query = getEventByIdQuery(eventId);
        const rows = await this.connector.queryOne<Event>(query.sql, query.params);
        if (!rows) {
            throw new EventNotFoundError(eventId);
        }
        return this.eventValidator.validate(rows)
    }


    private async queryEvents(query: GetEventsQuery, orderBy?: OrderByConfig<EventListItem>[]): Promise<EventListItem[]> {
        const { sql, params } = buildEventsSelectQuery(query, orderBy);
        return this.connector.query<EventListItem>(sql, params);
    }

    private async queryEventsCount(query: GetEventsQuery): Promise<number> {
        const { sql, params } = buildEventsCountQuery(query);
        const result = await this.connector.queryOne<{ total: number }>(sql, params);
        return result?.total || 0;
    }
}