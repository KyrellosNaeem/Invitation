import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      '192.168.1.6',
      '7e1d-197-48-145-8.ngrok-free.app',
    ],
  },
});