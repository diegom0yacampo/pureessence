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

const intranetEmails = [
  "diegomoyacampo305@gmail.com",
  "sergio@pureessence.com",
  "diegom@pureessence.com",
  "diegoj@pureessence.com",
  "admin@pureessence.com",
  "hr@pureessence.com",
  "empleado1@pureessence.com",
  "empleado2@pureessence.com",
  "empleado3@pureessence.com",
  "empleado4@pureessence.com",
  "bonilla@gmail.com"
];

async function updateDB() {
  try {
    // Check if column exists
    const colCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='usuario' AND column_name='es_empleado'
    `);

    if (colCheck.rows.length === 0) {
      await pool.query("ALTER TABLE USUARIO ADD COLUMN es_empleado BOOLEAN DEFAULT FALSE");
      console.log("Added es_empleado column.");
    }

    // Set es_empleado = TRUE for the authorized users
    for (const email of intranetEmails) {
      await pool.query("UPDATE USUARIO SET es_empleado = TRUE WHERE email = $1", [email]);
    }
    console.log("Updated intranet users in AWS database.");
  } catch (err) {
    console.error("Error updating DB:", err);
  } finally {
    process.exit(0);
  }
}

updateDB();
