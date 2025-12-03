"use client";

export default function StatusBadge({ status }) {
  const map = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-slate-100 text-slate-700",
    running: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        map[status] || map.pending
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
