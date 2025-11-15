import api from './axios';

export const sendContactMessage = (payload) => {
  // payload: { name, email, subject, message }
  return api.post('/api/contact', payload);
};
