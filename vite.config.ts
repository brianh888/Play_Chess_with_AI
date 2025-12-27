
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' allows loading variables without the VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Explicitly define process.env.API_KEY for the client-side code.
      // Vite will replace occurrences of 'process.env.API_KEY' with this value.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
