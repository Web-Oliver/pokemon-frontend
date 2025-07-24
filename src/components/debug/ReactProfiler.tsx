/**
 * React Profiler Integration Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Following Context7 + CLAUDE.md principles:
 * - React.Profiler integration for programmatic performance measurement
 * - Core Web Vitals tracking and reporting
 * - Performance aggregation and analysis
 * - Development-only profiling with production opt-in capability
 */

import React, {
  Profiler,
  ProfilerOnRenderCallback,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Activity, BarChart3, Clock, Zap, AlertTriangle } from 'lucide-react';

// Context7: Performance metrics interfaces
interface ProfilerMetrics {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

interface AggregatedMetrics {
  componentId: string;
  renderCount: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  avgActualDuration: number;
  avgBaseDuration: number;
  mountTime: number;
  lastUpdateTime: number;
  slowestRender: number;
  fastestRender: number;
  optimizationScore: number; // Context7: actualDuration / baseDuration ratio
}

interface CoreWebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

interface ReactProfilerProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
  onRenderThreshold?: number; // Context7: Log only renders above this duration (ms)
  aggregateMetrics?: boolean;
  enableWebVitals?: boolean;
  className?: string;
}

// Context7: Global metrics store for performance aggregation
const metricsStore = new Map<string, AggregatedMetrics>();
const renderHistory: ProfilerMetrics[] = [];
const MAX_HISTORY_SIZE = 1000;

// Context7: Core Web Vitals tracking
let webVitals: CoreWebVitals = {};

export const ReactProfiler: React.FC<ReactProfilerProps> = ({
  id,
  children,
  enabled = process.env.NODE_ENV === 'development',
  onRenderThreshold = 16, // Context7: 60fps threshold
  aggregateMetrics = true,
  enableWebVitals = true,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [webVitalsData, setWebVitalsData] = useState<CoreWebVitals>({});
  const [isVisible, setIsVisible] = useState(false);
  const mountTimeRef = useRef<number>(performance.now());
  const lastUpdateRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Context7: Enhanced onRender callback with aggregation and analysis
  const onRenderCallback: ProfilerOnRenderCallback = useCallback(
    (
      profileId: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number,
      interactions?: any
    ) => {
      // Context7: Store individual render metrics
      const renderMetric: ProfilerMetrics = {
        id: profileId,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: interactions || [],
      };

      // Add to history with size limit
      renderHistory.push(renderMetric);
      if (renderHistory.length > MAX_HISTORY_SIZE) {
        renderHistory.shift();
      }

      // Context7: Log slow renders above threshold
      if (actualDuration > onRenderThreshold) {
        console.warn(`[PROFILER] Slow render detected in ${profileId}:`, {
          phase,
          actualDuration: `${actualDuration.toFixed(2)}ms`,
          baseDuration: `${baseDuration.toFixed(2)}ms`,
          optimization: `${((1 - actualDuration / baseDuration) * 100).toFixed(1)}%`,
          timestamp: new Date(startTime).toISOString(),
        });
      }

      // Context7: Update aggregated metrics
      if (aggregateMetrics) {
        const existing = metricsStore.get(profileId);
        const isMount = phase === 'mount';

        const updated: AggregatedMetrics = {
          componentId: profileId,
          renderCount: (existing?.renderCount || 0) + 1,
          totalActualDuration:
            (existing?.totalActualDuration || 0) + actualDuration,
          totalBaseDuration: (existing?.totalBaseDuration || 0) + baseDuration,
          avgActualDuration: 0, // Will be calculated below
          avgBaseDuration: 0, // Will be calculated below
          mountTime: existing?.mountTime || (isMount ? actualDuration : 0),
          lastUpdateTime: isMount
            ? existing?.lastUpdateTime || 0
            : actualDuration,
          slowestRender: Math.max(existing?.slowestRender || 0, actualDuration),
          fastestRender: existing?.fastestRender
            ? Math.min(existing.fastestRender, actualDuration)
            : actualDuration,
          optimizationScore: 0, // Will be calculated below
        };

        // Calculate averages and optimization score
        updated.avgActualDuration =
          updated.totalActualDuration / updated.renderCount;
        updated.avgBaseDuration =
          updated.totalBaseDuration / updated.renderCount;
        updated.optimizationScore =
          updated.avgBaseDuration > 0
            ? (1 - updated.avgActualDuration / updated.avgBaseDuration) * 100
            : 100;

        metricsStore.set(profileId, updated);

        // Update local state with proper throttling to prevent infinite re-renders
        if (profileId === id) {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateRef.current;

          // Throttle updates to at most once every 100ms
          if (timeSinceLastUpdate > 100) {
            lastUpdateRef.current = now;

            // Clear any pending timeout
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }

            // Use setTimeout to defer the state update and break the render cycle
            updateTimeoutRef.current = setTimeout(() => {
              setMetrics((prevMetrics) => {
                // Only update if the data has actually changed meaningfully
                if (
                  !prevMetrics ||
                  prevMetrics.renderCount !== updated.renderCount ||
                  Math.abs(
                    prevMetrics.avgActualDuration - updated.avgActualDuration
                  ) > 0.5
                ) {
                  return updated;
                }
                return prevMetrics;
              });
            }, 0);
          } else {
            // If we're within the throttle window, schedule an update for later
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }

            updateTimeoutRef.current = setTimeout(() => {
              lastUpdateRef.current = Date.now();
              setMetrics(updated);
            }, 100 - timeSinceLastUpdate);
          }
        }
      }
    },
    [id, onRenderThreshold, aggregateMetrics]
  );

  // Context7: Core Web Vitals tracking using PerformanceObserver
  useEffect(() => {
    if (!enableWebVitals || typeof window === 'undefined') {
      return;
    }

    const updateWebVitals = (vital: Partial<CoreWebVitals>) => {
      webVitals = { ...webVitals, ...vital };
      setWebVitalsData({ ...webVitals });
    };

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === 'first-contentful-paint'
      );
      if (fcpEntry) {
        updateWebVitals({ FCP: fcpEntry.startTime });
      }
    });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1]; // Latest LCP
      if (lcpEntry) {
        updateWebVitals({ LCP: lcpEntry.startTime });
      }
    });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          updateWebVitals({ FID: fid });
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let cls = webVitals.CLS || 0;
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      });
      updateWebVitals({ CLS: cls });
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // TTFB from navigation timing
      const navEntry = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navEntry) {
        updateWebVitals({
          TTFB: navEntry.responseStart - navEntry.requestStart,
        });
      }
    } catch (error) {
      console.warn('[PROFILER] PerformanceObserver not supported:', error);
    }

    return () => {
      try {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [enableWebVitals]);

  // Context7: Toggle visibility for development debugging
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  // Context7: Performance status assessment
  const getPerformanceStatus = () => {
    if (!metrics) {
      return { color: 'text-gray-400', icon: Clock, label: 'Initializing' };
    }

    const avgRender = metrics.avgActualDuration;
    if (avgRender < 8) {
      return { color: 'text-green-400', icon: Zap, label: 'Excellent' };
    }
    if (avgRender < 16) {
      return { color: 'text-blue-400', icon: Activity, label: 'Good' };
    }
    if (avgRender < 33) {
      return { color: 'text-yellow-400', icon: BarChart3, label: 'Fair' };
    }
    return { color: 'text-red-400', icon: AlertTriangle, label: 'Poor' };
  };

  const status = getPerformanceStatus();
  const StatusIcon = status.icon;

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}

      {/* Context7: Development Performance Overlay */}
      {isVisible && metrics && (
        <div
          className={`fixed bottom-4 left-4 z-50 bg-black/90 backdrop-blur-sm text-white rounded-lg p-4 text-xs font-mono space-y-3 max-w-sm border border-gray-600 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-600 pb-2">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
              <span className="font-bold">{id}</span>
            </div>
            <span className={`text-xs ${status.color} font-semibold`}>
              {status.label}
            </span>
          </div>

          {/* Render Metrics */}
          <div className="space-y-2">
            <div className="text-gray-300 dark:text-zinc-700 font-semibold text-xs border-b border-gray-700 pb-1">
              Render Performance
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Renders:</span>
                <span className="font-bold text-blue-300">
                  {metrics.renderCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Avg time:</span>
                <span className={`font-bold ${status.color}`}>
                  {metrics.avgActualDuration.toFixed(1)}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span>Fastest:</span>
                <span className="font-bold text-green-400">
                  {metrics.fastestRender.toFixed(1)}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span>Slowest:</span>
                <span className="font-bold text-red-400">
                  {metrics.slowestRender.toFixed(1)}ms
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Optimization:</span>
              <span
                className={`font-bold ${metrics.optimizationScore > 80 ? 'text-green-400' : metrics.optimizationScore > 60 ? 'text-yellow-400' : 'text-red-400'}`}
              >
                {metrics.optimizationScore.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Core Web Vitals */}
          {enableWebVitals && Object.keys(webVitalsData).length > 0 && (
            <div className="space-y-2">
              <div className="text-gray-300 dark:text-zinc-700 font-semibold text-xs border-b border-gray-700 pb-1">
                Core Web Vitals
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {webVitalsData.FCP && (
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <span
                      className={`font-bold ${webVitalsData.FCP < 1800 ? 'text-green-400' : webVitalsData.FCP < 3000 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {Math.round(webVitalsData.FCP)}ms
                    </span>
                  </div>
                )}

                {webVitalsData.LCP && (
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span
                      className={`font-bold ${webVitalsData.LCP < 2500 ? 'text-green-400' : webVitalsData.LCP < 4000 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {Math.round(webVitalsData.LCP)}ms
                    </span>
                  </div>
                )}

                {webVitalsData.FID !== undefined && (
                  <div className="flex justify-between">
                    <span>FID:</span>
                    <span
                      className={`font-bold ${webVitalsData.FID < 100 ? 'text-green-400' : webVitalsData.FID < 300 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {Math.round(webVitalsData.FID)}ms
                    </span>
                  </div>
                )}

                {webVitalsData.CLS !== undefined && (
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span
                      className={`font-bold ${webVitalsData.CLS < 0.1 ? 'text-green-400' : webVitalsData.CLS < 0.25 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {webVitalsData.CLS.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="border-t border-gray-600 pt-2 text-xs text-gray-400 dark:text-zinc-600 dark:text-zinc-500">
            <div>Ctrl+Shift+P to toggle</div>
            <div>
              Uptime:{' '}
              {((performance.now() - mountTimeRef.current) / 1000).toFixed(1)}s
            </div>
          </div>
        </div>
      )}
    </Profiler>
  );
};

// Context7: Export utility functions for advanced profiling
export const getAggregatedMetrics = (): Map<string, AggregatedMetrics> => {
  return new Map(metricsStore);
};

export const getRenderHistory = (): ProfilerMetrics[] => {
  return [...renderHistory];
};

export const getWebVitals = (): CoreWebVitals => {
  return { ...webVitals };
};

export const clearMetrics = (): void => {
  metricsStore.clear();
  renderHistory.length = 0;
  webVitals = {};
};

// Context7: Performance analysis utilities
export const analyzeComponentPerformance = (componentId: string) => {
  const metrics = metricsStore.get(componentId);
  if (!metrics) {
    return null;
  }

  const componentHistory = renderHistory.filter((r) => r.id === componentId);
  const recentRenders = componentHistory.slice(-10);

  return {
    ...metrics,
    trend:
      recentRenders.length > 1
        ? recentRenders[recentRenders.length - 1].actualDuration -
          recentRenders[0].actualDuration
        : 0,
    consistency:
      recentRenders.length > 0
        ? (metrics.slowestRender - metrics.fastestRender) /
          metrics.avgActualDuration
        : 0,
    recommendations: generateRecommendations(metrics),
  };
};

const generateRecommendations = (metrics: AggregatedMetrics): string[] => {
  const recommendations: string[] = [];

  if (metrics.optimizationScore < 70) {
    recommendations.push('Consider using React.memo() for this component');
  }

  if (metrics.avgActualDuration > 33) {
    recommendations.push(
      'Component renders are slow, check for expensive calculations'
    );
  }

  if (
    metrics.renderCount > 20 &&
    metrics.lastUpdateTime > metrics.mountTime * 2
  ) {
    recommendations.push(
      'Frequent re-renders detected, optimize state management'
    );
  }

  return recommendations;
};

export default ReactProfiler;
