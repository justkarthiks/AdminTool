"use client";

export default function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-center ${
        active ? "bg-slate-100 font-semibold" : "text-slate-700"
      }`}
    >
      <span className="ml-2">{label}</span>
    </button>
  );
}
