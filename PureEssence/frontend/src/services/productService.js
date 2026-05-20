import { api } from './api';

export const productService = {
  getAll:      ()           => api.get('/products'),
  getAllAdmin:  ()           => api.get('/products/inactive'),
  getById:     (id)         => api.get(`/products/${id}`),
  create:      (data)       => api.post('/products', data),
  update:      (id, data)   => api.put(`/products/${id}`, data),
  remove:      (id)         => api.delete(`/products/${id}`),
  updateStock: (id, stock)  => api.patch(`/products/${id}/stock`, { stock }),
  toggle:      (id)         => api.patch(`/products/${id}/toggle`),
};
