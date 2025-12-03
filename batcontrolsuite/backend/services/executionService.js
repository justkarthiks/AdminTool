const db = require("../db/database");

module.exports = {
  startExecution(serverIds, scriptIds) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO executions (serverIds, scriptIds, createdAt)
         VALUES (?, ?, DATETIME('now'))`,
        [serverIds.join(","), scriptIds.join(",")],
        function (err) {
          if (err) reject(err);
          else resolve({ execId: this.lastID });
        }
      );
    });
  },

  getExecutionMatrix(execId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM execution_results WHERE execId = ?`,
        [execId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  storeResult({ execId, serverId, scriptId, status, exitCode, log }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO execution_results 
         (execId, serverId, scriptId, status, exitCode, log, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'))`,
        [execId, serverId, scriptId, status, exitCode, log],
        function (err) {
          if (err) reject(err);
          else resolve({ execId, serverId, scriptId, status, exitCode, log });
        }
      );
    });
  },
};
