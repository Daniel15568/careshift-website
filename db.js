// db.js
// Chooses between SQLite (local) and Postgres (Render) based on DATABASE_URL

if (process.env.DATABASE_URL) {
  console.log('Using Postgres database (DATABASE_URL is set)');
  module.exports = require('./db-postgres');
} else {
  console.log('Using SQLite database (no DATABASE_URL found)');
  module.exports = require('./db-sqlite');
}
