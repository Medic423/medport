// Runtime configuration for TCC Frontend
// This file is loaded before the main application bundle
// It can be customized per deployment environment

window.__TCC_CONFIG__ = {
  // API base URL
  // Dev-SWA: https://dev-api.traccems.com
  // Production: https://api.traccems.com
  // Local dev: leave empty (uses Vite proxy)
  apiBaseUrl: typeof window !== 'undefined' && window.location.hostname === 'dev-swa.traccems.com' 
    ? 'https://dev-api.traccems.com'
    : typeof window !== 'undefined' && window.location.hostname === 'traccems.com'
    ? 'https://api.traccems.com'
    : ''
};

