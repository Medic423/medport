import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3002, // Back to standard port
      strictPort: true,
      host: 'localhost',
      hmr: false, // Disable HMR to avoid WebSocket issues
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
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
