import api from './client';

export const visitorApi = {
  getCount() {
    return api.get('/visitors');
  },
  track() {
    return api.post('/visitors/track');
  },
};
