
import { QueryResult } from '../../../shared/types';


export const getEventByIdQuery =  (eventId: number): QueryResult => (
    {
        sql: buildGetEventByIdSql(),
        params: [eventId],
    }
)

const buildGetEventByIdSql = (): string => `
select e.id,
       e.name,
       e.description,
       e.start_time,
       e.end_time,
       ${buildVenueJSONObject()},
       ${buildTiersJSONObject()},
from event e
         join venue v
              on e.venue_id = v.id
         join ticket t on t.event_id = e.id
         join price_tier pt on pt.code = t.tier_code
where e.id = ?
${buildGroupByClause()}
`

const buildVenueJSONObject = (): string => `
JSON_OBJECT(
    'id', v.id,
    'name', v.name,
    'address', v.address,
    'city', v.city,
    'region', v.region,
    'countryCode', v.country_code,
    'timezone', v.timezone
) as venue
`;

const buildTiersJSONObject = (): string => `
JSON_OBJECTAGG(
    t.tier_code,
    JSON_OBJECT(
        'ticketId', t.id,
        'price', t.price
        'remaining', t.remaining,
        'capacity', t.capacity
    )
) AS tiers
`;
const buildGroupByClause = (): string => `
group by e.id, v.id;
`;