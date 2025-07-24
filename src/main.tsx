import React from 'react';
import ReactDOM from 'react-dom/client';
import { scan } from 'react-scan';
import { ThemeProvider } from 'next-themes';
import App from './App.tsx';
import './index.css';

// Enable React Scan for performance monitoring
if (import.meta.env.DEV) {
  scan({
    enabled: true,
    showToolbar: true,
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
