/**
 * MIGRATION HELPERS - Phase 1.4
 * Utilities to assist with gradual migration from legacy components to unified components
 * 
 * CRITICAL FEATURES:
 * - Prop mapping functions for different component migrations
 * - Backwards compatibility wrappers
 * - Migration status tracking
 * - Component usage analytics
 */

import { ComponentProps } from 'react';
import { 
  UnifiedButtonProps,
  UnifiedCardProps,
  UnifiedInputProps,
  UnifiedBadgeProps,
  UnifiedModalProps
} from './index';

// =================================
// LEGACY PROP MAPPINGS
// =================================

/**
 * Maps legacy PokemonButton props to UnifiedButton props
 */
export function mapPokemonButtonProps(legacyProps: any): UnifiedButtonProps {
  const {
    pokemon = false,
    cosmic = false,
    theme,
    colorScheme,
    ...rest
  } = legacyProps;

  let variant: UnifiedButtonProps['variant'] = rest.variant || 'default';
  
  // Map legacy Pokemon-specific props
  if (pokemon) variant = 'pokemon';
  if (cosmic) variant = 'cosmic';
  if (colorScheme === 'success') variant = 'success';
  if (colorScheme === 'warning') variant = 'warning';
  if (colorScheme === 'danger') variant = 'danger';

  return {
    ...rest,
    variant,
    motion: cosmic ? 'enhanced' : rest.motion || 'normal'
  };
}

/**
 * Maps legacy PokemonCard props to UnifiedCard props
 */
export function mapPokemonCardProps(legacyProps: any): UnifiedCardProps {
  const {
    pokemon = false,
    cosmic = false,
    glass = false,
    cardType,
    interactive,
    variant: legacyVariant,
    ...rest
  } = legacyProps;

  let variant: UnifiedCardProps['variant'] = legacyVariant || 'default';
  
  // Map legacy Pokemon-specific props
  if (pokemon) variant = 'pokemon';
  if (cosmic) variant = 'cosmic';  
  if (glass) variant = 'glass';
  
  // Map legacy card types
  if (cardType === 'glass') variant = 'glass';
  if (cardType === 'cosmic') variant = 'cosmic';

  return {
    ...rest,
    variant,
    interactive: interactive || rest.onClick || rest.onToggle || rest.onView
  };
}

/**
 * Maps legacy PokemonInput props to UnifiedInput props
 */
export function mapPokemonInputProps(legacyProps: any): UnifiedInputProps {
  const {
    pokemon = false,
    glass = false,
    variant: legacyVariant,
    inputSize,
    ...rest
  } = legacyProps;

  let variant: UnifiedInputProps['variant'] = legacyVariant || 'default';
  
  // Map legacy Pokemon-specific props
  if (pokemon) variant = 'pokemon';
  if (glass) variant = 'glass';

  return {
    ...rest,
    variant,
    size: inputSize || rest.size || 'default'
  };
}

/**
 * Maps legacy PokemonBadge props to UnifiedBadge props
 */
export function mapPokemonBadgeProps(legacyProps: any): UnifiedBadgeProps {
  const {
    pokemon = false,
    cosmic = false,
    outlined = false,
    grade,
    status,
    ...rest
  } = legacyProps;

  let variant: UnifiedBadgeProps['variant'] = rest.variant || 'default';
  
  // Map legacy Pokemon-specific props
  if (pokemon) variant = outlined ? 'pokemonOutline' : 'pokemon';
  if (cosmic) variant = 'cosmic';
  if (status) variant = status;
  
  // Map grade-specific variants
  if (typeof grade === 'number') {
    if (grade <= 3) variant = 'grade1to3';
    else if (grade <= 6) variant = 'grade4to6'; 
    else if (grade <= 8) variant = 'grade7to8';
    else if (grade === 9) variant = 'grade9';
    else if (grade === 10) variant = 'grade10';
  }

  return {
    ...rest,
    variant
  };
}

/**
 * Maps legacy PokemonModal props to UnifiedModal props
 */
export function mapPokemonModalProps(legacyProps: any): UnifiedModalProps {
  const {
    isOpen,
    open,
    onClose,
    closeOnOverlayClick,
    closeOnBackdrop, 
    confirmVariant,
    confirmTitle,
    confirmMessage,
    onConfirm,
    onCancel,
    pokemon = false,
    cosmic = false,
    glass = false,
    ...rest
  } = legacyProps;

  let variant: UnifiedModalProps['variant'] = rest.variant || 'default';
  let type: UnifiedModalProps['type'] = 'default';
  
  // Map legacy Pokemon-specific props
  if (pokemon) variant = 'pokemon';
  if (cosmic) variant = 'cosmic';
  if (glass) variant = 'glass';
  
  // Map confirmation modal props
  if (confirmVariant) {
    type = confirmVariant === 'warning' ? 'alert' : 'confirm';
    variant = confirmVariant === 'danger' ? 'destructive' : 
              confirmVariant === 'warning' ? 'warning' : 'confirm';
  }

  return {
    ...rest,
    variant,
    type,
    open: open !== undefined ? open : isOpen,
    onOpenChange: (newOpen: boolean) => !newOpen && onClose?.(),
    title: confirmTitle || rest.title,
    description: confirmMessage || rest.description,
    onConfirm,
    onCancel,
    closeOnOverlayClick: closeOnBackdrop !== undefined ? closeOnBackdrop : closeOnOverlayClick
  };
}

// =================================
// MIGRATION STATUS TRACKING
// =================================

interface MigrationStatus {
  componentName: string;
  legacyUsageCount: number;
  unifiedUsageCount: number;
  migrationProgress: number; // 0-100%
  lastUpdated: Date;
}

class MigrationTracker {
  private storage: Map<string, MigrationStatus> = new Map();

  recordLegacyUsage(componentName: string) {
    const status = this.getStatus(componentName);
    status.legacyUsageCount++;
    status.migrationProgress = this.calculateProgress(status);
    status.lastUpdated = new Date();
    this.storage.set(componentName, status);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Legacy component usage detected: ${componentName}. Consider migrating to unified component.`);
    }
  }

  recordUnifiedUsage(componentName: string) {
    const status = this.getStatus(componentName);
    status.unifiedUsageCount++;
    status.migrationProgress = this.calculateProgress(status);
    status.lastUpdated = new Date();
    this.storage.set(componentName, status);
  }

  private getStatus(componentName: string): MigrationStatus {
    return this.storage.get(componentName) || {
      componentName,
      legacyUsageCount: 0,
      unifiedUsageCount: 0,
      migrationProgress: 0,
      lastUpdated: new Date()
    };
  }

  private calculateProgress(status: MigrationStatus): number {
    const total = status.legacyUsageCount + status.unifiedUsageCount;
    if (total === 0) return 0;
    return Math.round((status.unifiedUsageCount / total) * 100);
  }

  getMigrationReport(): MigrationStatus[] {
    return Array.from(this.storage.values()).sort((a, b) => 
      b.legacyUsageCount - a.legacyUsageCount
    );
  }

  getOverallProgress(): number {
    const statuses = Array.from(this.storage.values());
    if (statuses.length === 0) return 100;
    
    const totalProgress = statuses.reduce((sum, status) => sum + status.migrationProgress, 0);
    return Math.round(totalProgress / statuses.length);
  }
}

export const migrationTracker = new MigrationTracker();

// =================================
// BACKWARDS COMPATIBILITY WRAPPERS
// =================================

/**
 * Creates a backwards compatible wrapper for legacy components
 */
export function createLegacyWrapper<TLegacyProps, TUnifiedProps>(
  UnifiedComponent: React.ComponentType<TUnifiedProps>,
  propMapper: (legacyProps: TLegacyProps) => TUnifiedProps,
  componentName: string
) {
  return function LegacyWrapper(props: TLegacyProps) {
    // Track legacy usage
    migrationTracker.recordLegacyUsage(componentName);
    
    // Map props and render unified component
    const unifiedProps = propMapper(props);
    return UnifiedComponent(unifiedProps as any);
  };
}

// =================================
// COMPONENT USAGE ANALYTICS
// =================================

interface UsageMetrics {
  componentName: string;
  variantUsage: Record<string, number>;
  propUsage: Record<string, number>;
  totalUsage: number;
  lastUsed: Date;
}

class UsageAnalytics {
  private metrics: Map<string, UsageMetrics> = new Map();

  recordUsage(
    componentName: string, 
    variant?: string, 
    props?: Record<string, any>
  ) {
    const metric = this.getMetric(componentName);
    metric.totalUsage++;
    metric.lastUsed = new Date();

    if (variant) {
      metric.variantUsage[variant] = (metric.variantUsage[variant] || 0) + 1;
    }

    if (props) {
      Object.keys(props).forEach(prop => {
        metric.propUsage[prop] = (metric.propUsage[prop] || 0) + 1;
      });
    }

    this.metrics.set(componentName, metric);
  }

  private getMetric(componentName: string): UsageMetrics {
    return this.metrics.get(componentName) || {
      componentName,
      variantUsage: {},
      propUsage: {},
      totalUsage: 0,
      lastUsed: new Date()
    };
  }

  getPopularVariants(componentName: string, limit: number = 5) {
    const metric = this.metrics.get(componentName);
    if (!metric) return [];

    return Object.entries(metric.variantUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([variant, count]) => ({ variant, count }));
  }

  getUnusedComponents(): string[] {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return Array.from(this.metrics.values())
      .filter(metric => metric.lastUsed < oneWeekAgo || metric.totalUsage === 0)
      .map(metric => metric.componentName);
  }

  generateReport() {
    return {
      migrationProgress: migrationTracker.getOverallProgress(),
      migrationDetails: migrationTracker.getMigrationReport(),
      componentUsage: Array.from(this.metrics.values())
        .sort((a, b) => b.totalUsage - a.totalUsage),
      unusedComponents: this.getUnusedComponents()
    };
  }
}

export const usageAnalytics = new UsageAnalytics();

// =================================
// DEV TOOLS INTEGRATION
// =================================

if (process.env.NODE_ENV === 'development') {
  // Add global methods for debugging migration status
  (globalThis as any).__pokemonUI = {
    getMigrationReport: () => migrationTracker.getMigrationReport(),
    getUsageReport: () => usageAnalytics.generateReport(),
    getOverallProgress: () => migrationTracker.getOverallProgress()
  };

  // Log migration status periodically
  setInterval(() => {
    const progress = migrationTracker.getOverallProgress();
    if (progress < 100) {
      console.info(`🔄 Pokemon UI Migration Progress: ${progress}%`);
    }
  }, 60000); // Every minute
}