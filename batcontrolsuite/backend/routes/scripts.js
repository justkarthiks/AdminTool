const express = require("express");
const router = express.Router();

const scriptService = require("../services/scriptService");

// GET all scripts
router.get("/", async (req, res) => {
  try {
    const scripts = await scriptService.getAllScripts();
    res.json(scripts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

// GET single script
router.get("/:id", async (req, res) => {
  try {
    const script = await scriptService.getScript(req.params.id);
    res.json(script);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch script" });
  }
});

// CREATE new script
router.post("/", async (req, res) => {
  try {
    const { name, category, content } = req.body;
    const newScript = await scriptService.createScript(name, category, content);
    res.json(newScript);
  } catch (err) {
    res.status(500).json({ error: "Failed to create script" });
  }
});

// UPDATE script
router.put("/:id", async (req, res) => {
  try {
    const updated = await scriptService.updateScript(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update script" });
  }
});

// DELETE script
router.delete("/:id", async (req, res) => {
  try {
    await scriptService.deleteScript(req.params.id);
    res.json({ message: "Script deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete script" });
  }
});

module.exports = router;
