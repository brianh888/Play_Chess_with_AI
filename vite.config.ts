import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load all environment variables from .env file
  // Importing process from 'node:process' ensures process.cwd() is correctly typed for Node.js environments
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is available in the browser via Vite's define replacement
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  };
});