import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Любой запрос на /api/... будет перенаправлен на .NET
      '/api': {
        target: 'https://localhost:7066', // <-- Твой backend URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
});