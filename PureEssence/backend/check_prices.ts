mport { pool } from './src/db.ts';

async function checkPrices() {
  try {
    console.log("--- FRASCO ---");
    const frascos = await pool.query("SELECT * FROM frasco");
    console.table(frascos.rows);

    console.log("\n--- INGREDIENTE ---");
    const ingredientes = await pool.query("SELECT * FROM ingrediente");
    console.table(ingredientes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkPrices();
