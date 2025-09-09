const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Настройки подключения к БД
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Инициализация базы данных
const init = async () => {
  try {
    // Создание таблиц
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS anime (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        rating REAL DEFAULT 0,
        year INTEGER,
        episodes INTEGER DEFAULT 1,
        genre VARCHAR(100),
        type VARCHAR(20) CHECK (type IN ('series', 'movies', 'ova', 'ona')),
        description TEXT,
        image_url TEXT,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id SERIAL PRIMARY KEY,
        anime_id INTEGER REFERENCES anime(id) ON DELETE CASCADE,
        episode_number INTEGER,
        title VARCHAR(255),
        video_url TEXT,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        department VARCHAR(100),
        bio TEXT,
        contacts TEXT
      )
    `);

    // Проверяем, есть ли уже администратор
    const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@anicosmic.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    }

    // Добавляем примеры участников команды, если их нет
    const teamCheck = await pool.query('SELECT id FROM team_members WHERE name = $1', ['xMeT1oRx']);
    if (teamCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO team_members (name, role, department, bio, contacts) VALUES 
        ('xMeT1oRx', 'Руководитель', '1 отдел', 'Основатель студии, актер озвучки', '{"telegram": "@xmet1orx", "vk": "xmet1orx", "youtube": "xmet1orx"}'),
        ('Голосова', 'Актер озвучки', '1 отдел', 'Опытный актер озвучки', '{"telegram": "@voiceactor", "vk": "voiceactor", "youtube": "voiceactor"}')
      `);
    }

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  init
};
