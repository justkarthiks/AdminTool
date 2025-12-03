const db = require("../db/database");

module.exports = {
  getAllScripts() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM scripts ORDER BY id DESC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getScript(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM scripts WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  createScript(name, category, content) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO scripts (name, category, content, createdAt, updatedAt)
         VALUES (?, ?, ?, DATETIME('now'), DATETIME('now'))`,
        [name, category, content],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, category, content });
        }
      );
    });
  },

  updateScript(id, data) {
    const { name, category, content } = data;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE scripts 
         SET name = ?, category = ?, content = ?, updatedAt = DATETIME('now')
         WHERE id = ?`,
        [name, category, content, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...data });
        }
      );
    });
  },

  deleteScript(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM scripts WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },
};
