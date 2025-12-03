import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "backend/db/scheduler.db");

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientIP TEXT,
    script TEXT,
    args TEXT,
    type TEXT,
    scheduleJson TEXT,
    enabled INTEGER,
    lastExecuted TEXT
);
`);

export default db;
