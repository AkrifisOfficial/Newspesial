const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Получить все аниме
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM anime';
    let params = [];
    
    if (type && type !== 'recent') {
      query += ' WHERE type = $1';
      params.push(type);
    } else if (type === 'recent') {
      query += ' ORDER BY added_date DESC LIMIT 10';
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching anime:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Добавить новое аниме
router.post('/', async (req, res) => {
  try {
    const { title, rating, year, episodes, genre, type, description, image_url } = req.body;
    
    const result = await pool.query(
      `INSERT INTO anime (title, rating, year, episodes, genre, type, description, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [title, rating, year, episodes, genre, type, description, image_url]
    );
    
    res.json({ 
      message: 'Anime added successfully', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error adding anime:', error);
    res.status(500).json({ error: 'Failed to add anime' });
  }
});

// Удалить аниме
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM anime WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    console.error('Error deleting anime:', error);
    res.status(500).json({ error: 'Failed to delete anime' });
  }
});

module.exports = router;
