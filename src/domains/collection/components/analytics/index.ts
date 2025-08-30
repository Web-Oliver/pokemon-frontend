/**
 * Analytics Components - Barrel Exports
 *
 * Following CLAUDE.md principles:
 * - Clean imports for consuming components
 * - Single entry point for analytics components
 */

export { default as AnalyticsBackground } from './AnalyticsBackground';
export { default as AnalyticsHeader } from './AnalyticsHeader';
export { default as ActivityTimeline } from './ActivityTimeline';
export { default as CategoryStats } from './CategoryStats';
export { default as MetricCard } from './MetricCard';
export { default as MetricsGrid } from './MetricsGrid';

// Re-export types
export type { AnalyticsBackgroundProps } from './AnalyticsBackground';
export type { AnalyticsHeaderProps } from './AnalyticsHeader';
export type { ActivityTimelineProps } from './ActivityTimeline';
export type { CategoryStatsProps } from './CategoryStats';
export type { MetricCardProps } from './MetricCard';
export type { MetricsGridProps } from './MetricsGrid';
