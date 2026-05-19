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

const sql = `
-- TABLA FRASCO
CREATE TABLE IF NOT EXISTS FRASCO (
    ID_FRASCO SERIAL PRIMARY KEY,
    NOMBRE VARCHAR(25) NOT NULL,
    FORMA VARCHAR(25) NOT NULL,
    STOCK INTEGER DEFAULT 0 CHECK (STOCK >= 0),
    DESCRIPCION VARCHAR(150) NOT NULL,
	PRECIO DECIMAL(10, 2) CHECK (PRECIO >= 0)
);

-- TABLA ETIQUETA
CREATE TABLE IF NOT EXISTS ETIQUETA (
    ID_ETIQUETA SERIAL PRIMARY KEY,
    COLOR VARCHAR(25) NOT NULL CHECK (COLOR IN ('White', 'Golden', 'Black')),
    COLOR_LETRA VARCHAR(25) NOT NULL CHECK (COLOR_LETRA IN ('White', 'Golden', 'Black', 'Green')),
    ESTILO VARCHAR(25) NOT NULL CHECK (ESTILO IN ('Rectangular', 'Oval', 'Square')),
    STOCK INTEGER DEFAULT 0 CHECK (STOCK >= 0)
);

-- TABLA USUARIO 
CREATE TABLE IF NOT EXISTS USUARIO (
    ID_USUARIO SERIAL PRIMARY KEY,
    NOMBRE VARCHAR(40) NOT NULL UNIQUE,
    EMAIL VARCHAR(100) NOT NULL UNIQUE,
    CONTRASENYA VARCHAR(255) NOT NULL,
    DNI VARCHAR(9) NOT NULL UNIQUE,
    DIRECCION VARCHAR(100),
    ROL VARCHAR(10) DEFAULT 'User' CHECK (ROL IN ('User', 'Admin'))
);

-- TABLA PERFUME_PRECREADO
CREATE TABLE IF NOT EXISTS PERFUME_PRECREADO (
    ID_PERFUME_PRECREADO SERIAL PRIMARY KEY,
    NOMBRE VARCHAR(50) NOT NULL,
    PRECIO DECIMAL(10, 2) NOT NULL CHECK (PRECIO > 0), 
    STOCK INTEGER NOT NULL CHECK (STOCK >= 0),
    DESCRIPCION VARCHAR(150)
);

-- TABLA PEDIDO
CREATE TABLE IF NOT EXISTS PEDIDO (
    ID_PEDIDO SERIAL PRIMARY KEY,
    DESCRIPCION VARCHAR(150),
    CANTIDAD_TOTAL_PERFUMES INTEGER DEFAULT 0 CHECK (CANTIDAD_TOTAL_PERFUMES >= 0),
    FECHA DATE NOT NULL DEFAULT CURRENT_DATE,
    PRECIO_TOTAL DECIMAL(10,2) CHECK (PRECIO_TOTAL > 0),
    ESTADO VARCHAR(20) DEFAULT 'Pendiente',
    ID_USUARIO INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO)
);
`;

async function setup() {
  try {
    console.log("Applying RETO schema...");
    await pool.query(sql);
    console.log("Schema applied successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error applying schema:", err);
    process.exit(1);
  }
}

setup();
