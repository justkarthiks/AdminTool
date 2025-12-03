const express = require("express");
const router = express.Router();

const serverService = require("../services/serverService");

// GET all servers
router.get("/", async (req, res) => {
  try {
    const servers = await serverService.getAllServers();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

// REGISTER new server (from agent)
router.post("/register", async (req, res) => {
  try {
    const { hostname, ip, os } = req.body;
    const srv = await serverService.registerServer(hostname, ip, os);
    res.json(srv);
  } catch (err) {
    res.status(500).json({ error: "Failed to register server" });
  }
});

// Update server status (heartbeat)
router.post("/heartbeat", async (req, res) => {
  try {
    const { id, status } = req.body;
    const result = await serverService.updateStatus(id, status);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update server status" });
  }
});

module.exports = router;
