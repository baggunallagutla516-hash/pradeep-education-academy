import api from './client';

export const paymentApi = {
  settings() {
    return api.get('/payments/settings');
  },
  mine() {
    return api.get('/payments/mine');
  },
  checkout(payload) {
    return api.post('/payments/checkout', payload);
  },
  submitUtr(payload) {
    return api.post('/payments/submit-utr', payload);
  },
  /** @deprecated use submitUtr */
  confirm(payload) {
    return api.post('/payments/submit-utr', payload);
  },
};
