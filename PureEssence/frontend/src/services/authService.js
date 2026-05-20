import { api } from './api';

export const authService = {
  me:       ()                                       => api.get('/auth/me'),
  login:    (identifier, password)                   => api.post('/auth/login', { identifier, password }),
  register: (username, email, password, dni, address) =>
    api.post('/auth/register', { username, email, password, dni, address }),
  logout:   ()                                       => api.post('/auth/logout'),
};
