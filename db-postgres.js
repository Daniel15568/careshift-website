// db-postgres.js
// Postgres version of our DB helper, mimicking the sqlite API (all/get/run/prepare)

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set. Postgres db will not work without it.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }   // needed on Render
    : false,
});

// Helper: run a query and use a callback (err, rows)
function query(text, params, cb) {
  pool
    .query(text, params || [])
    .then((result) => cb(null, result))
    .catch((err) => cb(err));
}

const db = {
  // Like sqlite db.all(sql, params, cb)
  all(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    query(sql, params, (err, result) => {
      if (err) return cb(err);
      cb(null, result.rows);
    });
  },

  // Like sqlite db.get(sql, params, cb)
  get(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    query(sql, params, (err, result) => {
      if (err) return cb(err);
      cb(null, result.rows[0] || null);
    });
  },

  // Like sqlite db.run(sql, params, cb)
  run(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    query(sql, params, (err, result) => {
      if (cb) {
        cb(err, { rowCount: result ? result.rowCount : 0 });
      }
    });
  },

  // Rough emulation of sqlite db.prepare(sql).run(params..., cb)
  prepare(sql) {
    return {
      run: (...args) => {
        let cb = null;
        if (typeof args[args.length - 1] === 'function') {
          cb = args.pop();
        }
        const params = args;

        query(sql, params, (err, result) => {
          if (cb) {
            cb(err, { rowCount: result ? result.rowCount : 0 });
          }
        });
      },
    };
  },
};

module.exports = db;
