import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // fallback
console.log('API BASE:', base); //  http://localhost:5000 

const api = axios.create({
  baseURL: base,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
