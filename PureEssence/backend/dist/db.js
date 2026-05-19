import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from 'url';
import path from 'path';
// Asegurar que carga el .env sin importar desde dónde se ejecute el backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();
import { Pool } from "pg";
if (!process.env.DB_HOST) {
    console.error("❌ CRITICAL ERROR: DB_HOST is not defined in .env! Failing fast to prevent local DB connection.");
    process.exit(1);
}
// Usar DATABASE_URL si está disponible, de lo contrario usar variables individuales
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000, // 3 segundos max para establecer conexion
    query_timeout: 3000, // 3 segundos max para esperar una respuesta
});
