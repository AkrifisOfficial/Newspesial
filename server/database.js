const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'anicosmic.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const init = () => {
  return new Promise((resolve, reject) => {
    // Create tables
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Anime table
      db.run(`CREATE TABLE IF NOT EXISTS anime (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        rating REAL DEFAULT 0,
        year INTEGER,
        episodes INTEGER DEFAULT 1,
        genre TEXT,
        type TEXT CHECK(type IN ('series', 'movies', 'ova', 'ona')),
        description TEXT,
        image_url TEXT,
        added_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Episodes table
      db.run(`CREATE TABLE IF NOT EXISTS episodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id INTEGER,
        episode_number INTEGER,
        title TEXT,
        video_url TEXT,
        added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (anime_id) REFERENCES anime (id) ON DELETE CASCADE
      )`);

      // Team members table
      db.run(`CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        department TEXT,
        bio TEXT,
        contacts TEXT
      )`);

      // Insert default admin user
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['admin', 'admin@anicosmic.com', defaultPassword, 'admin'], function(err) {
        if (err) {
          console.error('Error creating default admin:', err);
          reject(err);
        } else {
          console.log('Default admin user created');
          resolve();
        }
      });

      // Insert sample team members
      db.run(`INSERT OR IGNORE INTO team_members (name, role, department, bio, contacts) VALUES 
        ('xMeT1oRx', 'Руководитель', '1 отдел', 'Основатель студии, актер озвучки', '{"telegram": "@xmet1orx", "vk": "xmet1orx", "youtube": "xmet1orx"}'),
        ('Голосова', 'Актер озвучки', '1 отдел', 'Опытный актер озвучки', '{"telegram": "@voiceactor", "vk": "voiceactor", "youtube": "voiceactor"}')`);
    });
  });
};

module.exports = {
  db,
  init
};
