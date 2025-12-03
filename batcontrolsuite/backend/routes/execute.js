const express = require("express");
const router = express.Router();

const executionService = require("../services/executionService");

// START execution matrix
router.post("/", async (req, res) => {
  try {
    const { serverIds, scriptIds } = req.body;

    const execRecord = await executionService.startExecution(serverIds, scriptIds);

    res.json(execRecord);
  } catch (err) {
    res.status(500).json({ error: "Failed to start execution" });
  }
});

// GET full execution matrix
router.get("/:execId", async (req, res) => {
  try {
    const matrix = await executionService.getExecutionMatrix(req.params.execId);
    res.json(matrix);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch execution matrix" });
  }
});

// Receive execution result from agent
router.post("/result", async (req, res) => {
  try {
    const result = await executionService.storeResult(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to store execution result" });
  }
});

module.exports = router;
