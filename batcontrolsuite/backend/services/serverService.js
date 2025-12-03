const db = require("../db/database");

module.exports = {
  getAllServers() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM servers ORDER BY name ASC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  registerServer(hostname, ip, os) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO servers (hostname, ip, os, status, lastHeartbeat)
         VALUES (?, ?, ?, 'offline', DATETIME('now'))`,
        [hostname, ip, os],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, hostname, ip, os });
        }
      );
    });
  },

  updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE servers 
         SET status = ?, lastHeartbeat = DATETIME('now')
         WHERE id = ?`,
        [status, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, status });
        }
      );
    });
  },
};
