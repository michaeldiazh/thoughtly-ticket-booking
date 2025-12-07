# Thoughtly Ticket Booking System

A concert ticket booking system built for the Thoughtly Application Development Engineer take-home assignment.

## Project Overview

This is an end-to-end ticket booking application with a React + TypeScript frontend and Node.js + TypeScript backend. The system prevents double-booking, supports global users, and handles high-scale traffic.

## Tech Stack

- **Backend:** Node.js 16 + TypeScript
- **Frontend:** React + TypeScript (Vite)
- **Database:** MySQL 8.4
- **Runtime:** Node.js 16.x

## Setup Instructions

### Prerequisites

- Node.js 16.x installed
- npm or yarn package manager
- MySQL 8.4 (for production, can use in-memory for development)
- Docker and Docker Compose (for integration testing and load testing)

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Build the TypeScript project:
```bash
npm run build
```

3. Run backend in development mode:
```bash
npm run dev
```

4. Run backend in production mode (after build):
```bash
npm start
```

The backend server runs on `http://localhost:3000` by default.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Run frontend in development mode:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default port).

4. Build frontend for production:
```bash
npm run build
```

### Running the Full Application

1. Start MySQL database (ensure it's running on the configured port)
2. Start the backend server (from project root):
   ```bash
   npm run dev
   ```
3. Start the frontend (in a separate terminal, from `frontend/` directory):
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will automatically connect to the backend API at `http://localhost:3000`.

**Example: Get all available tickets**
```bash
curl -X GET "http://localhost:3000/api/v1/ticket" -H "Content-Type: application/json"
```

**Example: Get a single ticket by ID**
```bash
curl -X GET "http://localhost:3000/api/v1/ticket/1" -H "Content-Type: application/json"
```

**Example: Get all events with filtering**
```bash
curl -X GET "http://localhost:3000/api/v1/event?eventName=Summer&venueCountryCode=USAS&limit=10&offset=0" -H "Content-Type: application/json"
```

**Example: Get a single event by ID**
```bash
curl -X GET "http://localhost:3000/api/v1/event/1" -H "Content-Type: application/json"
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
│   │   ├── user-ticket/      # User ticket booking feature
│   │   │   ├── api/          # Controllers and routes
│   │   │   ├── domain/       # Feature-specific DTOs
│   │   │   ├── queries/      # SQL query builders
│   │   │   └── service/      # Business logic
│   │   └── event/            # Event feature
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
├── frontend/                 # React + TypeScript frontend application
│   ├── src/                 # Frontend source files
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript type definitions
│   └── package.json         # Frontend dependencies
├── load-test/               # Load testing setup (k6 + Docker Compose)
│   ├── k6/                  # k6 load test scripts
│   ├── scripts/             # Database initialization scripts
│   └── docker-compose.yml   # Docker Compose configuration
├── dist/                     # Compiled JavaScript (generated)
├── docs/                     # Documentation and database schema
├── package.json             # Backend dependencies and scripts
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
- ✅ **TBS-10**: Implemented event endpoints (GET /api/v1/event, GET /api/v1/event/:id) with comprehensive unit and integration tests
- ✅ **TBS-11**: Implemented user feature (GET /api/v1/user, GET /api/v1/user/:id) with user ticket aggregation and comprehensive testing
- ✅ **TBS-12**: Added CORS middleware to enable frontend-backend communication
- ✅ **TBS-13**: Created shared Zod schemas and validators for reusable validation patterns
- ✅ **TBS-14**: Refactored event feature to feature-based structure with shared utilities
- ✅ **TBS-15**: Initialized React + TypeScript frontend application with Vite
- ✅ **TBS-16**: Built welcome page with user selection dropdown and global user state management (React Context)
- ✅ **TBS-17**: Created events listing page with event rows and navigation to event details
- ✅ **TBS-18**: Implemented event detail page with tier selection, quantity input, and booking form
- ✅ **TBS-19**: Integrated frontend with backend APIs (events, users, booking endpoints)
- ✅ **TBS-20**: Built booking confirmation page with ticket details and navigation flow
- ✅ **TBS-21**: Enhanced user ticket endpoint to include event and venue information in booking response
- ✅ **TBS-22**: Created comprehensive load testing setup with k6 and Docker Compose
- ✅ **TBS-23**: Validated performance requirements (p95 < 500ms) and double-booking prevention through load testing

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

- **Normalization**: The schema follows Third Normal Form (3NF) to ensure data integrity and eliminate redundancy.
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

Each feature (e.g., `ticket`, `user-ticket`, `event`, `user`) is self-contained with:
- Controllers and routes (`*.controller.ts`, `*.routes.ts`): API endpoints
- Types (`*.types.ts`): Zod schemas and TypeScript types
- Services (`*.service.ts`): Business logic and orchestration
- Queries (`queries/`): SQL query builders

This structure provides discoverability, maintainability, and testability by keeping all feature-related code in one place.

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
- **Unit Tests**: Located in `tests/unit/features/` mirroring the feature structure, using mocks for isolated testing. All features (event, ticket, user, user-ticket) have unit tests for controllers, services, and query builders.
- **Integration Tests**: Located in `tests/integration/features/`, using testcontainers with MySQL 8.4 to run tests against a real database. All features have service-level integration tests covering real database queries, data validation, and business logic (including concurrency control for user-ticket bookings).

**Running Tests**:
```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Load Testing

The project includes a comprehensive load testing setup using k6 and Docker Compose. This validates the system's performance under concurrent load and demonstrates double-booking prevention.

**Load Test Results:**
- **Performance:** p95 latency = 3.43ms (requirement: <500ms) ✅
- **Throughput:** ~309 requests/second
- **Concurrency:** Tested with 500 virtual users (scaled down from 50,000 requirement)
- **Double-Booking Prevention:** Validated through concurrent booking attempts

For detailed load testing documentation, setup instructions, and results, see [`load-test/README.md`](load-test/README.md).

**Quick Start (Load Testing):**
```bash
cd load-test
docker-compose up --build
```

### Database Connection Management

**Connection Pooling**: The `MySQLConnector` uses `mysql2`'s connection pool with configurable limits (default: 10 connections). This prevents connection exhaustion and improves performance by reusing connections.

**Transaction Isolation**: Transactions use `READ COMMITTED` isolation level, which allows each transaction to see committed changes from other transactions. This is appropriate for our concurrency control with row-level locking, where we need to see the latest committed `remaining` count before attempting to update.

**Query Method Choice**: We use `mysql2`'s `query()` method instead of `execute()` to properly handle dynamic `IN` clauses with arrays. The `query()` method uses `mysql.format()` internally, which correctly handles array parameters for SQL `IN` clauses, making our query builders more flexible.

### Concurrency Control

**Atomic Updates with Row-Level Locking**: Double-booking prevention is achieved through atomic database updates within transactions. The booking flow:
1. Begins a transaction with `READ COMMITTED` isolation
2. Atomically decrements `remaining` count with condition `remaining >= :qty`
3. Checks `affectedRows` - if 0, tickets were insufficient (another transaction got them first)
4. Rolls back on failure, commits on success

This approach ensures:
- No race conditions: MySQL's row-level locking prevents concurrent updates to the same ticket row
- No negative counts: The `remaining >= :qty` condition prevents going below zero
- Transactional integrity: If any step fails (e.g., user ticket insertion), the entire transaction rolls back

### Frontend Architecture

The frontend uses React Context for global user state management, state-based navigation (no React Router), and a centralized API service layer using the Fetch API for backend communication.

### Error Handling

**Centralized Error Handling**: All errors are handled through a centralized `handleError` middleware that converts domain errors to appropriate HTTP responses with proper status codes (400, 404, 409, 500).

**Validation Error Conversion**: Zod validation errors are converted to `InvalidRequestError` or `InvalidQueryParameterError` with field-level details, providing clear feedback to API consumers.

### Stateless Design

The backend is completely stateless - no server-side session storage. This design enables horizontal scaling, as any instance can handle any request without needing to share session state.

## License

ISC

