import db from "@/app/api/clients/route"; // re-use the same database instance

export async function POST() {
  try {
    // 1. Get all clients
    const clients = db.prepare("SELECT * FROM clients").all();

    for (const client of clients) {
      let online = false;

      try {
        const res = await fetch(`http://${client.ip}:4000/api/receive`, {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          online = data.status === "success";
        }
      } catch (e) {
        online = false;
      }

      // 2. Update DB with online/offline result
      db.prepare(`
        UPDATE clients
        SET isConnected = ?
        WHERE id = ?
      `).run(online ? 1 : 0, client.id);
    }

    // 3. Return updated clients
    const updated = db.prepare("SELECT * FROM clients").all();

    return Response.json({
      success: true,
      clients: updated.map(r => ({
        id: r.id,
        ip: r.ip,
        server: r.serverName,
        env: r.envName,
        connected: Boolean(r.isConnected),
      })),
    });

  } catch (err) {
    console.error("updateStatus error:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
