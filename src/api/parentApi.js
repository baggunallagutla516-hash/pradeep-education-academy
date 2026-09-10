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
