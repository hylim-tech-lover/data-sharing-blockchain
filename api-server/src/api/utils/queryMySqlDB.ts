import {createPool, Pool } from 'mysql2/promise';
import { dataSources } from '../../config/var.config';
import Logger from "../../config/logger";

let pool: Pool;

/**
 * generates pool connection to be used throughout the app
 */
export const init = () => {
  try {
    pool = createPool(dataSources);

    Logger.info(`MySql Adapter Pool generated successfully`);
  } catch (error) {
    throw new Error(`Failed to initialized mySQL database pool: ${error}`);
  }
};

/**
 * executes SQL queries in MySQL db
 */
export const query = async (sql: string, params: string[] | object) => {
  try {
    if (!pool) throw new Error('Pool was not created. Ensure pool is created when running the app.');

    const [results] = await pool.query(sql, params);
    return results;

  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Check database pool connection. For unit testing
 */
 export const connectionIsAlive = async () => {
    // Return false if throw exception.(Database connection is off)

    try {
      await pool.query("SELECT 1");
      return true;
    }
    catch {
      return false;
    }
}

/**
 * Close database pool connection. For unit testing
 */
export const close = async () => {
  try {
    if(pool) await pool.end();

  } catch(error) {
    throw new Error (error);
  }
}