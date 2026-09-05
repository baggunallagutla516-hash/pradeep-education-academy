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
  classes() {
    return api.get('/auth/classes');
  },
  parents() {
    return api.get('/auth/parents');
  },
};
