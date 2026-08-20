// const { Pool } = require('pg');
// const env = require('./env');

// const pool = new Pool({
//   user: env.PG_USER,
//   host: env.PG_HOST,
//   database: env.PG_DATABASE,
//   password: env.PG_PASSWORD,
//   port: env.PG_PORT,
// });

// pool.on('error', (err) => {
//   console.error('Unexpected PostgreSQL error', err);
// });

// module.exports = pool;
const { Pool } = require('pg');

const env = require('./env');

/**
 * PostgreSQL connection configuration.
 *
 * TWO MODES:
 *
 * 1. LOCAL
 *    Uses PG_USER, PG_HOST, PG_DATABASE,
 *    PG_PASSWORD and PG_PORT.
 *
 * 2. CLOUD / SUPABASE
 *    Uses DATABASE_URL.
 */

let poolConfig;

if (env.DATABASE_URL) {
  // ========================================================
  // SUPABASE / CLOUD POSTGRESQL
  // ========================================================

  poolConfig = {
    connectionString: env.DATABASE_URL,

    // Supabase PostgreSQL connection uses SSL.
    ssl: {
      rejectUnauthorized: false,
    },
  };

  console.log('PostgreSQL mode: CLOUD');
} else {
  // ========================================================
  // LOCAL POSTGRESQL
  // ========================================================

  poolConfig = {
    user: env.PG_USER,
    host: env.PG_HOST,
    database: env.PG_DATABASE,
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
  };

  console.log('PostgreSQL mode: LOCAL');
}

// ========================================================
// CREATE CONNECTION POOL
// ========================================================

const pool = new Pool(poolConfig);

// ========================================================
// HANDLE UNEXPECTED DATABASE ERRORS
// ========================================================

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

// ========================================================
// TEST DATABASE CONNECTION
// ========================================================

pool.query('SELECT NOW() AS current_time')
  .then((result) => {
    console.log('PostgreSQL connected successfully!');
    console.log(
      'Database time:',
      result.rows[0].current_time
    );
  })
  .catch((error) => {
    console.error('PostgreSQL connection failed!');
    console.error(error.message);
  });
  pool.query('SELECT COUNT(*) FROM users')
  .then((result) => {
    console.log(
      'Users table:',
      result.rows[0].count
    );
  })
  .catch((error) => {
    console.error(
      'Users table test failed:',
      error.message
    );
  });

// Export pool so the rest of your application can use it.
module.exports = pool;