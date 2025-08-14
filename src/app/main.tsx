import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// Phase 1.3: Import unified CSS entry point for optimal performance
import '../styles/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
