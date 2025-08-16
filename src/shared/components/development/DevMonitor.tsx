/**
 * Development Monitor Component
 *
 * Provides comprehensive development monitoring tools for browser debugging
 * including React DevTools integration, performance monitoring, debugging utilities,
 * React Query DevTools, and React Scan integration.
 *
 * Following CLAUDE.md principles for development tooling and monitoring.
 */

import { useEffect, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface DevMonitorProps {
  showPerformanceMonitor?: boolean;
  showConsoleLogger?: boolean;
  showRenderTracker?: boolean;
  showReactQueryDevtools?: boolean;
  showReactScan?: boolean;
}

const DevMonitor: React.FC<DevMonitorProps> = ({
  showPerformanceMonitor = true,
  showConsoleLogger = true,
  showRenderTracker = true,
  showReactQueryDevtools = true,
  showReactScan = false,
}) => {
  const [isReactDevToolsConnected, setIsReactDevToolsConnected] =
    useState(false);
  const [isReactScanActive, setIsReactScanActive] = useState(false);
  const [performanceStats, setPerformanceStats] = useState({
    renderCount: 0,
    lastRenderTime: 0,
  });

  useEffect(() => {
    // Check if React DevTools browser extension is available
    const checkReactDevTools = () => {
      if (typeof window !== 'undefined') {
        // Check for React DevTools extension
        const hasReactDevTools = !!(
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled !== true
        );
        setIsReactDevToolsConnected(hasReactDevTools);

        if (!hasReactDevTools) {
          console.info(
            '🔧 React DevTools: Install the React Developer Tools browser extension for enhanced debugging:\n' +
              '• Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi\n' +
              '• Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/\n' +
              '• Edge: https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil'
          );
        }
      }
    };

    checkReactDevTools();

    // Performance monitoring
    if (showPerformanceMonitor && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (
            entry.entryType === 'measure' ||
            entry.entryType === 'navigation'
          ) {
            console.log(
              `⚡ Performance: ${entry.name} - ${entry.duration?.toFixed(2)}ms`
            );
          }
        });
      });
      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => observer.disconnect();
    }
  }, [showPerformanceMonitor]);

  useEffect(() => {
    if (showRenderTracker) {
      setPerformanceStats((prev) => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: performance.now(),
      }));
    }
  }, [showRenderTracker]);

  // Initialize React Scan if enabled
  useEffect(() => {
    if (showReactScan && import.meta.env.DEV) {
      const initReactScan = async () => {
        try {
          const { scan } = await import('react-scan');
          scan({
            enabled: true,
            log: true, // Show performance logs in console
          });
          setIsReactScanActive(true);
          console.log('🔍 React Scan: Initialized successfully');
        } catch (error) {
          console.warn('🔍 React Scan: Failed to initialize', error);
        }
      };

      initReactScan();
    }
  }, [showReactScan]);

  useEffect(() => {
    if (showConsoleLogger) {
      console.group('🔧 Development Monitor Initialized');
      console.log('React DevTools Connected:', isReactDevToolsConnected);
      console.log('React Query DevTools:', showReactQueryDevtools);
      console.log('React Scan Active:', isReactScanActive);
      console.log('Performance Monitoring:', showPerformanceMonitor);
      console.log('Render Tracking:', showRenderTracker);
      console.log('Environment:', import.meta.env.MODE);
      console.groupEnd();
    }
  }, [
    isReactDevToolsConnected,
    isReactScanActive,
    showPerformanceMonitor,
    showRenderTracker,
    showReactQueryDevtools,
    showConsoleLogger,
  ]);

  // Development overlay (only visible in development)
  return (
    <>
      {/* Dev Monitor - Top left corner */}
      <div className="fixed top-2 left-2 z-50 max-w-xs">
        <details className="bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm">
          <summary className="cursor-pointer select-none font-mono">
            🔧 Dev Monitor
          </summary>
          <div className="mt-2 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>React DevTools:</span>
              <span
                className={
                  isReactDevToolsConnected ? 'text-green-400' : 'text-red-400'
                }
              >
                {isReactDevToolsConnected ? '✓ Connected' : '✗ Not Found'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>React Query:</span>
              <span
                className={
                  showReactQueryDevtools ? 'text-green-400' : 'text-gray-400'
                }
              >
                {showReactQueryDevtools ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>React Scan:</span>
              <span
                className={
                  isReactScanActive ? 'text-green-400' : 'text-red-400'
                }
              >
                {isReactScanActive ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>

            {showRenderTracker && (
              <div className="flex justify-between">
                <span>Renders:</span>
                <span className="text-blue-400">
                  {performanceStats.renderCount}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-yellow-400">{import.meta.env.MODE}</span>
            </div>

            <div className="text-xs text-gray-400 mt-2 space-y-1">
              <div>F12 → Components (React DevTools)</div>
              <div>F12 → React Query (Queries)</div>
              {isReactScanActive && <div>Console: React Scan logs</div>}
            </div>
          </div>
        </details>
      </div>

      {/* React Query DevTools - Bottom left corner, separate from Dev Monitor */}
      {showReactQueryDevtools && import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-left"
          buttonPosition="bottom-left"
        />
      )}
    </>
  );
};

// Global type augmentation for React DevTools hook
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      isDisabled?: boolean;
      supportsFiber?: boolean;
    };
  }
}

export default DevMonitor;
