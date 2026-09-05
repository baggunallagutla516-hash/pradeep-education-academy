import api from './client';

export const contactApi = {
  submit(payload) {
    return api.post('/contact', payload);
  },
};
