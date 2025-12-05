# API Contract

This document defines the API contract between the frontend and backend for the Thoughtly Ticket Booking System.

## Base URL

```
/api/v1
```

## Authentication

**No authentication required.** Per assignment constraints, the API does not require authentication. All endpoints are publicly accessible.

## Endpoints

_Endpoints will be defined below_

## Response Format

### Success Response

There are two types of success responses:

**Paginated Response** (for list endpoints):

```json
{
  "status": "OK",
  "data": [ ... ],
  "perPage": 10,
  "offset": 0,
  "total": 100
}
```

**Single Object Response** (for detail endpoints):

```json
{
  "status": "OK",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "ERROR",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g., insufficient tickets)
- `500 Internal Server Error` - Server error

## Error Codes

_Error codes will be defined as endpoints are added_

---

## Endpoints

### GET /ticket

Get all available tickets with optional filtering.

**URL:** `/api/v1/ticket`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticketIds` | string[] | Comma-separated list of ticket IDs | `?ticketIds=1,2,3` |
| `tierCodes` | string[] | Comma-separated list of tier codes (GA, FRONT_ROW, VIP) | `?tierCodes=GA,VIP` |
| `eventName` | string | Filter by event name (partial match) | `?eventName=Concert` |
| `eventStartDate` | string | Filter events starting from this date (ISO 8601) | `?eventStartDate=2024-01-01T00:00:00Z` |
| `eventEndDate` | string | Filter events ending before this date (ISO 8601) | `?eventEndDate=2024-12-31T23:59:59Z` |
| `venueName` | string | Filter by venue name (partial match) | `?venueName=Madison Square` |
| `venueCountryCode` | string | Filter by venue country code (4 characters) | `?venueCountryCode=US` |
| `limit` | number | Maximum number of tickets to return (default: 10) | `?limit=20` |
| `offset` | number | Number of tickets to skip for pagination (default: 0) | `?offset=10` |

**Query Parameter Examples:**

```
GET /api/v1/ticket
GET /api/v1/ticket?tierCodes=VIP,FRONT_ROW
GET /api/v1/ticket?eventName=Summer&venueCountryCode=US
GET /api/v1/ticket?eventStartDate=2024-06-01T00:00:00Z&eventEndDate=2024-08-31T23:59:59Z
GET /api/v1/ticket?ticketIds=1,2,3&tierCodes=GA
GET /api/v1/ticket?limit=20&offset=10
GET /api/v1/ticket?tierCodes=VIP&limit=5&offset=0
```

**Response:**

**Success (200 OK):**

```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "eventId": 5,
      "eventName": "Summer Concert",
      "tierCode": "VIP",
      "tierDisplayName": "VIP",
      "capacity": 100,
      "remaining": 45,
      "price": 100.00,
      "venue": {
        "id": 2,
        "name": "Madison Square Garden",
        "city": "New York",
        "countryCode": "US",
        "timezone": "America/New_York"
      },
      "eventStartTime": "2024-07-15T19:00:00Z",
      "eventEndTime": "2024-07-15T22:00:00Z"
    }
  ],
  "perPage": 10,
  "offset": 0,
  "total": 1
}
```

**Error (400 Bad Request):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INVALID_QUERY_PARAMETER",
    "message": "Invalid date format for eventStartDate",
    "details": {
      "parameter": "eventStartDate",
      "expectedFormat": "ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)"
    }
  }
}
```

**Notes:**
- All query parameters are optional
- Multiple filters can be combined (AND logic)
- Date ranges are inclusive
- Pagination: `limit` defaults to 10, `offset` defaults to 0
- Empty result returns `200 OK` with empty `tickets` array

### GET /ticket/:id

Get a single ticket by ID with complete event and venue information.

**URL:** `/api/v1/ticket/:id`

**Method:** `GET`

**Path Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | number | Ticket ID | `/api/v1/ticket/1` |

**Response:**

**Success (200 OK):**

```json
{
  "status": "OK",
  "data": {
    "id": 1,
    "eventId": 5,
    "tierCode": "VIP",
    "tierDisplayName": "VIP",
    "capacity": 100,
    "remaining": 45,
    "price": 100.00,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastUpdated": "2024-01-15T10:00:00.000Z",
    "event": {
      "id": 5,
      "name": "Summer Concert",
      "description": "An amazing summer concert experience",
      "startTime": "2024-07-15T19:00:00Z",
      "endTime": "2024-07-15T22:00:00Z",
      "venue": {
        "id": 2,
        "name": "Madison Square Garden",
        "address": "4 Pennsylvania Plaza",
        "city": "New York",
        "region": "NY",
        "countryCode": "US",
        "timezone": "America/New_York"
      }
    }
  }
}
```

**Error (404 Not Found):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID 1 not found",
    "details": {
      "ticketId": 1
    }
  }
}
```

**Error (400 Bad Request):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INVALID_TICKET_ID",
    "message": "Invalid ticket ID format",
    "details": {
      "ticketId": "invalid"
    }
  }
}
```

**Notes:**
- Returns ticket information with ticket fields at the top level
- Event information is nested in the `event` object
- Venue information is nested inside the `event` object (replaces `venueId`)
- All timestamps are in ISO 8601 format (UTC)

### POST /user/ticket

Book tickets for a user.

**URL:** `/api/v1/user/ticket`

**Method:** `POST`

**Request Body:**

```json
{
  "ticketId": 1,
  "userId": 10,
  "quantity": 2
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticketId` | number | Yes | ID of the ticket to book |
| `userId` | number | Yes | ID of the user making the booking |
| `quantity` | number | Yes | Number of tickets to book (must be > 0) |

**Response:**

**Success (201 Created):**

```json
{
  "status": "OK",
  "data": {
    "id": 100,
    "ticketId": 1,
    "userId": 10,
    "unitPrice": 100.00,
    "ticketAmount": 2,
    "totalPrice": 200.00,
    "datePurchased": "2024-01-15T14:30:00.000Z"
  }
}
```

**Error (409 Conflict) - Insufficient tickets:**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INSUFFICIENT_TICKETS",
    "message": "Not enough tickets available. Remaining: 1, Requested: 2",
    "details": {
      "ticketId": 1,
      "requested": 2,
      "remaining": 1
    }
  }
}
```

**Error (400 Bad Request) - Invalid request:**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "quantity",
      "issue": "Quantity must be greater than 0"
    }
  }
}
```

**Error (404 Not Found) - Ticket not found:**

```json
{
  "status": "ERROR",
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID 1 not found",
    "details": {
      "ticketId": 1
    }
  }
}
```

**Notes:**
- Uses atomic database updates with row-level locking to prevent double-booking
- Transaction ensures atomicity - if booking fails, ticket count is rolled back
- Payment simulation is included (no real payment integration)
- All timestamps are in ISO 8601 format (UTC)

### GET /event

Get all events with optional filtering. Returns basic event information for browsing.

**URL:** `/api/v1/event`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `venueName` | string | Filter by venue name (partial match) | `?venueName=Madison Square` |
| `venueCountryCode` | string | Filter by venue country code (4 characters) | `?venueCountryCode=US` |
| `eventName` | string | Filter by event name (partial match) | `?eventName=Concert` |
| `eventStartDate` | string | Filter events starting from this date (ISO 8601) | `?eventStartDate=2024-01-01T00:00:00Z` |
| `eventEndDate` | string | Filter events ending before this date (ISO 8601) | `?eventEndDate=2024-12-31T23:59:59Z` |
| `limit` | number | Maximum number of events to return (default: 10) | `?limit=20` |
| `offset` | number | Number of events to skip for pagination (default: 0) | `?offset=10` |

**Query Parameter Examples:**

```
GET /api/v1/event
GET /api/v1/event?venueCountryCode=US
GET /api/v1/event?eventName=Summer&venueCountryCode=US
GET /api/v1/event?eventStartDate=2024-06-01T00:00:00Z&eventEndDate=2024-08-31T23:59:59Z
GET /api/v1/event?venueName=Madison&limit=5&offset=0
```

**Response:**

**Success (200 OK):**

```json
{
  "status": "OK",
  "data": [
    {
      "id": 5,
      "name": "Summer Concert",
      "description": "An amazing summer concert experience",
      "startTime": "2024-07-15T19:00:00Z",
      "endTime": "2024-07-15T22:00:00Z",
      "venueId": 2,
      "venueName": "Madison Square Garden",
      "venueCity": "New York"
    }
  ],
  "perPage": 10,
  "offset": 0,
  "total": 1
}
```

**Error (400 Bad Request):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INVALID_QUERY_PARAMETER",
    "message": "Invalid date format for eventStartDate",
    "details": {
      "parameter": "eventStartDate",
      "expectedFormat": "ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)"
    }
  }
}
```

**Notes:**
- Returns paginated list of events with basic information for browsing
- Venue information is simplified to id, name, and city
- All query parameters are optional
- Multiple filters can be combined (AND logic)
- Date ranges are inclusive
- Pagination: `limit` defaults to 10, `offset` defaults to 0
- Empty result returns `200 OK` with empty `data` array

### GET /event/:id

Get a single event by ID with complete details including tier availability information.

**URL:** `/api/v1/event/:id`

**Method:** `GET`

**Path Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | number | Event ID | `/api/v1/event/5` |

**Response:**

**Success (200 OK):**

```json
{
  "status": "OK",
  "data": {
    "id": 5,
    "name": "Summer Concert",
    "description": "An amazing summer concert experience",
    "startTime": "2024-07-15T19:00:00Z",
    "endTime": "2024-07-15T22:00:00Z",
    "venue": {
      "id": 2,
      "name": "Madison Square Garden",
      "address": "4 Pennsylvania Plaza",
      "city": "New York",
      "region": "NY",
      "countryCode": "US",
      "timezone": "America/New_York"
    },
    "tiers": {
      "VIP": {
        "ticketId": 1,
        "remaining": 45,
        "capacity": 100
      },
      "FRONT_ROW": {
        "ticketId": 2,
        "remaining": 20,
        "capacity": 50
      },
      "GA": {
        "ticketId": 3,
        "remaining": 200,
        "capacity": 500
      }
    }
  }
}
```

**Error (404 Not Found):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID 5 not found",
    "details": {
      "eventId": 5
    }
  }
}
```

**Error (400 Bad Request):**

```json
{
  "status": "ERROR",
  "error": {
    "code": "INVALID_EVENT_ID",
    "message": "Invalid event ID format",
    "details": {
      "eventId": "invalid"
    }
  }
}
```

**Notes:**
- Returns complete event information with full venue details
- Includes `tiers` object mapping tier codes to availability information
- Each tier includes `ticketId` for booking, `remaining`, and `capacity`
- All timestamps are in ISO 8601 format (UTC)

