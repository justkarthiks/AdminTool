"use client";

import React, { useMemo, useState, useEffect } from "react";

/**
 * ExecutionPage.jsx — now uses REAL DB servers
 */

/* DUMMY SCRIPTS — still static unless you want DB scripts also */
const DUMMY_SCRIPTS = [
  { id: "sc-01", name: "cleanup_temp.bat", category: "Maintenance" },
  { id: "sc-02", name: "deploy_patch.bat", category: "Deployment" },
  { id: "sc-03", name: "backup_user.bat", category: "Backup" },
  { id: "sc-04", name: "scan_updates.bat", category: "Maintenance" },
];

const STATUS_ORDER = ["PENDING", "RUNNING", "SUCCESS", "FAILED", "TIMEOUT"];
const STATUS_STYLE = {
  PENDING: "bg-slate-100 text-slate-700",
  RUNNING: "bg-blue-100 text-blue-700",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  TIMEOUT: "bg-amber-100 text-amber-700",
};

/* Status badge */
function ExecStatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

export default function ExecutionPage() {
  const [tab, setTab] = useState("select");

  /** ===============================
   * LOAD SERVERS FROM DATABASE
   * =============================== */
  const [servers, setServers] = useState([]);
  /** Scripts */
  const [scripts, setScripts] = useState(DUMMY_SCRIPTS);

  /** Selection state */
  const [selectedServerIds, setSelectedServerIds] = useState([]);
  const [selectedScriptIds, setSelectedScriptIds] = useState([DUMMY_SCRIPTS[0].id]);

  /** Results */
  const [matrix, setMatrix] = useState(null);
  const [logModal, setLogModal] = useState({ open: false, serverId: null, scriptId: null });

  /** Filters */
  const [serverSearch, setServerSearch] = useState("");
  const [scriptSearch, setScriptSearch] = useState("");
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);
  const [serverSort, setServerSort] = useState("name");
  const [scriptSort, setScriptSort] = useState("name");
  
  useEffect(() => {
    async function loadServers() {
      const res = await fetch("/api/servers");
      const data = await res.json();
      setServers(data);

      // Auto-select all online servers
      setSelectedServerIds(data.map((s) => s.id));
    }

    loadServers();

    // Auto-refresh every 3 seconds
    const timer = setInterval(loadServers, 3000);
    return () => clearInterval(timer);
  }, []);

  

  /** ONLINE SERVERS ONLY (already filtered by API) + search filter */
  const availableServers = useMemo(() => {
    let list = servers; // all from API are online

    if (serverSearch) {
      list = list.filter((s) =>
        s.name.toLowerCase().includes(serverSearch.toLowerCase())
      );
    }
    return list;
  }, [servers, serverSearch]);

  /** Scripts filter */
  const availableScripts = useMemo(() => {
    let list = scripts;
    if (scriptSearch) {
      list = list.filter((s) =>
        s.name.toLowerCase().includes(scriptSearch.toLowerCase())
      );
    }
    return list;
  }, [scripts, scriptSearch]);

  /** Selection toggles */
  function toggleServer(id) {
    setSelectedServerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function toggleScript(id) {
    setSelectedScriptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAllServers() {
    setSelectedServerIds(availableServers.map((s) => s.id));
  }
  function clearAllServers() {
    setSelectedServerIds([]);
  }
  function selectAllScripts() {
    setSelectedScriptIds(availableScripts.map((s) => s.id));
  }
  function clearAllScripts() {
    setSelectedScriptIds([]);
  }

  /** Static matrix generator */
  function generateStaticMatrix(selectedSrvIds, selectedScrIds) {
    const result = {};
    selectedSrvIds.forEach((srvId, si) => {
      result[srvId] = {};
      selectedScrIds.forEach((scrId, sj) => {
        const idx = (si + sj) % STATUS_ORDER.length;
        const status = STATUS_ORDER[idx];
        result[srvId][scrId] = {
          status,
          startTime: new Date().toISOString(),
          endTime:
            status === "RUNNING" || status === "PENDING"
              ? null
              : new Date(Date.now() - (si + sj) * 1000).toISOString(),
          exitCode: status === "SUCCESS" ? 0 : status === "FAILED" ? 1 : null,
          log: `Dummy log for ${srvId}/${scrId}\nStatus: ${status}\n-- sample output --\nLine1\nLine2\nLine3`,
        };
      });
    });
    return result;
  }

  /** Execute */
  function handleExecuteNow() {
    if (selectedServerIds.length === 0 || selectedScriptIds.length === 0) {
      alert("Select at least one server and one script.");
      return;
    }
    const result = generateStaticMatrix(selectedServerIds, selectedScriptIds);
    setMatrix(result);
    setTab("results");
  }

  /** Results tab sorting */
  const resultServers = useMemo(() => {
    let list = servers.filter((s) => selectedServerIds.includes(s.id));
    if (serverSort === "name") list = list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [servers, selectedServerIds, serverSort]);

  const resultScripts = useMemo(() => {
    let list = scripts.filter((s) => selectedScriptIds.includes(s.id));
    if (scriptSort === "name") list = list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [scripts, selectedScriptIds, scriptSort]);

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setTab("select")}
          className={`px-3 py-2 rounded-md ${
            tab === "select" ? "bg-emerald-600 text-white" : "bg-white border"
          }`}
        >
          Select & Run
        </button>
        <button
          onClick={() => setTab("results")}
          className={`px-3 py-2 rounded-md ${
            tab === "results" ? "bg-emerald-600 text-white" : "bg-white border"
          }`}
        >
          Results
        </button>
      </div>

      {/* SELECT TAB */}
      {tab === "select" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Servers */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Servers (Online Only)</h3>

            <input
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
              placeholder="Search servers..."
              className="w-full px-3 py-2 border rounded mb-3"
            />

            <div className="flex gap-2 mb-3">
              <button onClick={selectAllServers} className="px-2 py-1 border rounded text-sm">Select All</button>
              <button onClick={clearAllServers} className="px-2 py-1 border rounded text-sm">Clear</button>
            </div>

            <div className="max-h-72 overflow-auto">
              {availableServers.map((s) => (
                <label key={s.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServerIds.includes(s.id)}
                    onChange={() => toggleServer(s.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.ip} • online</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Scripts */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Scripts</h3>

            <input
              value={scriptSearch}
              onChange={(e) => setScriptSearch(e.target.value)}
              placeholder="Search scripts..."
              className="w-full px-3 py-2 border rounded mb-3"
            />

            <div className="flex gap-2 mb-3">
              <button onClick={selectAllScripts} className="px-2 py-1 border rounded text-sm">Select All</button>
              <button onClick={clearAllScripts} className="px-2 py-1 border rounded text-sm">Clear</button>
            </div>

            <div className="max-h-72 overflow-auto">
              {availableScripts.map((sc) => (
                <label key={sc.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedScriptIds.includes(sc.id)}
                    onChange={() => toggleScript(sc.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{sc.name}</div>
                    <div className="text-xs text-slate-500">{sc.category}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Execute */}
          <div className="col-span-2 flex justify-end mt-4">
            <button
              onClick={handleExecuteNow}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow"
            >
              Execute Now
            </button>
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {tab === "results" && matrix && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          {/* Table */}
          <div className="overflow-auto border rounded">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="p-3 border-r text-left">Server</th>
                  {resultScripts.map((sc) => (
                    <th key={sc.id} className="p-3 border-r text-left">{sc.name}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {resultServers.map((srv) => {
                  const row = matrix[srv.id] || {};
                  return (
                    <tr key={srv.id}>
                      <td className="p-3 border-r">
                        <div className="font-medium">{srv.name}</div>
                        <div className="text-xs text-slate-500">{srv.ip}</div>
                      </td>

                      {resultScripts.map((sc) => {
                        const cell = row[sc.id];
                        if (!cell) return <td key={sc.id} className="p-3 border-r">-</td>;

                        return (
                          <td key={sc.id} className="p-3 border-r">
                            <ExecStatusBadge status={cell.status} />
                            <div className="text-xs text-slate-500">{cell.endTime && new Date(cell.endTime).toLocaleTimeString()}</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- Log Modal -------- */
function LogModal({ data, server, script, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded shadow-lg max-w-3xl w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <div className="font-semibold">Logs — {server?.name} / {script?.name}</div>
            <div className="text-xs text-slate-500">Status: {data.status}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
        </div>

        <div className="p-4">
          <pre className="bg-slate-100 p-3 rounded text-sm whitespace-pre-wrap max-h-96 overflow-auto">
            {data.log}
          </pre>
        </div>
      </div>
    </div>
  );
}
