import db from "../../../../backend/db/initClients";

export async function POST(req) {
  const body = await req.json();

  const ip = body.ip || "";
  const serverName = body.server || body.serverName || "";
  const envName = body.env || body.envName || "";
  const isConnected = body.connected ?? body.isConnected ?? 0;

  // UPDATE existing client
  if (body.id) {
    db.prepare(`
      UPDATE clients
      SET ip = ?, serverName = ?, envName = ?, isConnected = ?
      WHERE id = ?
    `).run(ip, serverName, envName, isConnected ? 1 : 0, body.id);
  }

  // INSERT new client
  else {
    db.prepare(`
      INSERT INTO clients (ip, serverName, envName, isConnected)
      VALUES (?, ?, ?, ?)
    `).run(ip, serverName, envName, isConnected ? 1 : 0);
  }

  return Response.json({ status: "ok" });
}
