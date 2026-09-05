import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (!env.VITE_API_URL) {
    console.warn(
      '[vite] VITE_API_URL is not set. Create frontend/.env with VITE_API_URL=http://localhost:5000/api'
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
  };
});
