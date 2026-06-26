import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: we just add the React plugin (enables JSX transform + Fast Refresh)
// and pin the dev server to port 3000 to match the CORS whitelist in the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
