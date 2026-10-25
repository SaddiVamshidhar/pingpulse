import axios from 'axios';

// Relative base URL: Vite proxies it in development, Nginx proxies it inside Docker.
const api = axios.create({ baseURL: '/api' });

export const getMonitors = () => api.get('/monitors').then((r) => r.data.data);
export const getMonitor = (id) => api.get(`/monitors/${id}`).then((r) => r.data.data);
export const getChecks = (id, limit = 60) =>
  api.get(`/monitors/${id}/checks`, { params: { limit } }).then((r) => r.data.data);
export const createMonitor = (body) => api.post('/monitors', body).then((r) => r.data.data);
export const updateMonitor = (id, body) => api.put(`/monitors/${id}`, body).then((r) => r.data.data);
export const toggleMonitor = (id) => api.patch(`/monitors/${id}/toggle`).then((r) => r.data.data);
export const deleteMonitor = (id) => api.delete(`/monitors/${id}`).then((r) => r.data);
export const getStatus = () => api.get('/status').then((r) => r.data);

export const errorMessage = (err) => err.response?.data?.message || err.message;
