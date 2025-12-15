// migrate-add-user-profile-fields.js
//
// One-off script to add profile photo + address fields to the users table.

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function addColumn(sql) {
  return new Promise((resolve) => {
    db.run(sql, (err) => {
      if (err) {
        // If the column already exists, SQLite will throw an error.
        // We just log it and carry on so the script is safe to re-run.
        console.log('SQL:', sql);
        console.log(' ->', err.message);
      } else {
        console.log('SQL:', sql);
        console.log(' -> OK');
      }
      resolve();
    });
  });
}

(async () => {
  console.log('Migrating database at', dbPath);

  // New columns we need
  await addColumn(`ALTER TABLE users ADD COLUMN profile_photo_path TEXT`);
  await addColumn(`ALTER TABLE users ADD COLUMN house_number TEXT`);
  await addColumn(`ALTER TABLE users ADD COLUMN street_name TEXT`);
  await addColumn(`ALTER TABLE users ADD COLUMN city TEXT`);
  await addColumn(`ALTER TABLE users ADD COLUMN postcode TEXT`);

  console.log('Migration finished.');
  db.close();
})();
