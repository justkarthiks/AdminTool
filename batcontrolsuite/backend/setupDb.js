/**
 * setupDb.js
 * SQLite schema + migrations for BatControlSuite
 * Run: node setupDb.js
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to DB
const DB_PATH = path.join(__dirname, "db", "database.sqlite");

// Connect
const db = new sqlite3.Database(DB_PATH);

console.log("🛠 Creating SQLite database at:", DB_PATH);

db.serialize(() => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  // SERVERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT DEFAULT 'offline',
      last_seen DATETIME
    );
  `);

  // SCRIPTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // EXECUTIONS TABLE (parent job)
  db.run(`
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      triggered_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // EXECUTION RESULTS TABLE (matrix)
  db.run(`
    CREATE TABLE IF NOT EXISTS execution_results (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      server_id TEXT NOT NULL,
      script_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      start_time DATETIME,
      end_time DATETIME,
      exit_code INTEGER,
      log_text TEXT,

      FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
      FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
      FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
    );
  `);

  // INDICES for fast UI
  db.run(`CREATE INDEX IF NOT EXISTS idx_servers_name ON servers(name);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_scripts_name ON scripts(name);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_exec_results_exec ON execution_results(execution_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_exec_results_server ON execution_results(server_id);`);

  console.log("✅ Database schema created successfully!");
});

db.close();
