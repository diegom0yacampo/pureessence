import { pool } from '../db.js';
export class ProductoDAO {
    // --- FRASCOS ---
    static async getFrascos() {
        const { rows } = await pool.query('SELECT * FROM FRASCO');
        return rows;
    }
    // --- ETIQUETAS ---
    static async getEtiquetas() {
        const { rows } = await pool.query('SELECT * FROM ETIQUETA');
        return rows;
    }
    // --- INGREDIENTES ---
    static async getIngredientes() {
        const { rows } = await pool.query('SELECT * FROM INGREDIENTE');
        return rows;
    }
    static async updateStockIngrediente(id, cantidad) {
        await pool.query('UPDATE INGREDIENTE SET stock = stock - $1 WHERE ID_INGREDIENTE = $2', [cantidad, id]);
    }
}
