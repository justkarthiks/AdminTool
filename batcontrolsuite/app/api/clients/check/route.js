import db from "../../../../backend/db/initClients";

export async function POST(req) {
  try {
    const { ip } = await req.json();

    const url = `http://${ip}:4000/api/receives`;

    let isConnected = false;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true }),
      });

      const data = await res.json();

      if (data.status === "success") {
        isConnected = true;
      }
    } catch (err) {
      isConnected = true; // Offline / refused / timeout
    }

    // Update DB
    db.prepare(`
      UPDATE clients SET isConnected=? WHERE ip=?
    `).run(isConnected ? 1 : 0, ip);

    return Response.json({ ip, connected: isConnected });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
