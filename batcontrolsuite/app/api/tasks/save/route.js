// app/api/task/save/route.js
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "backend", "db");
const dbPath = path.join(dbDir, "scheduler.db");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

export async function POST(req) {
    const body = await req.json();

    if (body.id) {
        db.prepare(`
            UPDATE tasks SET 
                clientIP=?, script=?, args=?, type=?,
                scheduleJson=?, enabled=?, lastExecuted=?
            WHERE id=?
        `).run(
            body.clientIP,
            body.script,
            JSON.stringify(body.args),
            body.type,
            JSON.stringify(body.schedule),
            body.enabled ? 1 : 0,
            body.lastExecuted,
            body.id
        );
    } else {
        const result = db.prepare(`
            INSERT INTO tasks (clientIP, script, args, type, scheduleJson, enabled, lastExecuted)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            body.clientIP,
            body.script,
            JSON.stringify(body.args),
            body.type,
            JSON.stringify(body.schedule),
            body.enabled ? 1 : 0,
            null
        );

        body.id = result.lastInsertRowid;
    }

    return Response.json({ status: "saved", id: body.id });
}
