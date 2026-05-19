export interface CustomOrder {
  id?: number;
  customer_name: string;
  email: string;
  bottle_shape: string;
  fragrance: string;
  label_text: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: Date;
}

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;    // precio en euros, ej: 19.99
  category: string;
  stock: number;    // unidades disponibles
  image_url: string;
}
