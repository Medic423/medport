import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

interface UseServiceWorkerOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export const useServiceWorker = (options: UseServiceWorkerOptions = {}): ServiceWorkerState => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalled: false,
    isUpdated: false,
    isOffline: !navigator.onLine,
    registration: null,
    error: null
  });

  const { onUpdate, onSuccess, onError } = options;

  const updateServiceWorker = useCallback(async () => {
    if (!state.registration) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to activate the new service worker
        window.location.reload();
      }
    } catch (error) {
      console.error('[useServiceWorker] Failed to update service worker:', error);
      if (onError) onError(error as Error);
    }
  }, [state.registration, onError]);

  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Service Worker not supported' }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
        error: null
      }));

      if (onSuccess) onSuccess(registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker is available
              setState(prev => ({ ...prev, isUpdated: true }));
              if (onUpdate) onUpdate(registration);
            } else {
              // First time installation
              setState(prev => ({ ...prev, isInstalled: true }));
            }
          }
        });
      });

      // Handle service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState(prev => ({ ...prev, isUpdated: false }));
        window.location.reload();
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_VERSION_UPDATED') {
          setState(prev => ({ ...prev, isUpdated: true }));
        }
      });

    } catch (error) {
      console.error('[useServiceWorker] Registration failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }));
      if (onError) onError(error as Error);
    }
  }, [state.isSupported, onSuccess, onError, onUpdate]);

  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
    } catch (error) {
      console.error('[useServiceWorker] Update check failed:', error);
    }
  }, [state.registration]);

  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker on mount
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      registerServiceWorker();
    }
  }, [state.isSupported, state.isRegistered, registerServiceWorker]);

  // Check for updates periodically
  useEffect(() => {
    if (!state.isRegistered) return;

    const interval = setInterval(checkForUpdates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.isRegistered, checkForUpdates]);

  return {
    ...state,
    updateServiceWorker
  };
};

export default useServiceWorker;
