import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "backend", "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "clients.db");
const db = new Database(dbPath);

export async function GET() {
  // Only online servers
  const rows = db.prepare(`
    SELECT id, ip, serverName, envName, isConnected
    FROM clients
    WHERE isConnected = 1
  `).all();

  const servers = rows.map(r => ({
    id: r.id,
    name: r.serverName,
    ip: r.ip,
    env: r.envName,
    status: r.isConnected === 1 ? "online" : "offline"
  }));

  return Response.json(servers);
}
