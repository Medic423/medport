import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const demoMode = localStorage.getItem('demoMode');
        
        console.log('[USE_AUTH] Checking authentication...');
        console.log('[USE_AUTH] Token from localStorage:', token);
        console.log('[USE_AUTH] Demo mode from localStorage:', demoMode);
        console.log('[USE_AUTH] Demo mode === "true":', demoMode === 'true');
        
        if (token && !demoMode) {
          console.log('[USE_AUTH] Setting authenticated state with real token');
          // In a real app, you'd validate the token here
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 'user-1', name: 'Authenticated User' },
            token: token
          });
        } else if (demoMode === 'true') {
          console.log('[USE_AUTH] Setting demo mode state with demo-token');
          // Demo mode - provide a demo token
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 'demo-user', name: 'Demo User' },
            token: 'demo-token'
          });
        } else {
          console.log('[USE_AUTH] Setting unauthenticated state - no token, no demo mode');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null
          });
        }
      } catch (error) {
        console.error('[USE_AUTH] Error checking authentication:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null
        });
      }
    };

    checkAuth();
    
    // Also check on window focus to catch localStorage changes
    const handleFocus = () => {
      console.log('[USE_AUTH] Window focused, rechecking auth...');
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return authState;
};
