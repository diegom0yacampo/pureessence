import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function fix() {
  try {
    await pool.query(`
      SELECT setval('usuario_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM usuario), 1));
    `);
    console.log("Sequence 'usuario_id_usuario_seq' synchronized with max id.");
  } catch (err) {
    console.error("Error fixing sequence:", err);
  } finally {
    process.exit(0);
  }
}

fix();
