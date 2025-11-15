// client/src/api/jobs.js
import api from './axios';

/**
 * Small helper: only set multipart headers if the payload is FormData.
 * (Prevents accidental 'application/json' on file uploads.)
 */
const withMaybeMultipart = (payload) => {
  const config = {};
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    // Let the browser/axios set the boundary automatically by only specifying the type
    config.headers = { 'Content-Type': 'multipart/form-data' };
  }
  return config;
};

// ===== Public =====
export const listJobs = (params) => api.get('/api/jobs', { params });

// Keep existing name
export const getJob = (id) => api.get(`/api/jobs/${id}`);

// Add alias so components can use either name
export const getJobById = (id) => getJob(id);

// ===== Recruiter CRUD =====
export const recruiterMyJobs = (params) =>
  api.get('/api/jobs/recruiter/me', { params });

export const createJob = (payload) =>
  api.post('/api/jobs', payload, withMaybeMultipart(payload));

export const updateJob = (id, payload) =>
  api.put(`/api/jobs/${id}`, payload, withMaybeMultipart(payload));

export const deleteJob = (id) =>
  api.delete(`/api/jobs/${id}`);
