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

**Example: Get a single ticket by ID**
```bash
curl -X GET "http://localhost:3000/api/v1/ticket/1" -H "Content-Type: application/json"
```

For complete API documentation including all endpoints, request/response formats, and query parameters, see [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## Project Structure

```
thoughtly-ticket-booking/
├── src/                      # TypeScript source files
│   ├── app/                  # Application setup and configuration
│   │   ├── config/           # Configuration modules (database, server)
│   │   ├── middleware/       # Express middleware setup
│   │   ├── app.ts            # Express application factory
│   │   ├── routes.ts         # Route configuration
│   │   └── server.ts          # Server bootstrap
│   ├── domain/               # Shared domain types and errors
│   │   ├── common.dto.ts     # Common DTOs and response builders
│   │   ├── types.ts          # Generic API response types
│   │   ├── errors/           # Error classes
│   │   └── dtos/             # Legacy/shared DTOs
│   ├── features/             # Feature-based modules
│   │   ├── ticket/           # Ticket feature
│   │   │   ├── api/          # Controllers and routes
│   │   │   ├── domain/       # Feature-specific DTOs
│   │   │   ├── queries/      # SQL query builders
│   │   │   └── service/      # Business logic
│   │   └── user-ticket/      # User ticket booking feature
│   │       ├── api/          # Controllers and routes
│   │       ├── domain/       # Feature-specific DTOs
│   │       ├── queries/      # SQL query builders
│   │       └── service/      # Business logic
│   ├── shared/               # Shared utilities
│   │   ├── database/        # Database connector
│   │   ├── utils/           # Utility functions
│   │   └── validator/       # Validation utilities
│   └── index.ts             # Application entry point
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   │   ├── features/        # Feature-based unit tests
│   │   └── shared/         # Shared utility tests
│   └── integration/         # Integration tests
│       └── features/       # Feature-based integration tests
├── dist/                     # Compiled JavaScript (generated)
├── docs/                     # Documentation and database schema
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
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
- ✅ **TBS-4**: Creating all available tickets endpoint with validation and testing infrastructure
- ✅ **TBS-5**: Implemented GET /api/v1/ticket/:id endpoint with Zod validation and comprehensive testing
- ✅ **TBS-6**: Created POST /api/v1/user/ticket endpoint with concurrency control, common parsing utilities, standardized response format, and integration tests
- ✅ **TBS-7.1**: Refactored user-ticket feature to feature-based structure
- ✅ **TBS-7.2**: Refactored ticket feature to feature-based structure
- ✅ **TBS-7.3**: Refactored test structure to mirror feature-based organization
- ✅ **TBS-7.4**: Cleaned up old file locations after feature migration
- ✅ **TBS-8**: Setup app directory structure for application configuration and bootstrap
- ✅ **TBS-9**: Reorganized event DTOs to event feature directory structure

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

- **Type Safety**: Zod schemas generate TypeScript types using `z.infer<typeof Schema>`, ensuring compile-time type checking and runtime validation match
- **Declarative Validation**: Validation rules are defined in a single schema, making them easy to read, maintain, and test
- **Rich Error Messages**: Zod provides detailed validation errors that we convert to `InvalidQueryParameterError` or `InvalidRequestError` with field-level issue details
- **Schema Reusability**: Validation schemas are defined in DTOs alongside their TypeScript types, keeping validation logic close to the data structures
- **Flexible Input Handling**: Our `stringifyQueryParams` utility normalizes Express query parameters (arrays, strings, numbers, booleans) before validation, supporting both comma-separated values (`?tierCodes=GA,VIP`) and multiple query params (`?tierCodes=GA&tierCodes=VIP`)
- **Data Preprocessing**: Zod's `z.preprocess()` allows us to transform data before validation (e.g., parsing JSON strings from MySQL `JSON_OBJECT` results, converting string prices to numbers)

The validation layer is abstracted through a `Validator<T>` interface and `createZodValidator` factory, allowing for easy extension to other validation libraries if needed in the future.

### Architecture

The application follows a **feature-based architecture** with clear separation of concerns:

#### Feature-Based Structure

Each feature (e.g., `ticket`, `user-ticket`) is self-contained with:
- **API Layer** (`api/`): Controllers and route definitions
- **Domain Layer** (`domain/`): DTOs, types, and domain-specific logic
- **Service Layer** (`service/`): Business logic and orchestration
- **Query Layer** (`queries/`): SQL query builders

This structure provides:
- **Discoverability**: All code related to a feature is in one place
- **Maintainability**: Easy to locate and modify feature-specific code
- **Scalability**: New features can be added without affecting existing ones
- **Testability**: Feature tests mirror the source structure

#### Application Setup

The application setup is organized in `src/app/`:
- **Configuration** (`config/`): Database and server configuration
- **Middleware** (`middleware/`): Express middleware setup
- **Routes** (`routes.ts`): Route configuration
- **App Factory** (`app.ts`): Express application factory function
- **Server Bootstrap** (`server.ts`): Server startup logic

#### Shared Resources

Common utilities are organized in `src/shared/`:
- **Database** (`database/`): MySQL connection pooling and transaction management
- **Utils** (`utils/`): Error handling, parsing, and query parameter utilities
- **Validator** (`validator/`): Validation interfaces and Zod factory

#### Dependency Injection

Services are injected into controllers via constructor injection, making the code testable and maintainable. The dependency chain is: `MySQLConnector` → `Service` → `Controller`.

**Database Queries**: We use `mysql2`'s `query()` method (instead of `execute()`) to properly handle dynamic `IN` clauses with arrays. The query builder uses parameterized queries for security while supporting flexible filtering.

**Testing**: 
- **Unit Tests**: Located in `tests/unit/features/` mirroring the feature structure, using mocks for isolated testing
- **Integration Tests**: Located in `tests/integration/features/`, using testcontainers with MySQL 8.4 to run tests against a real database

## License

ISC

