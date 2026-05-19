import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const setup = async () => {
  try {
    console.log('Setting up database...');
    
    // Create custom_orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        bottle_shape TEXT NOT NULL,
        fragrance TEXT NOT NULL,
        label_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database setup complete.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
};

setup();
