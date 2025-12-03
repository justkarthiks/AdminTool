"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children, title }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <Header title={title} />
        {children}
      </main>
    </div>
  );
}
