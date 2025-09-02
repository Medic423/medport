/**
 * API utility functions for making HTTP requests
 */

// Get API base URL from environment variables
const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  const fallback = 'http://localhost:5001/api';
  
  return envBase || fallback;
};

const API_BASE = getApiBase();

/**
 * Make an authenticated API request
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(`${API_BASE}${endpoint}`, config);
};

/**
 * Make a GET request
 */
export const apiGet = (endpoint: string, options?: RequestInit) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * Make a POST request
 */
export const apiPost = (endpoint: string, data?: any, options?: RequestInit) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PUT request
 */
export const apiPut = (endpoint: string, data?: any, options?: RequestInit) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a DELETE request
 */
export const apiDelete = (endpoint: string, data?: any, options?: RequestInit) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PATCH request
 */
export const apiPatch = (endpoint: string, data?: any, options?: RequestInit) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};
