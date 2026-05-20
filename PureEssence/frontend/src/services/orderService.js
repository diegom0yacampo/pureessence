import { api } from './api';

export const orderService = {
  getAll:          ()           => api.get('/orders'),
  getMine:         ()           => api.get('/orders/my'),
  getById:         (id)         => api.get(`/orders/${id}`),
  getByCustomer:   (customerId) => api.get(`/orders/customer/${customerId}`),
  create:          (data)       => api.post('/orders', data),
  updateStatus:    (id, status) => api.patch(`/orders/${id}/status`, { status }),
};
