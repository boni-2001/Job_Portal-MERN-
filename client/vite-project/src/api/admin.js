// client/src/api/admin.js
import api from './axios';


export const listPendingJobs = () => api.get('/admin/jobs/pending');
export const approveJob = (jobId) => api.post(`/admin/jobs/${jobId}/approve`);
export const listNotifications = () => api.get('/admin/notifications');
export const markNotificationRead = (id) => api.put(`/admin/notifications/${id}/read`);


/* -----------------------------------------
   CONTACT MESSAGES (from Contact page)
----------------------------------------- */

// Get all contact messages (Admin only)
export const fetchContactMessages = () => api.get('/api/admin/messages');

// Mark a contact message as read
export const markContactMessageRead = (id) =>
  api.patch(`/api/admin/messages/${id}/read`);


/* -----------------------------------------
   ADMIN NOTIFICATIONS
----------------------------------------- */

// Unread count for the Admin's bell icon
export const fetchAdminUnreadCount = () =>
  api.get('/api/notifications/admin/unread-count');

// Fetch all admin notifications list
export const fetchAdminNotifications = () =>
  api.get('/api/notifications/admin');

//  This was renamed because you used markNotificationRead earlier elsewhere
export const markAdminNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read`);
