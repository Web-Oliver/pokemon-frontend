import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { log } from './utils/logger'
import apiClient from './api/apiClient'

function App() {
  const [count, setCount] = useState(0)
  
  // Test logger functionality
  log('App loaded!');

  // Test API client error handling
  useEffect(() => {
    const testApiClient = async () => {
      try {
        await apiClient.get('/non-existent-endpoint');
      } catch (error) {
        // Error is already handled by the interceptor
        log('Expected API error occurred and was handled');
      }
    };
    
    testApiClient();
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-bold underline text-blue-500">Pokemon Collection Frontend</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App