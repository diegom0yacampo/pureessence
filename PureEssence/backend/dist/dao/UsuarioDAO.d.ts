export interface Usuario {
    id_usuario?: number;
    nombre: string;
    email: string;
    contrasenya: string;
    dni: string;
    direccion?: string;
    rol: 'User' | 'Admin';
}
export declare class UsuarioDAO {
    static getAll(): Promise<Usuario[]>;
    static getById(id: number): Promise<Usuario | null>;
    static getByEmail(email: string): Promise<Usuario | null>;
    static create(u: Usuario): Promise<Usuario>;
    static update(id: number, u: Partial<Usuario>): Promise<Usuario | null>;
    static delete(id: number): Promise<boolean>;
}
