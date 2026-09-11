import api from './client';

export const parentApi = {
  login(payload) {
    return api.post('/parent/login', payload);
  },
  logout() {
    return api.post('/parent/logout');
  },
  me() {
    return api.get('/parent/me');
  },
  updateMe(payload) {
    return api.patch('/parent/me', payload);
  },
  forgotPassword(payload) {
    return api.post('/parent/forgot-password', payload);
  },
  verifyResetOtp(payload) {
    return api.post('/parent/verify-reset-otp', payload);
  },
  resetPassword(payload) {
    return api.post('/parent/reset-password', payload);
  },
  children() {
    return api.get('/parent/children');
  },
  child(studentId) {
    return api.get(`/parent/children/${studentId}`);
  },
  childResults(studentId) {
    return api.get(`/parent/children/${studentId}/results`);
  },
};
