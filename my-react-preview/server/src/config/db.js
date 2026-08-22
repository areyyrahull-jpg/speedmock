/**
 * config/db.js
 * Standard PostgreSQL connection pool pointing to Supabase
 */
require("dotenv").config(); // MUST be first — loads .env before anything reads process.env

const { Pool } = require("pg");



if (!process.env.DATABASE_URL) {
  
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    
  } else {
    
    release();
  }
});

module.exports = pool;