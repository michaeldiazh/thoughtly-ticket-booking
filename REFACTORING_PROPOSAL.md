# File Structure Refactoring Proposal

## Current Issues

1. **Inconsistent naming**: `ticket.routes.ts` vs `user-ticket.route.ts`
2. **Scattered related code**: Services, queries, DTOs, controllers are in different locations
3. **Hard to discover features**: Related code for a feature (e.g., "ticket") is spread across multiple directories
4. **Main index.ts is bloated**: All dependency injection happens in one file
5. **Mixed DTO organization**: Some DTOs in subdirectories, some at root level

## Proposed Structure: Feature-Based Organization

```
src/
├── shared/                          # Shared utilities across features
│   ├── database/
│   │   ├── mysql.connector.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── error-handler.util.ts
│   │   ├── parse.util.ts
│   │   ├── query-param.util.ts
│   │   └── index.ts
│   └── validator/
│       ├── validator.interface.ts
│       ├── zod-validator.factory.ts
│       ├── zod-preprocessors.util.ts
│       └── index.ts
│
├── domain/                          # Domain models and shared types
│   ├── errors/
│   │   ├── base.error.ts
│   │   ├── ticket.errors.ts
│   │   ├── event.errors.ts
│   │   ├── validation.errors.ts
│   │   └── index.ts
│   ├── types.ts                     # Shared types (APIResponse, etc.)
│   └── common.dto.ts                # Common DTOs (buildSucceededResponse, etc.)
│
├── features/                        # Feature-based modules
│   ├── ticket/
│   │   ├── api/
│   │   │   ├── ticket.controller.ts
│   │   │   ├── ticket.routes.ts
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── dtos/
│   │   │   │   ├── ticket.dto.ts
│   │   │   │   ├── simplified-ticket.dto.ts
│   │   │   │   ├── get-tickets-query.dto.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── service/
│   │   │   ├── ticket.service.ts
│   │   │   └── index.ts
│   │   ├── queries/
│   │   │   ├── get-ticket-by-id.query.ts
│   │   │   ├── get-tickets.query.ts
│   │   │   ├── update-ticket-remaining.query.ts
│   │   │   └── index.ts
│   │   └── index.ts                 # Public API for ticket feature
│   │
│   └── user-ticket/
│       ├── api/
│       │   ├── user-ticket.controller.ts
│       │   ├── user-ticket.routes.ts
│       │   └── index.ts
│       ├── domain/
│       │   ├── dtos/
│       │   │   ├── user-ticket.dto.ts
│       │   │   ├── user-ticket-request.dto.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── service/
│       │   ├── user-ticket.service.ts
│       │   └── index.ts
│       ├── queries/
│       │   ├── get-user-ticket.query.ts
│       │   ├── insert-user-ticket.query.ts
│       │   └── index.ts
│       └── index.ts                 # Public API for user-ticket feature
│
├── app/                             # Application setup
│   ├── config/
│   │   ├── database.config.ts
│   │   └── index.ts
│   ├── server.ts                    # Express app setup
│   └── index.ts                     # Entry point with DI container
│
└── index.ts                         # Main entry point (minimal)
```

## Alternative: Domain-Driven Design Structure

If you prefer a more traditional layered architecture:

```
src/
├── infrastructure/                  # External concerns
│   ├── database/
│   │   └── mysql.connector.ts
│   └── http/
│       ├── express/
│       │   ├── error-handler.middleware.ts
│       │   └── index.ts
│       └── utils/
│           ├── parse.util.ts
│           └── query-param.util.ts
│
├── domain/                          # Business domain
│   ├── ticket/
│   │   ├── entities/
│   │   ├── repositories/
│   │   │   └── ticket.repository.interface.ts
│   │   ├── services/
│   │   │   └── ticket.service.ts
│   │   └── errors/
│   │       └── ticket.errors.ts
│   │
│   └── user-ticket/
│       ├── entities/
│       ├── repositories/
│       ├── services/
│       └── errors/
│
├── application/                     # Application layer
│   ├── ticket/
│   │   ├── dtos/
│   │   ├── queries/
│   │   └── ticket.application.service.ts
│   │
│   └── user-ticket/
│       ├── dtos/
│       ├── queries/
│       └── user-ticket.application.service.ts
│
├── presentation/                    # API layer
│   ├── controllers/
│   │   ├── ticket.controller.ts
│   │   └── user-ticket.controller.ts
│   ├── routes/
│   │   ├── ticket.routes.ts
│   │   └── user-ticket.routes.ts
│   └── middleware/
│       └── validation.middleware.ts
│
└── shared/                          # Shared utilities
    ├── validator/
    └── types/
```

## Recommendation: Feature-Based Structure

**Why Feature-Based?**
1. **Easier onboarding**: New engineers can find all ticket-related code in one place
2. **Better scalability**: Adding new features doesn't require touching multiple directories
3. **Clearer boundaries**: Each feature is self-contained
4. **Easier refactoring**: Can move/remove features without affecting others
5. **Better test organization**: Tests can mirror the feature structure

## Migration Strategy

1. **Phase 1**: Create new structure alongside old (parallel)
2. **Phase 2**: Move one feature at a time (start with `user-ticket` as it's smaller)
3. **Phase 3**: Update imports and tests
4. **Phase 4**: Remove old structure
5. **Phase 5**: Update documentation

## Benefits

- ✅ **Discoverability**: All code for a feature in one place
- ✅ **Maintainability**: Changes are localized to feature directories
- ✅ **Testability**: Tests mirror feature structure
- ✅ **Scalability**: Easy to add new features
- ✅ **Consistency**: Same structure for all features
- ✅ **Clear dependencies**: Features depend on `shared/` and `domain/`, not each other

## Example: Ticket Feature Structure

```
features/ticket/
├── api/
│   ├── ticket.controller.ts        # HTTP request handling
│   ├── ticket.routes.ts            # Route definitions
│   └── index.ts                     # Export: createTicketRoutes
│
├── domain/
│   └── dtos/                        # Data transfer objects
│       ├── ticket.dto.ts
│       ├── simplified-ticket.dto.ts
│       ├── get-tickets-query.dto.ts
│       └── index.ts
│
├── service/
│   └── ticket.service.ts            # Business logic
│
├── queries/                         # SQL query builders
│   ├── get-ticket-by-id.query.ts
│   ├── get-tickets.query.ts
│   ├── update-ticket-remaining.query.ts
│   └── index.ts
│
└── index.ts                         # Public API
    export { createTicketRoutes } from './api';
    export { TicketService } from './service';
    export * from './domain';
```

## Import Examples

**Before:**
```typescript
import { TicketService } from '../../service/ticket.service';
import { Ticket } from '../../domain/dtos/ticket/ticket.dto';
import { buildTicketByIdQuery } from '../../service/query/ticket/get-ticket-by-id.query';
```

**After:**
```typescript
import { TicketService, Ticket, buildTicketByIdQuery } from '../features/ticket';
// or
import { TicketService } from '../features/ticket/service';
import { Ticket } from '../features/ticket/domain';
import { buildTicketByIdQuery } from '../features/ticket/queries';
```

## Test Structure (Mirrors Source)

```
tests/
├── unit/
│   └── features/
│       ├── ticket/
│       │   ├── api/
│       │   ├── service/
│       │   └── queries/
│       └── user-ticket/
│           ├── api/
│           ├── service/
│           └── queries/
│
└── integration/
    └── features/
        ├── ticket/
        └── user-ticket/
```

