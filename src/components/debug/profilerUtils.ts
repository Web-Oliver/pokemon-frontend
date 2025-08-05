/**
 * React Profiler Utility Functions
 * Layer 3: Components (UI Building Blocks) - Utilities
 *
 * Following Context7 + CLAUDE.md principles:
 * - Extracted from ReactProfiler.tsx to satisfy react-refresh/only-export-components
 * - Single Responsibility: Provides utility functions for performance analysis
 * - DRY: Centralized logic for accessing and analyzing profiler data
 */

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

// These are now internal to the profiler system and will be managed within ReactProfiler.tsx
// We export functions to access them, maintaining encapsulation.
let metricsStore = new Map<string, AggregatedMetrics>();
let renderHistory: ProfilerMetrics[] = [];
let webVitals: CoreWebVitals = {};

// This function will be called from within ReactProfiler.tsx to update the store
export const updateMetricsStore = (store: Map<string, AggregatedMetrics>) => {
  metricsStore = store;
};

export const updateRenderHistory = (history: ProfilerMetrics[]) => {
  renderHistory = history;
};

export const updateWebVitals = (vitals: CoreWebVitals) => {
  webVitals = vitals;
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
