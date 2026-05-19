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
export declare class ProductoDAO {
    static getFrascos(): Promise<Frasco[]>;
    static getEtiquetas(): Promise<Etiqueta[]>;
    static getIngredientes(): Promise<Ingrediente[]>;
    static updateStockIngrediente(id: number, cantidad: number): Promise<void>;
}
