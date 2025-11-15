import api from './axios';

export const register = (payload) => api.post('/api/auth/register', payload);
export const login = (payload) => api.post('/api/auth/login', payload);


export const forgotPassword = (payload) => api.post('/api/auth/forgot-password', payload);
export const resetPassword = (id, token, payload) => api.post(`/api/auth/reset-password/${id}/${token}`, payload);
