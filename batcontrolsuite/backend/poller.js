import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "backend", "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "clients.db");
const db = new Database(dbPath);

async function pollAllClients() {
  const clients = db.prepare("SELECT * FROM clients").all();

  for (const c of clients) {
    let online = false;

    try {
      const res = await fetch(`http://${c.ip}:4000/api/receive`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        online = data.status === "success";
      }
    } catch (err) {
      online = false;
    }

    db.prepare(`UPDATE clients SET isConnected = ? WHERE id = ?`)
      .run(online ? 1 : 0, c.id);
  }

  console.log("Polling completed:", new Date().toISOString());
}

// Run every 3 seconds
setInterval(pollAllClients, 3000);
pollAllClients();
