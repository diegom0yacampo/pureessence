import { pool } from '../db.js';

export interface Pedido {
  id_pedido?: number;
  descripcion: string;
  cantidad_total_perfumes: number;
  fecha: Date;
  precio_total: number;
  estado: string;
  id_usuario: number;
}

export class PedidoDAO {
  static create(p: Pedido): Promise<Pedido> {
    return pool.connect().then((client: any) => {
      return client.query('BEGIN')
        .then(() => client.query(
          'INSERT INTO PEDIDO (descripcion, cantidad_total_perfumes, fecha, precio_total, estado, id_usuario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [p.descripcion, p.cantidad_total_perfumes, p.fecha, p.precio_total, p.estado || 'Pendiente', p.id_usuario]
        ))
        .then(({ rows }: { rows: any[] }) => {
          return client.query('COMMIT').then(() => {
            client.release();
            return rows[0];
          });
        })
        .catch((e: any) => {
          return client.query('ROLLBACK').then(() => {
            client.release();
            throw e;
          });
        });
    });
  }

  static async getByUsuario(idUsuario: number): Promise<Pedido[]> {
    const { rows } = await pool.query('SELECT * FROM PEDIDO WHERE ID_USUARIO = $1 ORDER BY FECHA DESC', [idUsuario]);
    return rows;
  }

  static async getAllWithUser(): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT p.*, u.nombre as nombre_usuario, u.email 
      FROM PEDIDO p 
      JOIN USUARIO u ON p.ID_USUARIO = u.ID_USUARIO
      ORDER BY p.FECHA DESC
    `);
    return rows;
  }

  static async updateEstado(id: number, estado: string): Promise<void> {
    await pool.query('UPDATE PEDIDO SET ESTADO = $1 WHERE ID_PEDIDO = $2', [estado, id]);
  }
}
