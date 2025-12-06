/**
 * Jest Global Setup
 * 
 * Sets up testcontainers before all tests
 */

import { setupTestDatabase, teardownTestDatabase } from './testcontainers.setup';

// Setup before all tests
beforeAll(async () => {
  await setupTestDatabase();
}, 60000); // 60 second timeout for container startup

// Teardown after all tests
afterAll(async () => {
  await teardownTestDatabase();
}, 30000); // 30 second timeout for container shutdown
