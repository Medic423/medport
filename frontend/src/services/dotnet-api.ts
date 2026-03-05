import axios from 'axios';
console.log('here tyler')
// Environment hardening: require explicit API base URL, with safe dev fallback
const ENV_NAME = import.meta.env.MODE || (import.meta.env.DEV ? 'development' : 'production');
const EXPLICIT_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const DEFAULT_DEV_URL = 'https://localhost:7140';
// NOTE: Prefer setting VITE_API_URL in env. This fallback should point to the
// stable production API domain. Updated to use custom domain.
// Backend production URL (ensure this matches the latest production backend or set VITE_API_URL)
const DEFAULT_PROD_URL = 'https://api.traccems.com';

// Runtime config via public/config.js → window.__TCC_CONFIG__
type TCCRuntimeConfig = { apiBaseUrl?: string } | undefined;
function readRuntimeConfig(): TCCRuntimeConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = typeof window !== 'undefined' ? (window as any) : undefined;
    return g && g.__TCC_CONFIG__ ? (g.__TCC_CONFIG__ as TCCRuntimeConfig) : undefined;
  } catch {
    return undefined;
  }
}

const RUNTIME_API_URL = "https://localhost:7140"//readRuntimeConfig()?.apiBaseUrl;

let API_BASE_URL = RUNTIME_API_URL || EXPLICIT_API_URL || (import.meta.env.DEV ? '' : DEFAULT_PROD_URL);

// Guard against accidental cross-environment use
try {
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  if (isLocal && API_BASE_URL !== '') {
    console.warn('TCC_WARN: Localhost detected but API_BASE_URL is not empty. For safety using empty string for proxy');
    API_BASE_URL = '';
  }
} catch {}

console.log('TCC_DEBUG: API_BASE_URL is set to:', API_BASE_URL, 'ENV:', ENV_NAME);

// Create axios instance
const api = axios.create({
  baseURL: "https://localhost:7140",//API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
    // NOTE: Do NOT set custom headers by default to avoid CORS issues
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('TCC_DEBUG: API request interceptor - token present:', !!token);
  console.log('TCC_DEBUG: API request interceptor - token value:', token ? token.substring(0, 20) + '...' : 'none');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('TCC_DEBUG: API request interceptor - Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
  }
  // Only include X-TCC-Env for same-origin requests; never on auth endpoints
  try {
    const apiOrigin = new URL(API_BASE_URL).origin;
    const pageOrigin = typeof window !== 'undefined' ? window.location.origin : apiOrigin;
    const isSameOrigin = apiOrigin === pageOrigin;
    const urlPath = (config.url || '').toString();
    const isAuthRoute = urlPath.startsWith('/api/auth/');
    if (!isAuthRoute && isSameOrigin) {
      (config.headers as any)['X-TCC-Env'] = ENV_NAME;
    } else {
      // Ensure we do not send this header cross-origin or to auth routes
      if ((config.headers as any)['X-TCC-Env']) delete (config.headers as any)['X-TCC-Env'];
    }
  } catch {}
  try {
    const url = (config.baseURL || '') + (config.url || '');
    if (url.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options') || url.includes('/trip-agencies') || url.includes('/dispatch')) {
      console.log('TCC_DEBUG: API request →', config.method?.toUpperCase(), url, 'params:', config.params, 'data:', config.data);
    }
  } catch {}
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    try {
      const url = response.config?.baseURL + (response.config?.url || '');
      if (url?.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options') || url.includes('/trip-agencies') || url.includes('/dispatch')) {
        console.log('TCC_DEBUG: API response ←', response.status, url, 'data:', response.data);
      }
      // First-login enforcement: capture mustChangePassword flag on any auth login
      const path = response.config?.url || '';
      const isLoginEndpoint = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/healthcare/login') || path.startsWith('/api/auth/ems/login');
      if (isLoginEndpoint && response.data && response.data.mustChangePassword === true) {
        try { localStorage.setItem('mustChangePassword', 'true'); } catch {}
      }
    } catch {}
    return response;
  },
  (error) => {
    try {
      const url = (error.response?.config?.baseURL || '') + (error.response?.config?.url || '');
      if (url.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options') || url.includes('/trip-agencies') || url.includes('/dispatch')) {
        console.log('TCC_DEBUG: API error ✖', error.response?.status, url, 'data:', error.response?.data);
      }
    } catch {}
    if (error.response?.status === 401) {
      const path = error.response?.config?.url || '';
      // Don't redirect on login/auth endpoints - let the component handle the error
      const isAuthEndpoint = path.startsWith('/api/auth/login') || 
                            path.startsWith('/api/auth/healthcare/login') || 
                            path.startsWith('/api/auth/ems/login') ||
                            path.startsWith('/api/auth/register') ||
                            path.startsWith('/api/auth/healthcare/register') ||
                            path.startsWith('/api/auth/ems/register');
      
      if (!isAuthEndpoint) {
        // Only redirect for authenticated endpoints, not login failures
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('TCC_DEBUG: API login called with URL:', API_BASE_URL + '/api/auth/login');
    console.log('TCC_DEBUG: API login called with credentials:', credentials);
    return api.post('/api/auth/login', credentials);
  },
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  verify: () =>
    api.get('/api/auth/verify'),

  register: (userData: { email: string; password: string; name: string; userType: 'ADMIN' | 'USER' }) =>
    api.post('/api/auth/register', userData),

  healthcareRegister: (userData: { email: string; password: string; name: string; facilityName: string; facilityType: string }) =>
    api.post('/api/auth/healthcare/register', userData),

  emsRegister: (userData: { email: string; password: string; name: string; agencyName: string; serviceType: string }) =>
    api.post('/api/auth/ems/register', userData),

  healthcareLogin: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/healthcare/login', credentials),

  emsLogin: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/ems/login', credentials),

  getUsers: () =>
    api.get('/api/auth/users'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/api/auth/password/change', data),

  getEMSAgencyInfo: () =>
    api.get('/api/auth/ems/agency/info'),

  getEMSAgencyAvailability: () =>
    api.get('/api/auth/ems/agency/availability'),

  updateEMSAgencyAvailability: (data: { isAvailable: boolean; availableLevels: string[] }) =>
    api.put('/api/auth/ems/agency/availability', data),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/hospitals', { params }),
  
  create: (data: any) =>
    api.post('/api/tcc/hospitals', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/hospitals/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/hospitals/${id}`),
};


export default api;