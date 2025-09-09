const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Получить эпизоды для аниме
router.get('/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM episodes WHERE anime_id = $1 ORDER BY episode_number',
      [animeId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Добавить новый эпизод
router.post('/', async (req, res) => {
  try {
    const { anime_id, episode_number, title, video_url } = req.body;
    
    const result = await pool.query(
      'INSERT INTO episodes (anime_id, episode_number, title, video_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [anime_id, episode_number, title, video_url]
    );
    
    res.json({ 
      message: 'Episode added successfully', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error adding episode:', error);
    res.status(500).json({ error: 'Failed to add episode' });
  }
});

// Удалить эпизод
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM episodes WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

module.exports = router;
