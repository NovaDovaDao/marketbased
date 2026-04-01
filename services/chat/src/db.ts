import pg from "pg";

const { Pool } = pg;

// Shared Postgres pool for the chat microservice
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("[chat] Postgres pool error", err);
});
