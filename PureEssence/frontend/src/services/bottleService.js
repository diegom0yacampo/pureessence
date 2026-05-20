import { api } from './api';

export const bottleService = {
  getAll:      ()           => api.get('/bottles'),
  getAllAdmin:  ()           => api.get('/admin/bottles'),
  updateStock: (id, stock)  => api.patch(`/bottles/${id}/stock`, { stock }),
};
