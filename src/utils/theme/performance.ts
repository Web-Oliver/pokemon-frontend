/**
 * Theme Performance Utilities
 * Split from themeDebug.ts for better maintainability
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Performance monitoring only
 * - DRY: Centralized performance logic
 */

import { VisualTheme } from '../../types/themeTypes';

export interface ThemePerformanceMetrics {
  cssPropertiesCount: number;
  themeClassesCount: number;
  loadTimeMs: number;
  memoryUsageMB: number;
  lastSwitchDuration: number;
  totalSwitches: number;
  averageSwitchTime: number;
  bundleSizeImpact: number;
  renderImpactScore: number;
}

// Performance tracking state
let performanceData = {
  themeSwitches: [] as number[],
  totalSwitches: 0,
  loadStartTime: Date.now(),
};

/**
 * Track theme switch performance
 */
export function trackThemeSwitch(startTime: number, endTime: number): void {
  const duration = endTime - startTime;
  performanceData.themeSwitches.push(duration);
  performanceData.totalSwitches++;

  // Keep only last 10 measurements for average calculation
  if (performanceData.themeSwitches.length > 10) {
    performanceData.themeSwitches.shift();
  }

  // Store performance data in sessionStorage for debugging
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('theme-performance', JSON.stringify({
        duration,
        timestamp: Date.now(),
        totalSwitches: performanceData.totalSwitches,
      }));
    } catch (error) {
      // Silently handle storage errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to store theme performance data:', error);
      }
    }
  }
}

/**
 * Get current theme performance metrics
 */
export function getThemePerformanceMetrics(): ThemePerformanceMetrics {
  const currentTime = Date.now();
  const loadTime = currentTime - performanceData.loadStartTime;
  
  const averageSwitchTime = performanceData.themeSwitches.length > 0
    ? performanceData.themeSwitches.reduce((sum, time) => sum + time, 0) / performanceData.themeSwitches.length
    : 0;

  const lastSwitchDuration = performanceData.themeSwitches.length > 0
    ? performanceData.themeSwitches[performanceData.themeSwitches.length - 1]
    : 0;

  // Estimate metrics (would need real implementation in production)
  const cssPropertiesCount = typeof window !== 'undefined' 
    ? document.documentElement.style.length 
    : 0;

  const themeClassesCount = typeof window !== 'undefined'
    ? Array.from(document.documentElement.classList).filter(cls => cls.includes('theme')).length
    : 0;

  return {
    cssPropertiesCount,
    themeClassesCount,
    loadTimeMs: loadTime,
    memoryUsageMB: 0, // Would need performance.memory API
    lastSwitchDuration,
    totalSwitches: performanceData.totalSwitches,
    averageSwitchTime,
    bundleSizeImpact: 0, // Would need bundle analysis
    renderImpactScore: averageSwitchTime > 100 ? 1 : 0, // Simple scoring
  };
}

/**
 * Benchmark theme switching performance
 */
export async function benchmarkThemeSwitch(
  newTheme: VisualTheme,
  onThemeChange: (theme: VisualTheme) => void
): Promise<number> {
  const startTime = performance.now();
  
  onThemeChange(newTheme);
  
  // Wait for next frame to ensure DOM updates
  await new Promise((resolve) => requestAnimationFrame(resolve));
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Theme switch to ${newTheme} took ${duration.toFixed(2)}ms`);
  }
  
  trackThemeSwitch(startTime, endTime);
  
  return duration;
}

/**
 * Check if theme has potential performance issues
 */
export function checkThemePerformance(): {
  hasIssues: boolean;
  issues: string[];
  suggestions: string[];
} {
  const metrics = getThemePerformanceMetrics();
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (metrics.averageSwitchTime > 100) {
    issues.push('Theme switching is slow (>100ms average)');
    suggestions.push('Consider reducing CSS complexity or using CSS custom properties');
  }

  if (metrics.cssPropertiesCount > 100) {
    issues.push('Too many CSS custom properties defined');
    suggestions.push('Review and consolidate CSS custom properties');
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    suggestions,
  };
}