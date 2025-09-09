const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Получить всех участников команды
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
