
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not expose process.env by default. This bridge is necessary
    // for the SDK to find the API key in a local development environment.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
