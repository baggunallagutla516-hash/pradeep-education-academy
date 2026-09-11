import api from './client';

export const educatorApi = {
  register(payload) {
    return api.post('/educator/register', payload);
  },
  login(payload) {
    return api.post('/educator/login', payload);
  },
  logout() {
    return api.post('/educator/logout');
  },
  me() {
    return api.get('/educator/me');
  },
  updateMe(payload) {
    return api.patch('/educator/me', payload);
  },
  forgotPassword(payload) {
    return api.post('/educator/forgot-password', payload);
  },
  verifyResetOtp(payload) {
    return api.post('/educator/verify-reset-otp', payload);
  },
  resetPassword(payload) {
    return api.post('/educator/reset-password', payload);
  },
  worksheets(params) {
    return api.get('/educator/worksheets', { params });
  },
  worksheet(id) {
    return api.get(`/educator/worksheets/${id}`);
  },
  unitTests(params) {
    return api.get('/educator/unit-tests', { params });
  },
  unitTest(id) {
    return api.get(`/educator/unit-tests/${id}`);
  },
  cets(params) {
    return api.get('/educator/cets', { params });
  },
  cet(id) {
    return api.get(`/educator/cets/${id}`);
  },
  quizzes: {
    list() {
      return api.get('/educator/quizzes');
    },
    get(id) {
      return api.get(`/educator/quizzes/${id}`);
    },
    start(id) {
      return api.post(`/educator/quizzes/${id}/start`);
    },
    submit(id, payload) {
      return api.post(`/educator/quizzes/${id}/submit`, payload);
    },
    result(id) {
      return api.get(`/educator/quizzes/${id}/result`);
    },
  },
};
