/**
 * ReactProfiler Usage Example
 * Layer 3: Components (UI Building Blocks)
 * 
 * This component demonstrates how to use the ReactProfiler component
 * for performance monitoring in development and production.
 * 
 * Context7 Performance Monitoring Integration Example
 */

import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Activity, BarChart3, Clock } from 'lucide-react';

// Context7: Lazy load ReactProfiler for optimal performance
const ReactProfiler = lazy(() => import('./ReactProfiler'));

interface ProfilerExampleProps {
  title?: string;
}

/**
 * Example component that demonstrates ReactProfiler integration
 */
export const ProfilerExample: React.FC<ProfilerExampleProps> = ({ 
  title = "Performance Monitoring Example" 
}) => {
  const [items, setItems] = useState<string[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Simulate expensive operations
  const addItems = useCallback(() => {
    const newItems = Array.from({ length: 100 }, (_, i) => `Item ${items.length + i + 1}`);
    setItems(prev => [...prev, ...newItems]);
  }, [items.length]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const forceRerender = useCallback(() => {
    setRenderTrigger(prev => prev + 1);
  }, []);

  // Simulate expensive calculation (for profiling demonstration)
  const expensiveCalculation = () => {
    let result = 0;
    for (let i = 0; i < 10000; i++) {
      result += Math.random();
    }
    return result;
  };

  const calculationResult = expensiveCalculation();

  return (
    <Suspense fallback={<div>Loading profiler...</div>}>
      <ReactProfiler 
        id="ProfilerExample" 
        onRenderThreshold={16} // 60fps threshold
        aggregateMetrics={true}
        enableWebVitals={true}
      >
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-500" />
              {title}
            </h2>
            <p className="text-gray-600">
              This component is wrapped with ReactProfiler for performance monitoring.
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+Shift+P</kbd> to toggle the profiler overlay.
            </p>
          </div>

          {/* Performance Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Performance Test Controls
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={addItems}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add 100 Items (Expensive Operation)
              </button>
              <button
                onClick={clearItems}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear Items
              </button>
              <button
                onClick={forceRerender}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Force Re-render
              </button>
            </div>
          </div>

          {/* Metrics Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Current Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-semibold text-gray-700">Items Count</div>
                <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-semibold text-gray-700">Render Trigger</div>
                <div className="text-2xl font-bold text-purple-600">{renderTrigger}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-semibold text-gray-700">Calculation Result</div>
                <div className="text-2xl font-bold text-green-600">{calculationResult.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Items List (potentially expensive to render) */}
          {items.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Items List ({items.length} items)
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {items.map((item, index) => (
                    <div 
                      key={`${item}-${index}`} 
                      className="p-2 bg-white rounded border text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">ReactProfiler Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>React.Profiler Integration:</strong> Tracks component render performance</li>
              <li>• <strong>Core Web Vitals:</strong> Monitors FCP, LCP, FID, CLS, and TTFB</li>
              <li>• <strong>Performance Aggregation:</strong> Calculates averages, optimization scores</li>
              <li>• <strong>Development Overlay:</strong> Toggle with Ctrl+Shift+P for real-time metrics</li>
              <li>• <strong>Threshold Logging:</strong> Logs slow renders above configurable threshold</li>
              <li>• <strong>Performance Recommendations:</strong> Suggests optimizations based on metrics</li>
            </ul>
          </div>
        </div>
      </ReactProfiler>
    </Suspense>
  );
};

export default ProfilerExample;