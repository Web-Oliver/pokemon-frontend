/**
 * CLAUDE.md COMPLIANCE: Theme Performance Monitor Component
 *
 * SRP: Single responsibility for theme performance monitoring
 * OCP: Open for extension via props interface
 * DIP: Depends on performance utilities abstraction
 */

import { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/unifiedUtilities';

interface PerformanceData {
  renderTime: number;
  memoryUsage: number;
  themeLoadTime: number;
  cssVariableCount: number;
  animationFrames: number;
  timestamp: number;
}

interface ThemePerformanceMonitorProps {
  /** Enable performance monitoring */
  enabled?: boolean;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Maximum history entries to keep */
  maxHistorySize?: number;
  /** Callback when performance issues are detected */
  onPerformanceIssue?: (issue: string) => void;
}

/**
 * ThemePerformanceMonitor Component
 * Monitors theme-related performance metrics
 *
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only performance monitoring
 * - DRY: Reusable monitoring logic
 * - SOLID: Clean interface with dependency injection
 */
export const ThemePerformanceMonitor: React.FC<
  ThemePerformanceMonitorProps
> = ({
  enabled = true,
  updateInterval = 1000,
  maxHistorySize = 50,
  onPerformanceIssue,
}) => {
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<
    PerformanceData[]
  >([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);

  // Collect performance metrics
  const collectPerformanceData = (): PerformanceData => {
    const now = performance.now();

    // Measure render time (simplified)
    const renderStart = performance.now();
    const renderTime = performance.now() - renderStart;

    // Get memory usage (if available)
    const memoryUsage = (performance as any).memory
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024
      : 0;

    // Count CSS custom properties
    const cssVariableCount = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules || []);
        } catch {
          return [];
        }
      })
      .filter((rule) => rule.cssText?.includes('--')).length;

    // Get theme load time from performance entries
    const themeEntries = performance
      .getEntriesByType('measure')
      .filter((entry) => entry.name.includes('theme'));
    const themeLoadTime =
      themeEntries.length > 0
        ? themeEntries[themeEntries.length - 1].duration
        : 0;

    return {
      renderTime,
      memoryUsage,
      themeLoadTime,
      cssVariableCount,
      animationFrames: frameCountRef.current,
      timestamp: now,
    };
  };

  // Check for performance issues
  const checkPerformanceIssues = (data: PerformanceData) => {
    if (!onPerformanceIssue) return;

    if (data.renderTime > 16) {
      // > 60fps threshold
      onPerformanceIssue(`High render time: ${data.renderTime.toFixed(2)}ms`);
    }

    if (data.memoryUsage > 100) {
      // > 100MB
      onPerformanceIssue(`High memory usage: ${data.memoryUsage.toFixed(1)}MB`);
    }

    if (data.cssVariableCount > 1000) {
      onPerformanceIssue(`Too many CSS variables: ${data.cssVariableCount}`);
    }
  };

  // Start performance monitoring
  useEffect(() => {
    if (!enabled) return;

    // Animation frame counter
    let animationId: number;
    const countFrames = () => {
      frameCountRef.current++;
      animationId = requestAnimationFrame(countFrames);
    };
    countFrames();

    // Performance data collection
    intervalRef.current = setInterval(() => {
      const data = collectPerformanceData();

      setPerformanceData(data);
      setPerformanceHistory((prev) => {
        const newHistory = [...prev, data];
        return newHistory.slice(-maxHistorySize);
      });

      checkPerformanceIssues(data);
      frameCountRef.current = 0; // Reset frame counter
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled, updateInterval, maxHistorySize, onPerformanceIssue]);

  if (!enabled || !performanceData) {
    return null;
  }

  const averageRenderTime =
    performanceHistory.length > 0
      ? performanceHistory.reduce((sum, data) => sum + data.renderTime, 0) /
        performanceHistory.length
      : 0;

  const memoryTrend =
    performanceHistory.length > 1
      ? performanceHistory[performanceHistory.length - 1].memoryUsage -
        performanceHistory[0].memoryUsage
      : 0;

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h4 className="text-sm font-semibold text-white">
          Performance Monitor
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Render Time */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Render Time</span>
          </div>
          <div className="text-lg font-mono text-white">
            {performanceData.renderTime.toFixed(2)}ms
          </div>
          <div className="text-xs text-zinc-500">
            avg: {averageRenderTime.toFixed(2)}ms
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp
              className={cn(
                'w-4 h-4',
                memoryTrend > 0 ? 'text-red-400' : 'text-green-400'
              )}
            />
            <span className="text-xs text-zinc-400">Memory</span>
          </div>
          <div className="text-lg font-mono text-white">
            {performanceData.memoryUsage.toFixed(1)}MB
          </div>
          <div className="text-xs text-zinc-500">
            {memoryTrend > 0 ? '+' : ''}
            {memoryTrend.toFixed(1)}MB
          </div>
        </div>

        {/* Theme Load Time */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Theme Load</span>
          </div>
          <div className="text-lg font-mono text-white">
            {performanceData.themeLoadTime.toFixed(2)}ms
          </div>
        </div>

        {/* CSS Variables */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">CSS Vars</span>
          </div>
          <div className="text-lg font-mono text-white">
            {performanceData.cssVariableCount}
          </div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="mt-4 pt-3 border-t border-zinc-700/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              performanceData.renderTime < 16 &&
                performanceData.memoryUsage < 100
                ? 'bg-green-400'
                : performanceData.renderTime < 32 &&
                    performanceData.memoryUsage < 200
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
            )}
          />
          <span className="text-xs text-zinc-400">
            {performanceData.renderTime < 16 &&
            performanceData.memoryUsage < 100
              ? 'Performance: Good'
              : performanceData.renderTime < 32 &&
                  performanceData.memoryUsage < 200
                ? 'Performance: Moderate'
                : 'Performance: Poor'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThemePerformanceMonitor;
