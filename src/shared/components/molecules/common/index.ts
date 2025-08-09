/**
 * Common Components Index - Unified Export System
 *
 * Following CLAUDE.md principles:
 * - DRY: Centralized exports eliminate import path duplication
 * - Single Responsibility: Each export serves one clear purpose
 * - Reusability: Makes components easily accessible across the app
 */

// NEW: Unified Component System (recommended)
export { default as UnifiedHeader } from './UnifiedHeader';
export type { HeaderVariant, HeaderStat, HeaderAction } from './UnifiedHeader';
export { default as SectionContainer } from './SectionContainer';
export type {
  CardVariant,
  CardSize,
  CardBadge,
  CardAction,
} from './SectionContainer';
export { default as UnifiedGradeDisplay } from './UnifiedGradeDisplay';
export type {
  GradeDisplayMode,
  GradeDisplayTheme,
} from './UnifiedGradeDisplay';

// Foundation Components
export { default as BaseCard } from './BaseCard';
export type { BaseCardProps } from './BaseCard';
export { default as BaseListItem } from './BaseListItem';
export type { BaseListItemProps } from './BaseListItem';

// LEGACY: Headers consolidated into UnifiedHeader (FormHeader and GlassmorphismHeader removed)

// Other common components
export { default as EmptyState } from './EmptyState';
export { default as FormActionButtons } from './FormActionButtons';
export { Glow, Shimmer } from './FormElements';
