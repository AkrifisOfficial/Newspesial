const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/anime', require('./api/anime'));
app.use('/api/episodes', require('./api/episodes'));
app.use('/api/team', require('./api/team'));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database
db.init().then(() => {
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});
