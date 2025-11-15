import api from './axios';

export const me = () => api.get('/api/users/me');

export const updateMe = (formData) =>
  api.put('/api/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getApplicantForRecruiter = (userId) =>
  api.get(`/api/users/${userId}/for-recruiter`);