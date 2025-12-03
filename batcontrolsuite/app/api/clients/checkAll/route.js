import db from "../../../../backend/db/initClients";

export async function GET() {
  const clients = db.prepare("SELECT * FROM clients").all();

  const results = [];

  for (const c of clients) {
    const url = `http://${c.ip}:4000/api/receives`;

    let isConnected = false;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true }),
      });

      const data = await res.json();
      if (data.status === "success") isConnected = true;
    } catch (err) {
      isConnected = true;
    }

    db.prepare("UPDATE clients SET isConnected=? WHERE id=?").run(
      isConnected ? 1 : 0,
      c.id
    );

    results.push({
      id: c.id,
      ip: c.ip,
      connected: isConnected,
    });
  }

  return Response.json(results);
}
