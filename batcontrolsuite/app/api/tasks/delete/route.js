import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Correct DB path
const dbDir = path.join(process.cwd(), "backend", "db");
const dbPath = path.join(dbDir, "scheduler.db");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// ---------------- DELETE /api/task/delete ----------------
export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return Response.json(
                { error: "Missing id" },
                { status: 400 }
            );
        }

        db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);

        return Response.json({ status: "deleted", id });
    } catch (err) {
        return Response.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
