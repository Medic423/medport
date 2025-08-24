import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Enhanced service worker registration with offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[MedPort] Enhanced Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[MedPort] New service worker available. Reload to update.');
              // Optionally show update notification to user
            }
          });
        }
      });
    } catch (error) {
      console.error('[MedPort] Enhanced Service Worker registration failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
