/**
 * server.js
 * Clean backend starter for BatControlSuite
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const scriptRoutes = require("./routes/scripts");
const serverRoutes = require("./routes/servers");
const executeRoutes = require("./routes/execute");

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/scripts", scriptRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/execute", executeRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({
    app: "BatControlSuite Backend",
    status: "running",
    time: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend is running at http://localhost:${PORT}`);
});
