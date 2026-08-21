import { Pool } from "pg";
import { DATABASE_URL } from "../constants/env.js";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function reset() {
  const client = await pool.connect();
  try {
    console.log("Cleaning database...");
    
    // Drop all tables in the public schema
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO public;
      COMMENT ON SCHEMA public IS 'standard public schema';
    `);

    console.log("Database cleaned successfully.");
  } catch (error) {
    console.error("Error cleaning database:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

reset();
