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
        
        if (token && !demoMode) {
          // In a real app, you'd validate the token here
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 'user-1', name: 'Authenticated User' },
            token: token
          });
        } else if (demoMode === 'true') {
          // Demo mode - provide a demo token
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: { id: 'demo-user', name: 'Demo User' },
            token: 'demo-token'
          });
        } else {
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
  }, []);

  return authState;
};
