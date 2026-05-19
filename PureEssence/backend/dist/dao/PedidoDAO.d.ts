export interface Pedido {
    id_pedido?: number;
    descripcion: string;
    cantidad_total_perfumes: number;
    fecha: Date;
    precio_total: number;
    estado: string;
    id_usuario: number;
}
export declare class PedidoDAO {
    static create(p: Pedido): Promise<Pedido>;
    static getByUsuario(idUsuario: number): Promise<Pedido[]>;
    static getAllWithUser(): Promise<any[]>;
    static updateEstado(id: number, estado: string): Promise<void>;
}
