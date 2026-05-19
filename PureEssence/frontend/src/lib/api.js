// En producción (backend sirve frontend) usa URLs relativas (/api/...)
// En desarrollo usa localhost:3000
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
