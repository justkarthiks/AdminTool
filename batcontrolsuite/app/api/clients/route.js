import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "backend", "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "clients.db");
const db = new Database(dbPath);

// Clients table
db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  serverName TEXT,
  envName TEXT,
  isConnected INTEGER DEFAULT 0
);
`);

export default db;
// GET /api/clients
export async function GET() {
  const rows = db.prepare("SELECT * FROM clients").all();

  const normalized = rows.map(r => ({
    id: r.id,
    ip: r.ip,
    server: r.serverName,   // Convert DB → expected
    env: r.envName,         // Convert DB → expected
    connected: Boolean(r.isConnected)
  }));

  return Response.json(normalized);
}

  
