const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get:    (url)         => request(url),
  post:   (url, data)   => request(url, { method: 'POST',  body: JSON.stringify(data) }),
  put:    (url, data)   => request(url, { method: 'PUT',   body: JSON.stringify(data) }),
  patch:  (url, data)   => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url)         => request(url, { method: 'DELETE' }),
};
