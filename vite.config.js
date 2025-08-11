import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/budget/',   // schimbă aici în funcție de numele repo-ului tău
  plugins: [react()]
})
