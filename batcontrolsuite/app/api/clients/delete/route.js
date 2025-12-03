import db from "../../../../backend/db/initClients";

export async function POST(req) {
  const { id } = await req.json();

  db.prepare(`DELETE FROM clients WHERE id=?`).run(id);

  return Response.json({ status: "deleted" });
}
