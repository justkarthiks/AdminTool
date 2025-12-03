// backend/websocket/agentHandler.js
// WebSocket agent manager for BatControlSuite
// Requirements: npm i ws

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

// Optional: bring in your executionService/serverService if you want to persist updates
// const ExecutionService = require("../services/executionService");
// const ServerService = require("../services/serverService");

const HEARTBEAT_INTERVAL = 30_000; // 30s
const AGENT_PING_TIMEOUT = 60_000; // 60s

// connectedAgents: { agentId: { ws, lastSeen, info: {name, ip, os, version}, serverId } }
const connectedAgents = new Map();

function setupWebsocketServer(httpServer, opts = {}) {
  // opts.path default "/ws"
  const path = opts.path || "/ws";
  const wss = new WebSocket.Server({ server: httpServer, path });

  wss.on("connection", (ws, req) => {
    ws.isAlive = true;

    // Metadata set after auth/hello
    ws.agentId = null;

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        handleMessage(ws, msg, req);
      } catch (err) {
        console.error("WS: invalid JSON message", err);
        ws.send(JSON.stringify({ type: "error", error: "invalid_json" }));
      }
    });

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      if (ws.agentId) {
        connectedAgents.delete(ws.agentId);
        console.log(`Agent disconnected: ${ws.agentId}`);
      }
    });
  });

  // Periodic heartbeat to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, HEARTBEAT_INTERVAL);

  wss.on("close", () => clearInterval(interval));

  return {
    wss,
    broadcast: (obj) => {
      const str = JSON.stringify(obj);
      wss.clients.forEach((c) => c.readyState === WebSocket.OPEN && c.send(str));
    },
    getConnectedAgents: () => Array.from(connectedAgents.values()).map((v) => ({
      agentId: v.agentId,
      info: v.info,
      lastSeen: v.lastSeen,
    })),
    getAgentById: (id) => connectedAgents.get(id),
    sendCommandToAgent,
  };
}

/* Message handling:
  Messages from agent -> server:
  - { type: "hello", agentId?, name, ip, os, version, token? }     // initial
  - { type: "heartbeat", timestamp }
  - { type: "log", executionId, chunk, final?:false }
  - { type: "result", executionId, status: "SUCCESS|FAILED|TIMEOUT", exitCode, endTime }
  - { type: "exec_ack", executionId }   // accepted for execution
  - { type: "error", executionId?, error }
*/
async function handleMessage(ws, msg, req) {
  switch (msg.type) {
    case "hello": {
      // Basic auth-check placeholder:
      // if (msg.token !== process.env.AGENT_AUTH_TOKEN) { ws.send(...); ws.close(); return; }
      const agentId = msg.agentId || uuidv4();
      ws.agentId = agentId;

      const meta = {
        agentId,
        name: msg.name || `agent-${agentId.substring(0,6)}`,
        ip: msg.ip || req.socket.remoteAddress,
        os: msg.os || "unknown",
        version: msg.version || "0.0.0",
      };

      ws.info = meta;
      ws.lastSeen = Date.now();

      connectedAgents.set(agentId, { ws, agentId, info: meta, lastSeen: ws.lastSeen });

      ws.send(JSON.stringify({ type: "hello_ack", agentId, serverTime: new Date().toISOString() }));

      console.log("Agent connected:", meta);
      // Optionally update server record in DB:
      // await ServerService.registerOrUpdate({ agentId, name: meta.name, ip: meta.ip, os: meta.os });

      break;
    }

    case "heartbeat": {
      if (!ws.agentId) return ws.send(JSON.stringify({ type: "error", error: "not_registered" }));
      ws.lastSeen = Date.now();
      const rec = connectedAgents.get(ws.agentId);
      if (rec) rec.lastSeen = ws.lastSeen;
      // Optionally reply
      ws.send(JSON.stringify({ type: "heartbeat_ack", ts: Date.now() }));
      break;
    }

    case "exec_ack": {
      // agent acknowledged job pickup
      console.log(`exec_ack ${msg.executionId} by ${ws.agentId}`);
      // Optionally notify ExecutionService
      // await ExecutionService.markPicked(msg.executionId, ws.agentId)
      break;
    }

    case "log": {
      // streaming log chunk
      // msg: { type: "log", executionId, chunk, seq }
      console.log(`[log][${msg.executionId}] ${msg.chunk?.slice(0,200)}`);
      // persist or pipe to ExecutionService
      // await ExecutionService.appendLog(msg.executionId, msg.chunk)
      break;
    }

    case "result": {
      // final result of execution
      // msg: { type: "result", executionId, status, exitCode, endTime }
      console.log(`[result][${msg.executionId}] ${msg.status} (exit ${msg.exitCode}) from ${ws.agentId}`);
      // persist into DB:
      // await ExecutionService.finishExecution(msg.executionId, { status: msg.status, exitCode: msg.exitCode, endTime: msg.endTime, agentId: ws.agentId })
      break;
    }

    default:
      console.warn("Unknown WS message type:", msg.type);
      ws.send(JSON.stringify({ type: "error", error: "unknown_type" }));
      break;
  }
}

/**
 * Send a command to a specific agent (by agentId).
 * `command` object example:
 * { type: "execute", executionId, scriptContent, interpreter: "cmd" | "bash", timeoutMs }
 */
function sendCommandToAgent(agentId, command) {
  const rec = connectedAgents.get(agentId);
  if (!rec || !rec.ws || rec.ws.readyState !== WebSocket.OPEN) {
    return false;
  }
  rec.ws.send(JSON.stringify(command));
  return true;
}

/* Utility: find best agents by filter (online etc.) */
function findAgents(filter = () => true) {
  const out = [];
  for (const [id, rec] of connectedAgents.entries()) {
    if (filter(rec)) out.push(rec);
  }
  return out;
}

module.exports = {
  setupWebsocketServer,
  sendCommandToAgent,
  connectedAgents,
  findAgents,
};
