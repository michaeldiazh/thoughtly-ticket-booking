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

## Project Structure

```
thoughtly-ticket-booking/
├── src/              # TypeScript source files
├── dist/             # Compiled JavaScript (generated)
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

🚧 Project setup complete. Implementation in progress.

## Design Decisions & Trade-offs

_To be documented as implementation progresses._

## License

ISC

