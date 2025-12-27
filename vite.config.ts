
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  // Fix: Cast process to any to resolve the TypeScript error where 'cwd' is not found on the Process type.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Combine .env values with existing system environment variables
  const apiKey = env.API_KEY || process.env.API_KEY || '';
  
  return {
    plugins: [react()],
    define: {
      // This performs a literal string replacement in the source code.
      // We stringify the value to ensure it's treated as a string literal.
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  };
});
