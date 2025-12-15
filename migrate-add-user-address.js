// migrate-add-user-address.js
// One-off script to add address + profile photo columns to the users table.

const db = require('./db');

const statements = [
  "ALTER TABLE users ADD COLUMN house_number TEXT;",
  "ALTER TABLE users ADD COLUMN street_name TEXT;",
  "ALTER TABLE users ADD COLUMN city TEXT;",
  "ALTER TABLE users ADD COLUMN postcode TEXT;",
  "ALTER TABLE users ADD COLUMN profile_photo_path TEXT;"
];

let index = 0;

function runNext() {
  if (index >= statements.length) {
    console.log('All migrations attempted. You can ignore "duplicate column name" errors if you saw any.');
    db.close();
    return;
  }

  const sql = statements[index];
  console.log('Running:', sql);

  db.run(sql, (err) => {
    if (err) {
      // If you run this script twice, you'll get "duplicate column name" – that’s OK.
      if (err.message && err.message.includes('duplicate column name')) {
        console.log('  -> Column already exists, skipping.');
      } else {
        console.error('  -> Error:', err.message);
      }
    } else {
      console.log('  -> OK');
    }

    index++;
    runNext();
  });
}

runNext();
