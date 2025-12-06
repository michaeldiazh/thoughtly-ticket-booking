/**
 * MySQL Database Connector
 * 
 * Provides connection management and query execution for MySQL database
 */

import mysql, { Pool, PoolOptions, PoolConnection } from 'mysql2/promise';

export interface MySQLConfig extends PoolOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class MySQLConnector {
  private pool: Pool;

  constructor(config: MySQLConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: config.queueLimit || 0,
      enableKeepAlive: config.enableKeepAlive !== false,
      keepAliveInitialDelay: config.keepAliveInitialDelay || 0,
    });
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  /**
   * Execute a query with automatic connection management
   * Uses query() instead of execute() to handle dynamic IN clauses properly
   * mysql2's query() uses mysql.format() internally which handles arrays correctly
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = await this.getConnection();
    try {
      // Use query() instead of execute() for better support of dynamic IN clauses
      // query() uses mysql.format() internally which properly handles arrays
      const [result] = await connection.query(sql, params || []);
      return result as T[];
    } finally {
      connection.release();
    }
  }

  /**
   * Execute a query and return the first row
   * Uses query() instead of execute() to handle dynamic IN clauses properly
   */
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const connection = await this.getConnection();
    try {
      // Use query() instead of execute() for better support of dynamic IN clauses
      const [result] = await connection.query(sql, params || []);
      const rows = result as T[];
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Begin a transaction with READ COMMITTED isolation level
   * READ COMMITTED allows each transaction to see committed changes from other transactions,
   * which is appropriate for our concurrency control with row-level locking
   */
  async beginTransaction(): Promise<PoolConnection> {
    const connection = await this.getConnection();
    // Set isolation level before starting transaction
    await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await connection.beginTransaction();
    return connection;
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Get the underlying pool (for advanced usage)
   */
  getPool(): Pool {
    return this.pool;
  }
}
