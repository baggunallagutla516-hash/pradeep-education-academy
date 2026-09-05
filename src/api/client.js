import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error(
    '[api] Missing VITE_API_URL. Set it in frontend/.env (local) or your host env (deploy).'
  );
}

const api = axios.create({
  baseURL: baseURL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data?.details || null,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
