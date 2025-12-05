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
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as T[];
  }

  /**
   * Execute a query and return the first row
   */
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Begin a transaction
   */
  async beginTransaction(): Promise<PoolConnection> {
    const connection = await this.getConnection();
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
