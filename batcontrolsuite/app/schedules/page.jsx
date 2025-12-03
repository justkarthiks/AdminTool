"use client";

import AppLayout from "../../components/AppLayout";
import SchedulerApp from "../../components/Scheduler";

export default function SchedulesPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Schedules</h1>
      

      <div className="p-4 bg-white border rounded shadow-sm">
        <SchedulerApp />
      </div>
    </AppLayout>
  );
}
