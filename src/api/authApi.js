import api from './client';

export const authApi = {
  register(payload) {
    return api.post('/auth/register', payload);
  },
  login(payload) {
    return api.post('/auth/login', payload);
  },
  logout() {
    return api.post('/auth/logout');
  },
  me() {
    return api.get('/auth/me');
  },
  updateMe(payload) {
    return api.patch('/auth/me', payload);
  },
  changePassword(payload) {
    return api.post('/auth/change-password', payload);
  },
  forgotPassword(payload) {
    return api.post('/auth/forgot-password', payload);
  },
  verifyResetOtp(payload) {
    return api.post('/auth/verify-reset-otp', payload);
  },
  resetPassword(payload) {
    return api.post('/auth/reset-password', payload);
  },
  classes() {
    return api.get('/auth/classes');
  },
  parents() {
    return api.get('/auth/parents');
  },
};
