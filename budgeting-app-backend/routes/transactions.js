const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the database connection

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  const { description, amount, date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions (description, amount, date) VALUES ($1, $2, $3) RETURNING *",
      [description, amount, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
