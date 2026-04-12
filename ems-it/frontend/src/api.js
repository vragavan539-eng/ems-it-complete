const BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'https://ems-it-complete-4.onrender.com/api';

const getHeaders = (isForm = false) => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  if (!isForm) headers['Content-Type'] = 'application/json';
  return headers;
};

export const api = {
  get: (url) => fetch(`${BASE}${url}`, { headers: getHeaders() }).then(r => r.json()),
  post: (url, body) => fetch(`${BASE}${url}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  postForm: (url, formData) => fetch(`${BASE}${url}`, { method: 'POST', headers: getHeaders(true), body: formData }).then(r => r.json()),
  put: (url, body) => fetch(`${BASE}${url}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  putForm: (url, formData) => fetch(`${BASE}${url}`, { method: 'PUT', headers: getHeaders(true), body: formData }).then(r => r.json()),
  patch: (url, body) => fetch(`${BASE}${url}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url) => fetch(`${BASE}${url}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
};

export default api;