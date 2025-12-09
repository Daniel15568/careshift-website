// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table: manager, staff, nurse (workers)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'staff', 'nurse')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Provider table: care home / agency account
  db.run(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      service_type TEXT,
      locations TEXT,
      roles_skill_mix TEXT,
      created_by_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by_user_id) REFERENCES users(id)
    )
  `);

  // Shifts table: shifts assigned to workers (staff / nurses)
  db.run(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,               -- worker this shift belongs to
      date TEXT NOT NULL,                     -- e.g. 2025-12-08
      start_time TEXT NOT NULL,               -- e.g. 08:00
      end_time TEXT NOT NULL,                 -- e.g. 20:00
      location TEXT,                          -- ward / home / unit name
      role TEXT,                              -- e.g. Nurse, Support Worker
      status TEXT DEFAULT 'assigned',         -- assigned/completed/cancelled
      notes TEXT,                             -- free text notes
      created_by_user_id INTEGER,             -- who assigned it (usually manager)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(created_by_user_id) REFERENCES users(id)
    )
  `);

  // Open shifts table: visible to workers as "extra work"
  db.run(`
    CREATE TABLE IF NOT EXISTS open_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT,
      role TEXT,
      notes TEXT,
      status TEXT DEFAULT 'open',            -- open / filled / cancelled
      created_by_user_id INTEGER NOT NULL,   -- manager who posted it
      assigned_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      filled_at DATETIME,
      FOREIGN KEY(created_by_user_id) REFERENCES users(id),
      FOREIGN KEY(assigned_user_id) REFERENCES users(id)
    )
  `);

  // Documents table: DBS, RTW, training etc.
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doc_type TEXT NOT NULL,                -- dbs / rtw / training / other
      file_path TEXT NOT NULL,               -- where the file lives
      original_name TEXT,
      status TEXT DEFAULT 'pending',         -- pending / verified / rejected
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verified_by_user_id INTEGER,
      verified_at DATETIME,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(verified_by_user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
