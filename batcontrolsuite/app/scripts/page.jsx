"use client";

import AppLayout from "../../components/AppLayout";
import ScriptLibrary from "../../components/ScriptLibrary";

// dummy sample data (later replace with API)
const sampleScripts = [
  { id: 1, name: "cleanup_temp.bat", category: "Maintenance", lastRun: "02:14 PM", status: "success" },
  { id: 2, name: "deploy_patch.bat", category: "Deployment", lastRun: "01:28 PM", status: "failed" },
  { id: 3, name: "backup_user.bat", category: "Backup", lastRun: "12:10 PM", status: "success" },
];

export default function ScriptsPage() {
  return (
    <AppLayout>
      <ScriptLibrary
        scripts={sampleScripts}
        onEdit={(s) => alert("Edit stub: " + s.name)}
        onRun={(s) => alert("Run stub: " + s.name)}
      />
    </AppLayout>
  );
}
