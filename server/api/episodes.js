const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get episodes for anime
router.get('/:animeId', (req, res) => {
  const { animeId } = req.params;
  
  db.all('SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number', [animeId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Add new episode
router.post('/', (req, res) => {
  const { anime_id, episode_number, title, video_url } = req.body;
  
  db.run(
    'INSERT INTO episodes (anime_id, episode_number, title, video_url) VALUES (?, ?, ?, ?)',
    [anime_id, episode_number, title, video_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add episode' });
      }
      
      res.json({ 
        message: 'Episode added successfully', 
        id: this.lastID 
      });
    }
  );
});

// Delete episode
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM episodes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete episode' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json({ message: 'Episode deleted successfully' });
  });
});

module.exports = router;
