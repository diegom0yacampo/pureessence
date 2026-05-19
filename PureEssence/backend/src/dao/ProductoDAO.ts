import { pool } from '../db.js';

export interface Frasco {
  id_frasco: number;
  nombre: string;
  forma: string;
  stock: number;
  descripcion: string;
  precio: number;
}

export interface Etiqueta {
  id_etiqueta: number;
  color: string;
  color_letra: string;
  estilo: string;
  stock: number;
}

export interface Ingrediente {
  id_ingrediente: number;
  nombre: string;
  familia_olfativa: string;
  stock: number;
  precio: number;
}

export class ProductoDAO {
  // --- FRASCOS ---
  static async getFrascos(): Promise<Frasco[]> {
    const { rows } = await pool.query('SELECT * FROM FRASCO');
    return rows;
  }

  // --- ETIQUETAS ---
  static async getEtiquetas(): Promise<Etiqueta[]> {
    const { rows } = await pool.query('SELECT * FROM ETIQUETA');
    return rows;
  }

  // --- INGREDIENTES ---
  static async getIngredientes(): Promise<Ingrediente[]> {
    const { rows } = await pool.query('SELECT * FROM INGREDIENTE');
    return rows;
  }

  static async updateStockIngrediente(id: number, cantidad: number): Promise<void> {
    await pool.query('UPDATE INGREDIENTE SET stock = stock - $1 WHERE ID_INGREDIENTE = $2', [cantidad, id]);
  }
}
