import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3002,
      strictPort: true, // Don't try other ports if 3002 is busy
      host: true, // Allow external connections
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          secure: false
        }
      }
    },
    define: {
      // Make all environment variables available to the client
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode),
      // Use proxy for API calls to avoid CORS issues
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api'),
    }
  }
})
