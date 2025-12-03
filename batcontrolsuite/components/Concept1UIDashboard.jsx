"use client";

import React from "react";
import { useRouter } from "next/navigation";

/**
 * This file now ONLY renders the Sidebar.
 * All pages like dashboard, scripts, execution etc.
 * are shown by Next.js routes (/dashboard, /scripts, /execution...)
 */

export default function Concept1UIDashboard() {
  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar />
    </div>
  );
}

function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="p-6 border-b">
        <div className="font-bold text-xl">Scriptrunrr</div>
        <div className="text-xs text-slate-500 mt-1">Admin Console</div>
      </div>

      <nav className="p-4 space-y-1">
        <NavItem label="Dashboard" onClick={() => router.push("/dashboard")} />
        <NavItem label="Script Library" onClick={() => router.push("/scripts")} />
        <NavItem label="Execution" onClick={() => router.push("/execution")} />
        <NavItem label="Execution History" onClick={() => router.push("/history")} />
        <NavItem label="Client Systems" onClick={() => router.push("/clients")} />

        <div className="border-t mt-3 pt-3">
          <NavItem label="Schedules" onClick={() => router.push("/schedules")} />
          <NavItem label="Settings" onClick={() => router.push("/settings")} />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 flex items-center text-slate-700"
    >
      <span className="ml-2">{label}</span>
    </button>
  );
}
