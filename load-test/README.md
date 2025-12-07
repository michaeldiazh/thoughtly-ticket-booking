# Load Testing with Docker Compose and k6

This directory contains everything needed to run load tests in Docker containers, simulating concurrent booking requests and measuring performance metrics.

## What This Does

1. **Starts MySQL 8.4** - Database with schema and test data
2. **Starts Backend Service** - Your Node.js backend running in a container
3. **Runs k6 Load Tests** - Simulates concurrent users booking tickets
4. **Measures Performance** - Tracks p50, p75, p90, p95 latency and verifies p95 < 500ms requirement

## Prerequisites

- Docker installed on your machine
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Step 1: Build and Start All Services

```bash
cd load-test
docker-compose up --build
```

This will:
- Build the backend Docker image
- Start MySQL container
- Initialize database with schema and test data
- Start backend service
- Run k6 load tests automatically

### Step 2: View Results

The k6 test will output results to:
- **Console** - Real-time metrics and final summary
- **load-test-results.json** - Detailed JSON results (in k6 container)

To see the results after the test completes:

```bash
# View logs from k6 container
docker logs load-test-k6

# Or view all logs
docker-compose logs k6
```

### Step 3: Clean Up

When done, stop and remove all containers:

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Understanding the Results

### Key Metrics

- **p50, p75, p90, p95** - Response time percentiles
  - p95 < 500ms is the requirement
  - Shows how fast 95% of requests complete

- **booking_success** - Percentage of successful bookings
  - Some failures are expected (insufficient tickets)
  - Should be > 80%

- **http_req_failed** - HTTP error rate
  - Should be < 1% (only 5xx errors count as failures)

### What the Test Does

1. **Ramps up** from 0 to 100 virtual users over 30 seconds
2. **Sustains** 100 users for 1 minute
3. **Ramps up** to 500 virtual users over 1 minute
4. **Sustains** 500 users for 2 minutes (peak load)
5. **Ramps down** to 0 over 30 seconds

Each virtual user:
- Randomly selects a ticket (VIP, FRONT_ROW, or GA)
- Randomly selects a user ID
- Requests 1-3 tickets
- Waits 0-2 seconds between requests

## Manual Testing

### Run Only Database and Backend

```bash
# Start MySQL and backend (no k6)
docker-compose up mysql backend

# In another terminal, test manually
curl -X POST http://localhost:3000/api/v1/user/ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketId": 1, "userId": 1, "quantity": 1}'
```

### Run k6 Manually

```bash
# Start all services
docker-compose up -d mysql backend

# Wait for backend to be ready
sleep 10

# Run k6 manually with custom options
docker run --rm -i --network load-test_load-test-network \
  -v $(pwd)/k6:/scripts grafana/k6 run /scripts/booking-load-test.js
```

## Customizing the Test

Edit `k6/booking-load-test.js` to change:

- **Stages** - Number of users and duration
- **TICKET_IDS** - Which tickets to test
- **USER_IDS** - Which users to use
- **Thresholds** - Performance requirements

## Troubleshooting

### Backend won't start

```bash
# Check backend logs
docker-compose logs backend

# Check if MySQL is ready
docker-compose logs mysql
```

### k6 can't connect to backend

```bash
# Verify backend is running
curl http://localhost:3000/api/v1/user

# Check network
docker network inspect load-test_load-test-network
```

### Database connection errors

```bash
# Check MySQL is healthy
docker-compose ps

# View MySQL logs
docker-compose logs mysql
```

## Files Explained

- **docker-compose.yml** - Orchestrates all 3 services
- **Dockerfile.backend** - Builds your backend container
- **scripts/init-db.sql** - Database schema and test data
- **k6/booking-load-test.js** - k6 load test script

## Next Steps

After running the test, you can:

1. **Analyze Results** - Check if p95 < 500ms requirement is met
2. **Verify Double-Booking Prevention** - Check that no duplicate bookings occurred
3. **Tune Performance** - Adjust connection pools, database indexes, etc.
4. **Scale Testing** - Increase virtual users to test higher loads

