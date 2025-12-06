/**
 * Jest Global Setup
 * 
 * Sets up testcontainers before all tests
 * Only runs for integration tests (tests in tests/integration/)
 */

import { setupTestDatabase, teardownTestDatabase } from './testcontainers.setup';

// Only setup testcontainers for integration tests
// Check if the test file path includes 'integration' at runtime
const getTestPath = (): string | undefined => {
  try {
    return expect.getState().testPath;
  } catch {
    return undefined;
  }
};

const isIntegrationTest = (): boolean => {
  const testPath = getTestPath();
  return testPath?.includes('integration') ?? false;
};

// Setup before all tests (only for integration tests)
beforeAll(async () => {
  if (isIntegrationTest()) {
    await setupTestDatabase();
  }
}, 60000); // 60 second timeout for container startup

// Teardown after all tests (only for integration tests)
afterAll(async () => {
  if (isIntegrationTest()) {
    await teardownTestDatabase();
  }
}, 30000); // 30 second timeout for container shutdown
