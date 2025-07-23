/**
 * Performance Monitor Component
 * Layer 3: Components (UI Building Blocks)
 * Monitors and displays performance metrics for development
 */

import React, { useEffect, useState, useRef } from 'react';
import { Activity, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  renderCount: number;
  collectionSize: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  collectionSize: number;
  isVisible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  collectionSize,
  isVisible = process.env.NODE_ENV === 'development'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    collectionSize,
    memoryUsage: 0
  });

  const [startTime] = useState(performance.now());
  const lastCollectionSize = useRef(collectionSize);
  const renderCountRef = useRef(0);

  // Update render count on every render (but don't cause state update)
  renderCountRef.current += 1;

  useEffect(() => {
    // Only update state when collection size actually changes
    if (lastCollectionSize.current !== collectionSize) {
      lastCollectionSize.current = collectionSize;
      
      setMetrics(prev => ({
        ...prev,
        renderCount: renderCountRef.current,
        collectionSize,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }));
    }
  }, [collectionSize]);

  if (!isVisible) return null;

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getStatusColor = () => {
    if (metrics.collectionSize > 100) return 'text-red-400';
    if (metrics.collectionSize > 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm text-white rounded-lg p-3 text-xs font-mono space-y-2 max-w-xs">
      <div className="flex items-center space-x-2 border-b border-gray-600 pb-2">
        <Activity className="w-4 h-4" />
        <span className="font-bold">{componentName}</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Renders:</span>
          <span className="font-bold">{renderCountRef.current}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Collection size:</span>
          <span className={`font-bold ${getStatusColor()}`}>{metrics.collectionSize}</span>
        </div>
        
        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className="font-bold">{formatMemory(metrics.memoryUsage)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Uptime:</span>
          <span className="font-bold">
            {((performance.now() - startTime) / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-600 pt-2">
        <div className="flex items-center space-x-1 text-xs text-gray-300">
          {metrics.collectionSize <= 50 ? (
            <>
              <Zap className="w-3 h-3 text-green-400" />
              <span>Optimal</span>
            </>
          ) : metrics.collectionSize <= 100 ? (
            <>
              <Clock className="w-3 h-3 text-yellow-400" />
              <span>Virtualized</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 text-red-400" />
              <span>Large collection</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;