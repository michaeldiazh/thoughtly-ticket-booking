# Thoughtly Ticket Booking System

A concert ticket booking system built for the Thoughtly Application Development Engineer take-home assignment.

## Project Overview

This is an end-to-end ticket booking application with a React + TypeScript frontend and Node.js + TypeScript backend. The system prevents double-booking, supports global users, and handles high-scale traffic.

## Tech Stack

- **Backend:** Node.js 16 + TypeScript
- **Frontend:** React + TypeScript (to be implemented)
- **Database:** MySQL 8.4
- **Runtime:** Node.js 16.x

## Setup Instructions

### Prerequisites

- Node.js 16.x installed
- npm or yarn package manager
- MySQL 8.4 (for production, can use in-memory for development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript project:
```bash
npm run build
```

3. Run in development mode:
```bash
npm run dev
```

4. Run in production mode (after build):
```bash
npm start
```

### Running the Service

Once the service is running (in development or production mode), you can test the API endpoints. The server runs on `http://localhost:3000` by default.

**Example: Get all available tickets**
```bash
curl -X GET "http://localhost:3000/api/v1/ticket" -H "Content-Type: application/json"
```

For complete API documentation including all endpoints, request/response formats, and query parameters, see [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## Project Structure

```
thoughtly-ticket-booking/
├── src/              # TypeScript source files
├── dist/             # Compiled JavaScript (generated)
├── docs/             # Documentation and database schema
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Assignment Requirements

### Functional Requirements

- **Ticket Catalog & Tiers:**
  - VIP: $100
  - Front Row: $50
  - General Admission (GA): $10
- **Availability:** UI to view all available tickets and quantities per tier
- **Booking:** UI & API to book tickets (1+ quantity per tier)
- **No Double-Booking:** Prevent two users from booking the same ticket simultaneously
- **Global Users:** Support users from any country (USD currency)

### Non-Functional Requirements

- **Availability:** 99.99% design intent (discussed in README)
- **Scale:** ~1,000,000 DAU; peak ~50,000 concurrent users (discussed in README)
- **Performance:** Booking request p95 < 500ms (discussed in README)

### Technical Constraints

- **Backend:** Node.js + TypeScript (or Golang)
- **Frontend:** React + TypeScript
- **Data Store:** MySQL 8.4 (transactional store)
- **Payments:** Simulated (no real payment integration)
- **Auth:** Not required

## Development Status

- ✅ **TBS-1**: Initial project setup (Node.js 16 + TypeScript)
- ✅ **TBS-2**: Adding database documentation for Ticket Booking System
- ✅ **TBS-3**: Building API contract between frontend and backend
- ✅ **TBS-3.1**: Add venue country code to basic event information endpoint
- ✅ **TBS-3.2**: Simplify ticket listing response for better performance
- ✅ **TBS-4**: Creating all available tickets endpoint with validation and testing infrastructure
- ✅ **TBS-4.1**: Implemented Ticket Service with dependency injection, MySQL connector, and integration tests with testcontainers
- 🚧 Implementation in progress.

## Design Decisions & Trade-offs

### Database Schema

![Event Booking ERD](docs/event-booking-erd.jpg)

The database schema is defined for MySQL 8.4 and includes the following entities:

- **venue**: Stores venue information (name, address, location, timezone)
- **user**: Stores user information (name, address, location, timezone)
- **event**: Stores event information linked to venues
- **price_tier**: Defines ticket pricing tiers (GA, Front Row, VIP)
- **ticket**: Stores ticket availability and pricing per event and tier
- **user_ticket**: Stores user bookings/purchases

The complete database schema SQL can be found in [`docs/schema.sql`](docs/schema.sql).

#### Notes & Acknowledgements

- **Normalization**: The schema follows Third Normal Form (3NF) / Boyce-Codd Normal Form (BCNF) to ensure data integrity and eliminate redundancy.
- **Historical Data Preservation**: The `user_ticket.unit_price` field stores the price at the time of purchase, preserving historical pricing even if ticket prices change.
- **Event-Specific Pricing**: The `ticket.price` field allows for event-specific pricing that may differ from the `price_tier.default_price`, enabling flexible pricing strategies.
- **Concurrency Control**: Using atomic updates on the `ticket` table prevents two users from accessing the same ticket type simultaneously. The following SQL query locks the ticket row such that two users cannot update the same ticket type:

```sql
BEGIN TRANSACTION;

update ticket
   set remaining = remaining - :qty
where id = :ticketId AND remaining >= :qty;

-- Check affectedRows before committing
-- If affectedRows = 0, rollback the transaction
-- ...
COMMIT;
```

This approach ensures that:
  - The transaction provides isolation, ensuring the update is atomic and consistent
  - The row-level lock prevents concurrent updates to the same ticket row
  - If the number of remaining tickets reaches zero, `affectedRows = 0` on one of the concurrent requests prevents any change to the ticket count
  - The `remaining >= :qty` condition ensures we never go below zero
  - Wrapping in a transaction ensures that if the booking fails (e.g., payment simulation fails), the ticket count can be rolled back

### API Response Structure

Paginated responses are designed with `data`, `perPage`, `offset`, and `total` at the same level as `status` (not nested). This flat structure improves frontend consumption by avoiding unnecessary nesting, reduces payload size, and provides a consistent API contract that matches TypeScript DTOs. The structure `{ status: "OK", data: [...], perPage, offset, total }` ensures type safety and simplifies client-side pagination logic.

For complete API documentation including all endpoints, request/response formats, and error codes, see [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

### Request Validation

We use **Zod** (v3.22.4) for type-safe request validation on all API inputs. This approach provides several benefits:

- **Type Safety**: Zod schemas generate TypeScript types, ensuring compile-time type checking and runtime validation match
- **Declarative Validation**: Validation rules are defined in a single schema, making them easy to read, maintain, and test
- **Rich Error Messages**: Zod provides detailed validation errors that we convert to `InvalidQueryParameterError` with field-level issue details
- **Schema Reusability**: Validation schemas are defined in DTOs alongside their TypeScript types, keeping validation logic close to the data structures
- **Flexible Input Handling**: Our `stringifyQueryParams` utility normalizes Express query parameters (arrays, strings, numbers, booleans) before validation, supporting both comma-separated values (`?tierCodes=GA,VIP`) and multiple query params (`?tierCodes=GA&tierCodes=VIP`)

The validation layer is abstracted through a `Validator<T>` interface and `createZodValidator` factory, allowing for easy extension to other validation libraries if needed in the future.

### Service Layer Architecture

The application follows a layered architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests/responses and delegate to services
- **Services**: Contain business logic and orchestrate data access
- **Database Connector**: Provides connection pooling and query execution
- **Query Builders**: Construct type-safe SQL queries with parameter binding

**Dependency Injection**: Services are injected into controllers via constructor injection, making the code testable and maintainable. The dependency chain is: `MySQLConnector` → `TicketService` → `TicketController`.

**Database Queries**: We use `mysql2`'s `query()` method (instead of `execute()`) to properly handle dynamic `IN` clauses with arrays. The query builder uses parameterized queries for security while supporting flexible filtering.

**Testing**: Integration tests use testcontainers with MySQL 8.4 to run tests against a real database. Unit tests use mocks for isolated testing of business logic.

## License

ISC

