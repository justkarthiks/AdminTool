"use client";

export default function ScriptLibrary({ scripts = [], onEdit, onRun }) {
  return (
    <div className="bg-white p-5 rounded border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Script Library</h2>

        <div className="flex gap-2">
          <input
            placeholder="Search scripts..."
            className="border rounded px-2 py-1"
          />
          <button className="bg-emerald-600 text-white px-3 py-1 rounded">
            + New Script
          </button>
        </div>
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr className="text-sm text-slate-500 border-b">
            <th className="text-left py-2">Script Name</th>
            <th className="text-left py-2">Category</th>
            <th className="text-left py-2">Last Run</th>
            <th className="text-left py-2">Status</th>
            <th className="text-right py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {scripts.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="py-2">{s.name}</td>
              <td>{s.category}</td>
              <td>{s.lastRun}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    s.status === "success"
                      ? "bg-green-100 text-green-700"
                      : s.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {s.status}
                </span>
              </td>

              <td className="text-right">
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => onRun?.(s)}
                    className="px-2 py-1 border rounded"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => onEdit?.(s)}
                    className="px-2 py-1 border rounded"
                  >
                    Edit
                  </button>
                  <button className="px-2 py-1 border rounded">View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
