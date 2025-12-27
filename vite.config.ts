
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix: Removed the loadEnv call that was causing the 'Property cwd does not exist' error.
// Additionally, removed the manual 'define' block for process.env. In accordance with 
// Google GenAI guidelines, the API key is injected automatically via process.env.API_KEY, 
// and the 'process.env' object should not be manually defined in the Vite configuration.
export default defineConfig({
  plugins: [react()],
});
