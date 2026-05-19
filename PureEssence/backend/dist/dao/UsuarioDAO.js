import { pool } from '../db.js';
export class UsuarioDAO {
    static async getAll() {
        const { rows } = await pool.query('SELECT * FROM USUARIO');
        return rows;
    }
    static async getById(id) {
        const { rows } = await pool.query('SELECT * FROM USUARIO WHERE ID_USUARIO = $1', [id]);
        return rows[0] || null;
    }
    static async getByEmail(email) {
        const { rows } = await pool.query('SELECT * FROM USUARIO WHERE EMAIL = $1', [email]);
        return rows[0] || null;
    }
    static async create(u) {
        const { rows } = await pool.query('INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [u.nombre, u.email, u.contrasenya, u.dni, u.direccion, u.rol || 'User']);
        return rows[0];
    }
    static async update(id, u) {
        const { rows } = await pool.query('UPDATE USUARIO SET nombre = COALESCE($1, nombre), direccion = COALESCE($2, direccion) WHERE ID_USUARIO = $3 RETURNING *', [u.nombre, u.direccion, id]);
        return rows[0] || null;
    }
    static async delete(id) {
        const { rowCount } = await pool.query('DELETE FROM USUARIO WHERE ID_USUARIO = $1', [id]);
        return (rowCount ?? 0) > 0;
    }
}
