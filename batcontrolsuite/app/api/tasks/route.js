// app/api/tasks/route.js
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Resolve DB path
const dbDir = path.join(process.cwd(), "backend", "db");
const dbPath = path.join(dbDir, "scheduler.db");

// Ensure folder exists
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

// Initialize DB table
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

export async function GET() {
    const rows = db.prepare("SELECT * FROM tasks").all();

    return Response.json(
        rows.map(r => ({
            id: r.id,
            clientIP: r.clientIP,
            script: r.script,
            args: JSON.parse(r.args || "[]"),
            type: r.type,
            schedule: JSON.parse(r.scheduleJson),
            enabled: !!r.enabled,
            lastExecuted: r.lastExecuted
        }))
    );
}
