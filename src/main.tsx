import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enable react-scan for development performance monitoring
if (process.env.NODE_ENV === 'development') {
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      log: true,
      showToolbar: true,
      alwaysShowLabels: false,
      renderCountThreshold: 3,
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
