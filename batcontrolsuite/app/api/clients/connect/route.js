import db from "../../../../backend/db/initClients";

export async function POST(req) {
  const { id, connect } = await req.json();

  db.prepare(`
    UPDATE clients SET isConnected=? WHERE id=?
  `).run(connect ? 1 : 0, id);

  return Response.json({ status: "ok" });
}
