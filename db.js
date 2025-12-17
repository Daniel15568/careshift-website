// db.js
//
// Unified DB wrapper:
// - In production (DATABASE_URL set) → use Postgres via pg
// - In development → use SQLite via sqlite3
//
// Exports a "db" object with .get, .all, .run, .prepare
// compatible with the way server.js currently uses it.

const path = require('path');

const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  // -----------------------------
  // Postgres (Render / production)
  // -----------------------------
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Helper to normalize callback signature to match sqlite3 style
  function wrapQueryForGet(sql, params, cb) {
    pool
      .query(sql, params)
      .then((res) => cb(null, res.rows[0] || null))
      .catch((err) => cb(err));
  }

  function wrapQueryForAll(sql, params, cb) {
    pool
      .query(sql, params)
      .then((res) => cb(null, res.rows))
      .catch((err) => cb(err));
  }

  function wrapQueryForRun(sql, params, cb) {
    // Try to return an id when there is one
    pool
      .query(sql, params)
      .then((res) => {
        const ctx = {
          lastID: res.rows && res.rows[0] && res.rows[0].id,
        };
        if (cb) cb.call(ctx, null);
      })
      .catch((err) => {
        if (cb) cb(err);
      });
  }

  function prepare(sql) {
    return {
      run: function (...args) {
        let cb = null;
        if (args.length && typeof args[args.length - 1] === 'function') {
          cb = args.pop();
        }
        const params = args;
        wrapQueryForRun(sql, params, cb);
      },
    };
  }

  module.exports = {
    get: wrapQueryForGet,
    all: wrapQueryForAll,
    run: wrapQueryForRun,
    prepare,
  };
} else {
  // -----------------------------
  // SQLite (local development)
  // -----------------------------
  const sqlite3 = require('sqlite3').verbose();

  const dbFile = path.join(__dirname, 'database.sqlite');
  const sqliteDb = new sqlite3.Database(dbFile);

  module.exports = sqliteDb;
}
