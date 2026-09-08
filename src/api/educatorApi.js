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
};
