import { api } from './api';

export const ingredientService = {
  getAll:      ()           => api.get('/ingredients'),
  getAllAdmin:  ()           => api.get('/admin/ingredients'),
  updateStock: (id, stock)  => api.patch(`/ingredients/${id}/stock`, { stock }),
};
