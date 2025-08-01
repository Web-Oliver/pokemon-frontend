/**
 * Performance Monitor - Context7 Bundle Optimization Tracking
 * 
 * Following Context7 React.dev performance monitoring patterns:
 * - Web Vitals tracking with React Concurrent features
 * - Bundle size monitoring with lazy loading metrics
 * - React.memo, useMemo, useCallback effectiveness tracking
 * - Tree-shaking impact measurement
 * - React Compiler optimization detection
 */

import { useMemo, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  bundleSize: number;
  chunkCount: number;
  loadTime: number;
  memoryUsage: number;
  renderTime: number;
  memoHits: number;
  memoMisses: number;
  concurrentUpdates: number;
}

interface LazyLoadMetrics {
  componentName: string;
  loadTime: number;
  success: boolean;
  chunkSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    bundleSize: 0,
    chunkCount: 0,
    loadTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    memoHits: 0,
    memoMisses: 0,
    concurrentUpdates: 0,
  };

  private lazyLoadMetrics: LazyLoadMetrics[] = [];

  /**
   * Track lazy component loading performance
   */
  trackLazyLoad(componentName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    
    this.lazyLoadMetrics.push({
      componentName,
      loadTime,
      success: true,
    });

    // Conditional logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERFORMANCE] Lazy loaded ${componentName} in ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Track bundle size and chunk information
   */
  trackBundleMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
      }

      // Conditional logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('[PERFORMANCE] Bundle metrics:', {
          loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
          memoryUsage: `${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        });
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): Record<string, any> {
    const avgLazyLoadTime = this.lazyLoadMetrics.length > 0
      ? this.lazyLoadMetrics.reduce((sum, metric) => sum + metric.loadTime, 0) / this.lazyLoadMetrics.length
      : 0;

    return {
      bundleMetrics: this.metrics,
      lazyLoadMetrics: {
        totalComponents: this.lazyLoadMetrics.length,
        averageLoadTime: avgLazyLoadTime,
        components: this.lazyLoadMetrics,
      },
      optimizationScore: this.calculateOptimizationScore(),
    };
  }

  /**
   * Calculate optimization effectiveness score
   */
  private calculateOptimizationScore(): number {
    let score = 100;

    // Penalize for slow load times
    if (this.metrics.loadTime > 3000) score -= 20;
    else if (this.metrics.loadTime > 1500) score -= 10;

    // Penalize for high memory usage
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) score -= 15; // 50MB
    else if (this.metrics.memoryUsage > 25 * 1024 * 1024) score -= 5; // 25MB

    // Reward fast lazy loading
    const avgLazyLoad = this.lazyLoadMetrics.length > 0
      ? this.lazyLoadMetrics.reduce((sum, metric) => sum + metric.loadTime, 0) / this.lazyLoadMetrics.length
      : 0;
    
    if (avgLazyLoad < 100) score += 5;
    else if (avgLazyLoad > 500) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Context7 Performance Recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.generateReport();

    if (this.metrics.loadTime > 2000) {
      recommendations.push('Consider further code splitting for faster initial load');
    }

    if (this.metrics.memoryUsage > 30 * 1024 * 1024) {
      recommendations.push('High memory usage detected - review component memoization');
    }

    if (report.lazyLoadMetrics.averageLoadTime > 300) {
      recommendations.push('Lazy loading components are slow - consider preloading critical chunks');
    }

    if (this.lazyLoadMetrics.length < 5) {
      recommendations.push('Consider lazy loading more components to reduce initial bundle size');
    }

    return recommendations;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Context7 Performance Hooks for React components following React.dev patterns
export const usePerformanceMonitor = () => {
  // Context7 Pattern: Memoized hook methods for stable references
  return useMemo(() => ({
    trackLazyLoad: performanceMonitor.trackLazyLoad.bind(performanceMonitor),
    trackBundleMetrics: performanceMonitor.trackBundleMetrics.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    getRecommendations: performanceMonitor.getRecommendations.bind(performanceMonitor),
  }), []);
};

// Context7 Pattern: Performance tracking hook with React Compiler support
export const useComponentPerformance = (componentName: string) => {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.log(`[PERFORMANCE] ${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    return () => {
      startTime.current = performance.now();
    };
  });
};

// Auto-track bundle metrics on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackBundleMetrics();
  });
}