/**
 * Performance Integration Utilities
 * Layer 1: Core/Foundation/API Client
 * 
 * Following Context7 + CLAUDE.md principles:
 * - Integrates ReactProfiler with search performance monitoring
 * - Provides unified performance tracking across the application
 * - Combines React render metrics with search/API performance
 */

import { 
  getAggregatedMetrics, 
  getRenderHistory, 
  getWebVitals, 
  analyzeComponentPerformance 
} from '../components/debug/ReactProfiler';
import { searchPerformanceMonitor } from './searchPerformance';
import { getErrorMetrics } from './errorHandler';

export interface UnifiedPerformanceReport {
  timestamp: number;
  reactMetrics: {
    components: Map<string, any>;
    renderHistory: any[];
    totalRenders: number;
    avgRenderTime: number;
    slowestComponent: string | null;
  };
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  };
  searchMetrics: {
    avgResponseTime: number;
    cacheHitRate: number;
    resultsAccuracy: number;
    totalRequests: number;
  };
  errorMetrics: {
    totalErrors: number;
    errorsByComponent: Map<string, number>;
    recentErrors: number;
    errorRate: number;
    mostProblematicComponent: string | null;
  };
  recommendations: string[];
  overallScore: number;
}

/**
 * Context7: Generate comprehensive performance report
 */
export const generatePerformanceReport = (): UnifiedPerformanceReport => {
  // Get React profiling data
  const componentMetrics = getAggregatedMetrics();
  const renderHistory = getRenderHistory();
  const webVitals = getWebVitals();
  
  // Get search performance data
  const searchMetrics = searchPerformanceMonitor.getMetrics();
  
  // Get error tracking data
  const errorData = getErrorMetrics();
  
  // Calculate React metrics summary
  const totalRenders = renderHistory.length;
  const avgRenderTime = renderHistory.length > 0
    ? renderHistory.reduce((sum, render) => sum + render.actualDuration, 0) / renderHistory.length
    : 0;
    
  // Find slowest component
  let slowestComponent: string | null = null;
  let slowestTime = 0;
  
  componentMetrics.forEach((metrics, componentId) => {
    if (metrics.avgActualDuration > slowestTime) {
      slowestTime = metrics.avgActualDuration;
      slowestComponent = componentId;
    }
  });
  
  // Calculate error metrics
  const recentErrors = errorData.errorHistory.filter(
    error => Date.now() - error.timestamp < 300000 // Last 5 minutes
  ).length;
  
  const errorRate = totalRenders > 0 ? (errorData.totalErrors / totalRenders) * 100 : 0;
  
  let mostProblematicComponent: string | null = null;
  let maxErrors = 0;
  
  errorData.errorsByComponent.forEach((errorCount, componentName) => {
    if (errorCount > maxErrors) {
      maxErrors = errorCount;
      mostProblematicComponent = componentName;
    }
  });
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // React performance recommendations
  if (avgRenderTime > 33) {
    recommendations.push('Average render time exceeds 33ms - consider optimizing heavy components');
  }
  
  if (slowestComponent && slowestTime > 50) {
    recommendations.push(`Component "${slowestComponent}" is slow (${slowestTime.toFixed(1)}ms avg) - consider React.memo or optimization`);
  }
  
  // Web Vitals recommendations
  if (webVitals.FCP && webVitals.FCP > 3000) {
    recommendations.push('First Contentful Paint is slow - optimize critical resources');
  }
  
  if (webVitals.LCP && webVitals.LCP > 4000) {
    recommendations.push('Largest Contentful Paint is slow - optimize main content loading');
  }
  
  if (webVitals.CLS && webVitals.CLS > 0.25) {
    recommendations.push('Cumulative Layout Shift is high - stabilize layout during loading');
  }
  
  // Search performance recommendations
  if (searchMetrics.avgResponseTime > 500) {
    recommendations.push('Search response time is slow - consider API optimization or caching');
  }
  
  if (searchMetrics.cacheHitRate < 70) {
    recommendations.push('Low cache hit rate - review caching strategy');
  }
  
  if (searchMetrics.resultsAccuracy < 90) {
    recommendations.push('Search accuracy is below 90% - review search algorithms');
  }
  
  // Error boundary recommendations
  if (errorData.totalErrors > 5) {
    recommendations.push(`High error count (${errorData.totalErrors}) - implement better error handling`);
  }
  
  if (recentErrors > 2) {
    recommendations.push(`Recent errors detected (${recentErrors} in last 5 minutes) - check component stability`);
  }
  
  if (mostProblematicComponent && maxErrors > 2) {
    recommendations.push(`Component "${mostProblematicComponent}" has ${maxErrors} errors - needs error boundary review`);
  }
  
  if (errorRate > 5) {
    recommendations.push(`Error rate is ${errorRate.toFixed(1)}% - consider implementing better error boundaries`);
  }
  
  // Calculate overall performance score (0-100)
  let score = 100;
  
  // React performance penalties
  if (avgRenderTime > 16) score -= Math.min(30, (avgRenderTime - 16) * 2);
  
  // Web Vitals penalties
  if (webVitals.FCP && webVitals.FCP > 1800) score -= Math.min(20, (webVitals.FCP - 1800) / 100);
  if (webVitals.LCP && webVitals.LCP > 2500) score -= Math.min(20, (webVitals.LCP - 2500) / 100);
  if (webVitals.CLS && webVitals.CLS > 0.1) score -= Math.min(15, webVitals.CLS * 100);
  
  // Search performance penalties
  if (searchMetrics.avgResponseTime > 200) score -= Math.min(15, (searchMetrics.avgResponseTime - 200) / 20);
  if (searchMetrics.cacheHitRate < 80) score -= (80 - searchMetrics.cacheHitRate) / 4;
  
  // Error boundary penalties
  if (errorData.totalErrors > 0) score -= Math.min(20, errorData.totalErrors * 2);
  if (errorRate > 1) score -= Math.min(15, errorRate * 3);
  if (recentErrors > 0) score -= Math.min(10, recentErrors * 5);
  
  return {
    timestamp: Date.now(),
    reactMetrics: {
      components: componentMetrics,
      renderHistory,
      totalRenders,
      avgRenderTime,
      slowestComponent,
    },
    webVitals,
    searchMetrics: {
      avgResponseTime: searchMetrics.avgResponseTime,
      cacheHitRate: searchMetrics.cacheHitRate,
      resultsAccuracy: searchMetrics.resultsAccuracy,
      totalRequests: searchMetrics.totalRequests,
    },
    errorMetrics: {
      totalErrors: errorData.totalErrors,
      errorsByComponent: errorData.errorsByComponent,
      recentErrors,
      errorRate,
      mostProblematicComponent,
    },
    recommendations,
    overallScore: Math.max(0, Math.round(score)),
  };
};

/**
 * Context7: Log performance summary to console
 */
export const logPerformanceSummary = (): void => {
  const report = generatePerformanceReport();
  
  console.group('🚀 Context7 Performance Report');
  console.log(`📊 Overall Score: ${report.overallScore}/100`);
  
  console.group('⚛️ React Performance');
  console.log(`Total Renders: ${report.reactMetrics.totalRenders}`);
  console.log(`Average Render Time: ${report.reactMetrics.avgRenderTime.toFixed(2)}ms`);
  if (report.reactMetrics.slowestComponent) {
    console.log(`Slowest Component: ${report.reactMetrics.slowestComponent}`);
  }
  console.groupEnd();
  
  console.group('🌐 Core Web Vitals');
  if (report.webVitals.FCP) console.log(`FCP: ${Math.round(report.webVitals.FCP)}ms`);
  if (report.webVitals.LCP) console.log(`LCP: ${Math.round(report.webVitals.LCP)}ms`);
  if (report.webVitals.FID) console.log(`FID: ${Math.round(report.webVitals.FID)}ms`);
  if (report.webVitals.CLS) console.log(`CLS: ${report.webVitals.CLS.toFixed(3)}`);
  if (report.webVitals.TTFB) console.log(`TTFB: ${Math.round(report.webVitals.TTFB)}ms`);
  console.groupEnd();
  
  console.group('🔍 Search Performance');
  console.log(`Avg Response Time: ${report.searchMetrics.avgResponseTime.toFixed(2)}ms`);
  console.log(`Cache Hit Rate: ${report.searchMetrics.cacheHitRate.toFixed(1)}%`);
  console.log(`Results Accuracy: ${report.searchMetrics.resultsAccuracy.toFixed(1)}%`);
  console.log(`Total Requests: ${report.searchMetrics.totalRequests}`);
  console.groupEnd();
  
  console.group('🚨 Error Tracking');
  console.log(`Total Errors: ${report.errorMetrics.totalErrors}`);
  console.log(`Recent Errors (5min): ${report.errorMetrics.recentErrors}`);
  console.log(`Error Rate: ${report.errorMetrics.errorRate.toFixed(2)}%`);
  if (report.errorMetrics.mostProblematicComponent) {
    const errorCount = report.errorMetrics.errorsByComponent.get(report.errorMetrics.mostProblematicComponent) || 0;
    console.log(`Most Problematic: ${report.errorMetrics.mostProblematicComponent} (${errorCount} errors)`);
  }
  console.groupEnd();
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

/**
 * Context7: Component-specific performance analysis
 */
export const analyzeSpecificComponent = (componentId: string) => {
  const analysis = analyzeComponentPerformance(componentId);
  
  if (!analysis) {
    console.warn(`No performance data found for component: ${componentId}`);
    return null;
  }
  
  console.group(`🔍 Component Analysis: ${componentId}`);
  console.log(`Render Count: ${analysis.renderCount}`);
  console.log(`Average Duration: ${analysis.avgActualDuration.toFixed(2)}ms`);
  console.log(`Optimization Score: ${analysis.optimizationScore.toFixed(1)}%`);
  console.log(`Trend: ${analysis.trend > 0 ? '📈 Getting slower' : analysis.trend < 0 ? '📉 Getting faster' : '➡️ Stable'}`);
  console.log(`Consistency: ${analysis.consistency.toFixed(2)} (lower is better)`);
  
  if (analysis.recommendations.length > 0) {
    console.log('Recommendations:', analysis.recommendations);
  }
  
  console.groupEnd();
  
  return analysis;
};

/**
 * Context7: Global performance monitoring setup
 */
export const setupPerformanceMonitoring = () => {
  // Set up periodic performance logging in development
  if (process.env.NODE_ENV === 'development') {
    // Log performance summary every 30 seconds
    setInterval(() => {
      const report = generatePerformanceReport();
      if (report.reactMetrics.totalRenders > 0 || report.searchMetrics.totalRequests > 0) {
        logPerformanceSummary();
      }
    }, 30000);
    
    // Add keyboard shortcut for manual performance report
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        logPerformanceSummary();
      }
    });
    
    console.log('🚀 Context7 Performance Monitoring Active');
    console.log('📊 Press Ctrl+Shift+R for manual performance report');
    console.log('📈 Ctrl+Shift+P to toggle ReactProfiler overlay');
  }
};

// Context7: Export performance monitoring utilities
export default {
  generatePerformanceReport,
  logPerformanceSummary,
  analyzeSpecificComponent,
  setupPerformanceMonitoring,
};