import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Numele repo-ului tău de pe GitHub
  base: '/budget-app/',

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },

  // Fallback pentru React Router (SPA)
  server: {
    historyApiFallback: true
  },
  preview: {
    historyApiFallback: true
  }
});
