/**
 * Testcontainers Setup
 * 
 * Sets up MySQL 8.4 container for integration tests
 */

import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { MySQLConnector, MySQLConfig } from '../../src/service/database/mysql.connector';
import * as fs from 'fs';
import * as path from 'path';

let mysqlContainer: StartedMySqlContainer | null = null;
let testDb: MySQLConnector | null = null;

/**
 * Run schema migrations from schema.sql file
 */
async function runSchemaMigrations(db: MySQLConnector): Promise<void> {
  const schemaPath = path.join(__dirname, '../../docs/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Remove comments and split by semicolons
  const statements = schema
    .split('\n')
    .filter((line) => !line.trim().startsWith('--') && line.trim().length > 0)
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Ignore errors for statements that might already exist (like indexes)
      if (err?.code !== 'ER_DUP_KEYNAME' && err?.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.warn(`Warning executing statement: ${err?.message || String(error)}`);
      }
    }
  }
}

/**
 * Load test data from test_data.sql file
 */
export async function loadTestData(db: MySQLConnector): Promise<void> {
  const testDataPath = path.join(__dirname, 'test_data.sql');
  const testData = fs.readFileSync(testDataPath, 'utf-8');

  // Remove comments and split by semicolons
  const statements = testData
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    })
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Ignore duplicate key errors (for re-running tests)
      if (err?.code !== 'ER_DUP_ENTRY') {
        console.warn(`Warning loading test data: ${err?.message || String(error)}`);
      }
    }
  }
}

/**
 * Start MySQL container and return database connector
 */
export async function setupTestDatabase(): Promise<MySQLConnector> {
  if (mysqlContainer && testDb) {
    return testDb;
  }

  // Start MySQL 8.4 container
  const container = await new MySqlContainer('mysql:8.4')
    .withDatabase('test_db')
    .withRootPassword('testpassword')
    .start();

  mysqlContainer = container;

  // Get connection details
  const host = container.getHost();
  const port = container.getPort();
  const database = 'test_db';
  const user = 'root';
  const password = 'testpassword';

  // Create database connector
  const dbConfig: MySQLConfig = {
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
  };

  testDb = new MySQLConnector(dbConfig);

  // Run schema migrations
  await runSchemaMigrations(testDb);

  // Load test data
  await loadTestData(testDb);

  return testDb;
}

/**
 * Stop MySQL container and cleanup
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testDb) {
    await testDb.close();
    testDb = null;
  }

  if (mysqlContainer) {
    await mysqlContainer.stop();
    mysqlContainer = null;
  }
}

/**
 * Get the test database connector (must be called after setupTestDatabase)
 */
export function getTestDatabase(): MySQLConnector {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testDb;
}
