"use client";

export default function Header({ title = "" }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">Admin</div>
          <div className="w-9 h-9 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
