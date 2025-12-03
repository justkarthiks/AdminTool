"use client";

import React, { useEffect, useState, useCallback } from "react";

export default function SchedulerApp() {
  const emptyTask = {
    id: null,
    clientIP: "",
    script: "",
    args: "",
    type: "once",
    schedule: {
      date: "",
      time: "",
      dayOfWeek: 0,
      dayOfMonth: 1,
    },
    enabled: true,
    lastExecuted: null,
  };

  const [task, setTask] = useState({ ...emptyTask });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewTask, setViewTask] = useState(null);

  // ========================================================
  // LOAD TASKS
  // ========================================================
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data || []);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ========================================================
  // FORM HANDLERS
  // ========================================================
  function onChange(field, value) {
    setTask((prev) => ({ ...prev, [field]: value }));
  }

  function onScheduleChange(field, value) {
    setTask((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value },
    }));
  }

  // ========================================================
  // VALIDATION
  // ========================================================
  function validate() {
    if (!task.clientIP.trim()) return "Client IP required";
    if (!task.script.trim()) return "Script name required";

    if (task.type === "once") {
      if (!task.schedule.date) return "Date required";
      if (!task.schedule.time) return "Time required";
    }

    if (["daily", "weekly", "monthly"].includes(task.type)) {
      if (!task.schedule.time) return "Time required";
    }

    return null;
  }

  // ========================================================
  // SAVE TASK
  // ========================================================
  async function save() {
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      await fetch("/api/tasks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      await loadTasks();
      setTask({ ...emptyTask });
      setError("");
    } catch (err) {
      setError("Save failed");
    }
    setSaving(false);
  }

  // ========================================================
  // DELETE TASK
  // ========================================================
  async function deleteNow() {
    try {
      await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      setDeleteId(null);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  }

  // ========================================================
  // EDIT TASK
  // ========================================================
  function edit(t) {
    setTask({
      ...t,
      args: Array.isArray(t.args) ? t.args.join(",") : t.args,
    });
  }

  // ========================================================
  // UI
  // ========================================================
  return (
    <div className="h-screen grid grid-cols-[380px_1fr] bg-gray-100 overflow-hidden">

      {/* ===================================================== */}
      {/* LEFT PANEL (Fixed) */}
      {/* ===================================================== */}
      <div className="bg-white border-r p-6 overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create Schedule</h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="grid grid-cols-1 gap-3">

          <input
            className="border p-2 rounded"
            placeholder="Client IP"
            value={task.clientIP}
            onChange={(e) => onChange("clientIP", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Script name"
            value={task.script}
            onChange={(e) => onChange("script", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Arguments (optional)"
            value={task.args}
            onChange={(e) => onChange("args", e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={task.type}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* CONDITIONAL DISPLAY */}
        {task.type === "once" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="date"
              className="border p-2 rounded"
              value={task.schedule.date}
              onChange={(e) => onScheduleChange("date", e.target.value)}
            />
            <input
              type="time"
              className="border p-2 rounded"
              value={task.schedule.time}
              onChange={(e) => onScheduleChange("time", e.target.value)}
            />
          </div>
        )}

        {task.type === "daily" && (
          <input
            type="time"
            className="border p-2 rounded mt-3"
            value={task.schedule.time}
            onChange={(e) => onScheduleChange("time", e.target.value)}
          />
        )}

        {task.type === "weekly" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <select
              className="border p-2 rounded"
              value={task.schedule.dayOfWeek}
              onChange={(e) => onScheduleChange("dayOfWeek", Number(e.target.value))}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>

            <input
              type="time"
              className="border p-2 rounded"
              value={task.schedule.time}
              onChange={(e) => onScheduleChange("time", e.target.value)}
            />
          </div>
        )}

        {task.type === "monthly" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="number"
              min="1"
              max="31"
              className="border p-2 rounded"
              value={task.schedule.dayOfMonth}
              onChange={(e) =>
                onScheduleChange("dayOfMonth", Number(e.target.value))
              }
            />

            <input
              type="time"
              className="border p-2 rounded"
              value={task.schedule.time}
              onChange={(e) => onScheduleChange("time", e.target.value)}
            />
          </div>
        )}

        <button
          className="mt-5 w-full py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={save}
        >
          {saving ? "Saving..." : "Save Task"}
        </button>
      </div>

      {/* ===================================================== */}
      {/* RIGHT PANEL (Scrollable) */}
      {/* ===================================================== */}
      <div className="overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Scheduled Tasks</h2>

        {tasks.length === 0 && (
          <div className="text-gray-500">No scheduled tasks</div>
        )}

        {tasks.map((t) => (
          <div
            key={t.id}
            className="bg-white border rounded shadow p-4 mb-3 flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <div className="font-semibold text-lg">Task #{t.id}</div>
              <div className="text-gray-600">{t.clientIP}</div>
              <div className="text-sm">{t.script}</div>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setViewTask(t)}
              >
                View
              </button>

              <button
                className="px-3 py-1 border rounded"
                onClick={() => edit(t)}
              >
                Edit
              </button>

              <button
                className="px-3 py-1 border rounded text-red-600"
                onClick={() => setDeleteId(t.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================================================== */}
      {/* DELETE MODAL with Animation */}
      {/* ===================================================== */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-5 rounded shadow w-80 transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-lg font-bold mb-3">Delete Task</h2>
            <p>Are you sure you want to delete Task #{deleteId}?</p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-1 border rounded"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-1 bg-red-600 text-white rounded"
                onClick={deleteNow}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ===================================================== */}
      {/* VIEW DETAILS MODAL with Animation */}
      {/* ===================================================== */}
      {viewTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-6 rounded shadow w-96 transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-xl font-bold mb-3">Task Details</h2>

            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-80">
              {JSON.stringify(viewTask, null, 2)}
            </pre>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-1 border rounded"
                onClick={() => setViewTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
