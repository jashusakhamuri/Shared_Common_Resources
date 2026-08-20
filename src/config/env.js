// require('dotenv').config();

// function required(name, fallback) {
//   const v = process.env[name] ?? fallback;
//   if (v === undefined) throw new Error(`Missing required env var: ${name}`);
//   return v;
// }

// module.exports = {
//   NODE_ENV: process.env.NODE_ENV || 'development',
//   PORT: parseInt(process.env.PORT || '5000', 10),

//   PG_USER: required('PG_USER', 'postgres'),
//   PG_HOST: required('PG_HOST', 'localhost'),
//   PG_DATABASE: required('PG_DATABASE', 'shared_resource_platform'),
//   PG_PASSWORD: process.env.PG_PASSWORD || '',
//   PG_PORT: parseInt(process.env.PG_PORT || '5432', 10),

//   JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
//   JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
//   JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
//   JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

//   CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

//   UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
//   MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '200', 10),
// };
require('dotenv').config();

/**
 * Read an environment variable.
 *
 * If the variable exists, return it.
 * If it does not exist and no default value is provided,
 * throw an error.
 */
function required(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

module.exports = {
  // =========================================================
  // APPLICATION
  // =========================================================

  NODE_ENV: process.env.NODE_ENV || 'development',

  /**
   * Render provides PORT automatically in production.
   *
   * Local:
   *   PORT=5000
   *
   * Render:
   *   PORT=<Render automatically provides this>
   */
  PORT: parseInt(process.env.PORT || '5000', 10),

  // =========================================================
  // POSTGRESQL
  // =========================================================

  /**
   * LOCAL DEVELOPMENT
   *
   * These variables are used when DATABASE_URL does not exist.
   *
   * Example:
   * PG_HOST=localhost
   * PG_PORT=5432
   */

  PG_USER: process.env.PG_USER || 'postgres',

  PG_HOST: process.env.PG_HOST || 'localhost',

  PG_DATABASE:
    process.env.PG_DATABASE || 'shared_resource_platform',

  PG_PASSWORD: process.env.PG_PASSWORD || '',

  PG_PORT: parseInt(
    process.env.PG_PORT || '5432',
    10
  ),

  /**
   * PRODUCTION
   *
   * Supabase will provide this PostgreSQL connection string.
   *
   * Example:
   *
   * DATABASE_URL=postgresql://user:password@host:5432/database
   *
   * We will add the real value later in Render.
   */
  DATABASE_URL: process.env.DATABASE_URL || null,

  // =========================================================
  // JWT
  // =========================================================

  JWT_ACCESS_SECRET: required(
    'JWT_ACCESS_SECRET',
    'dev-access-secret-change-me'
  ),

  JWT_REFRESH_SECRET: required(
    'JWT_REFRESH_SECRET',
    'dev-refresh-secret-change-me'
  ),

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // =========================================================
  // CORS
  // =========================================================

  CORS_ORIGIN:
    process.env.CORS_ORIGIN || '*',

  // =========================================================
  // FILE UPLOAD
  // =========================================================

  /**
   * Local development:
   * files are stored in ./uploads
   *
   * Later in production we will move uploaded files
   * to cloud storage.
   */
  UPLOAD_DIR:
    process.env.UPLOAD_DIR || './uploads',

  MAX_FILE_SIZE_MB: parseInt(
    process.env.MAX_FILE_SIZE_MB || '50',
    10
  ),
};