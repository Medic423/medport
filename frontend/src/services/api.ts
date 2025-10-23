import axios from 'axios';

// Environment hardening: require explicit API base URL, with safe dev fallback
const ENV_NAME = import.meta.env.MODE || (import.meta.env.DEV ? 'development' : 'production');
const EXPLICIT_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const DEFAULT_DEV_URL = 'http://localhost:5001';
// NOTE: Prefer setting VITE_API_URL in env. This fallback should point to the
// stable production API domain. Updated to latest Vercel backend deployment.
const DEFAULT_PROD_URL = 'https://backend-nxv1218vn-chuck-ferrells-projects.vercel.app';

let API_BASE_URL = EXPLICIT_API_URL || (import.meta.env.DEV ? '' : DEFAULT_PROD_URL);

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
  baseURL: API_BASE_URL,
  withCredentials: true,
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
    if (url.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options')) {
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
      if (url?.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options')) {
        console.log('TCC_DEBUG: API response ←', response.status, url, 'data:', response.data);
      }
    } catch {}
    return response;
  },
  (error) => {
    try {
      const url = (error.response?.config?.baseURL || '') + (error.response?.config?.url || '');
      if (url.includes('/api/tcc/agencies') || url.includes('/api/tcc/analytics') || url.includes('/api/dropdown-options')) {
        console.log('TCC_DEBUG: API error ✖', error.response?.status, url, 'data:', error.response?.data);
      }
    } catch {}
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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

// TCC Analytics API
export const tccAnalyticsAPI = {
  getOverview: () =>
    api.get('/api/tcc/analytics/overview'),
  
  getTrips: () =>
    api.get('/api/tcc/analytics/trips'),
  
  getCostAnalysis: (params?: any) =>
    api.get('/api/tcc/analytics/cost-analysis', { params }),
  
  getProfitability: (params?: any) =>
    api.get('/api/tcc/analytics/profitability', { params }),
  
  getCostBreakdowns: (params?: any) =>
    api.get('/api/tcc/analytics/cost-breakdowns', { params }),
};

// Analytics API (legacy export for compatibility)
export const analyticsAPI = {
  getOverview: () =>
    api.get('/api/tcc/analytics/overview'),
  
  getTrips: () =>
    api.get('/api/tcc/analytics/trips'),
  
  getCostAnalysis: (params?: any) =>
    api.get('/api/tcc/analytics/cost-analysis', { params }),
  
  getProfitability: (params?: any) =>
    api.get('/api/tcc/analytics/profitability', { params }),
};

// Trips API (legacy export for compatibility)
export const tripsAPI = {
  getAll: (params?: any) =>
    api.get('/api/trips', { params }),
  
  create: (data: any) =>
    api.post('/api/trips', data),
  
  // Enhanced create used by EnhancedTripForm
  createEnhanced: (data: any) =>
    api.post('/api/trips/with-responses', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/trips/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/trips/${id}`),

  updateStatus: (id: string, data: any) =>
    api.put(`/api/trips/${id}/status`, data),

  // Trip form option endpoints
  getOptions: {
    diagnosis: () => api.get('/api/trips/options/diagnosis'),
    mobility: () => api.get('/api/trips/options/mobility'),
    transportLevel: () => api.get('/api/trips/options/transport-level'),
    urgency: () => api.get('/api/trips/options/urgency'),
    insurance: () => api.get('/api/trips/options/insurance'),
  },

  // Agencies for facility within radius
  getAgenciesForHospital: (hospitalId: string, radius: number) =>
    api.get(`/api/trips/agencies/${encodeURIComponent(hospitalId)}`, { params: { radius } }),
};

// Units API
export const unitsAPI = {
  getOnDuty: () => api.get('/api/units/on-duty'),
  getAll: () => api.get('/api/units'),
  getById: (id: string) => api.get(`/api/units/${id}`),
};

// Agencies API (legacy export for compatibility)
export const agenciesAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/agencies', { params }),
  
  create: (data: any) =>
    api.post('/api/tcc/agencies', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/agencies/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/agencies/${id}`),
};

// Facilities API (legacy export for compatibility)
export const facilitiesAPI = {
  getAll: (params?: any) =>
    api.get('/api/tcc/facilities', { params }),
  
  create: (data: any) =>
    api.post('/api/tcc/facilities', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tcc/facilities/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tcc/facilities/${id}`),
};

// EMS Analytics API (legacy export for compatibility)
export const emsAnalyticsAPI = {
  getOverview: () =>
    api.get('/api/ems/analytics/overview'),
  
  getTrips: () =>
    api.get('/api/ems/analytics/trips'),
  
  getUnits: () =>
    api.get('/api/ems/analytics/units'),
  
  getPerformance: () =>
    api.get('/api/ems/analytics/performance'),
};

// Dropdown Options API (legacy export for compatibility)
export const dropdownOptionsAPI = {
  // Categories list
  getCategories: () =>
    api.get('/api/dropdown-options'),

  // Options by category
  getByCategory: (category: string) =>
    api.get(`/api/dropdown-options/${encodeURIComponent(category)}`),

  // Get default for a category
  getDefault: (category: string) =>
    api.get(`/api/dropdown-options/${encodeURIComponent(category)}/default`),

  // Set default for a category
  setDefault: (category: string, optionId: string) =>
    api.post(`/api/dropdown-options/${encodeURIComponent(category)}/default`, { optionId }),

  // CRUD for options
  create: (data: { category: string; value: string }) =>
    api.post('/api/dropdown-options', data),

  update: (id: string, data: { value: string }) =>
    api.put(`/api/dropdown-options/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/dropdown-options/${id}`),
};

// Optimization API
export const optimizationAPI = {
  createStream: (token: string) => {
    return new EventSource(`${API_BASE_URL}/api/optimize/stream?token=${encodeURIComponent(token)}`);
  },
  
  getOptimizationData: () =>
    api.get('/api/optimize/data'),
};

export default api;