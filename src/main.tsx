import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    let hasReloadedForUpdate = false;

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .then((registration) => {
        const requestUpdate = () => {
          registration.update().catch((error) => {
            console.error('Service worker update check failed:', error);
          });
        };

        requestUpdate();
        window.setInterval(requestUpdate, 60_000);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            requestUpdate();
          }
        });

        window.addEventListener('online', requestUpdate);
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hasReloadedForUpdate) return;
      hasReloadedForUpdate = true;
      window.location.reload();
    });
  });
}
