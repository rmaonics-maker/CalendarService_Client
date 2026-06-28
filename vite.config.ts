import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Прокси маршрутизирует запросы на три разных микросервиса сервера (Docker Compose):
//  - Auth API     : http://localhost:8081  (/connect, /Account)
//  - Calendar API : http://localhost:8080  (/api/v1, /health)
//  - Booking API  : http://localhost:8082  (/api/bookings)
//
// ВАЖНО: порядок правил имеет значение — '/api/bookings' должен идти ДО '/api/v1',
// иначе Vite сопоставит бронирования с правилом Calendar.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/bookings': { target: 'http://localhost:8082', changeOrigin: true }, // Booking
      '/api/v1': { target: 'http://localhost:8080', changeOrigin: true }, // Calendar
      '/connect': { target: 'http://localhost:8081', changeOrigin: true }, // Auth (token)
      '/Account': { target: 'http://localhost:8081', changeOrigin: true }, // Auth (register)
      '/health': { target: 'http://localhost:8080', changeOrigin: true }, // Calendar health
    },
  },
});
