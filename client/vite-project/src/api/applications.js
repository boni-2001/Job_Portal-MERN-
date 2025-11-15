import api from './axios';

export const applyToJob = (jobId, formData) =>
  api.post(`/api/applications/apply/${jobId}`, formData, { headers: { 'Content-Type':'multipart/form-data' } });

export const myApplications = () => api.get('/api/applications/me');

export const recruiterApplicationsForJob = (jobId) =>
  api.get(`/api/applications/job/${jobId}`);

export const recruiterAllApplications = (params) =>
  api.get('/api/applications/recruiter/me', { params });

export const updateApplicationStatus = (id, status) =>
  api.put(`/api/applications/${id}/status`, { status });
