const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const SCHEDULE_FILE = path.join(__dirname, "schedules.json");

// Ensure file exists
if (!fs.existsSync(SCHEDULE_FILE)) {
    fs.writeFileSync(SCHEDULE_FILE, "[]");
}

// Load tasks
function loadTasks() {
    try {
        return JSON.parse(fs.readFileSync(SCHEDULE_FILE, "utf8"));
    } catch (e) {
        return [];
    }
}
// Save tasks
function saveTasks(tasks) {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(tasks, null, 4));
}

// ---------------------------------------
// VALIDATION: NO PAST DATE OR TIME
// ---------------------------------------
function isPastSchedule(task) {
    const now = new Date();

    if (task.type === "once") {
        const dt = new Date(task.schedule.date + " " + task.schedule.time);
        return dt <= now;
    }

    if (task.type === "daily") {
        // daily always valid
        return false;
    }

    if (task.type === "weekly") {
        // weekly always valid
        return false;
    }

    if (task.type === "monthly") {
        // monthly always valid
        return false;
    }

    return false;
}

// ---------------------------------------
// CREATE / UPDATE TASK
// ---------------------------------------
app.post("/api/task/save", (req, res) => {
    let tasks = loadTasks();
    let newTask = req.body;

    // Check past time
    if (isPastSchedule(newTask)) {
        return res.status(400).json({
            status: "error",
            message: "Cannot set task for past date/time"
        });
    }

    // NEW TASK → assign ID
    if (!newTask.id) {
        newTask.id = Date.now();
        newTask.enabled = true;
        newTask.lastExecuted = null;
        tasks.push(newTask);
    } 
    else {
        // UPDATE TASK
        const index = tasks.findIndex(t => t.id === newTask.id);

        if (index === -1) {
            return res.status(404).json({ status: "error", message: "Task not found" });
        }

        // preserve these fields if not sent
        newTask.enabled = tasks[index].enabled ?? true;
        newTask.lastExecuted = tasks[index].lastExecuted ?? null;

        // overwrite completely with new values
        tasks[index] = newTask;
    }

    saveTasks(tasks);

    res.json({ status: "saved", taskId: newTask.id });
});

// ---------------------------------------
// GET ALL TASKS
// ---------------------------------------
app.get("/api/tasks", (req, res) => {
    res.json(loadTasks());
});

// ---------------------------------------
// DELETE TASK
// ---------------------------------------
app.delete("/api/task/:id", (req, res) => {
    const id = Number(req.params.id);
    const tasks = loadTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    res.json({ status: "deleted" });
});

// ---------------------------------------
// SCHEDULER ENGINE
// ---------------------------------------
setInterval(async () => {
    let tasks = loadTasks();
    const now = new Date();

    const curTime = now.toTimeString().slice(0, 5); // HH:MM
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const fullDate = now.toISOString().slice(0, 10);

    let changed = false;

    for (let task of tasks) {
        if (!task.enabled) continue;

        let run = false;

        switch (task.type) {
            case "once":
                if (task.schedule.date === fullDate && task.schedule.time === curTime) {
                    run = true;
                    task.enabled = false;   // disable after run
                }
                break;

            case "daily":
                if (task.schedule.time === curTime) run = true;
                break;

            case "weekly":
                if (task.schedule.dayOfWeek === dayOfWeek && task.schedule.time === curTime) run = true;
                break;

            case "monthly":
                if (task.schedule.dayOfMonth === dayOfMonth && task.schedule.time === curTime) run = true;
                break;
        }

        if (run) {
            console.log("Running task:", task.id);

            try {
                const result = await axios.post(`http://${task.clientIP}:4000/api/run`, {
                    script: task.script,
                    args: task.args
                });

                task.lastExecuted = now.toISOString();
                console.log("Executed:", result.data);

            } catch (err) {
                console.log("Execution failed:", err.message);
            }

            changed = true;
        }
    }

    if (changed) saveTasks(tasks);

}, 1000);

// ---------------------------------------
app.listen(5000, () => console.log("Scheduler running on port 5000"));
