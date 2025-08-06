/**
 * GlassmorphismHeader Component - LEGACY WRAPPER
 * 
 * MIGRATED to UnifiedHeader system for DRY compliance
 * This component now serves as a backward-compatible wrapper
 * 
 * Following CLAUDE.md principles:
 * - DRY: Eliminates duplicated glassmorphism styling (now in UnifiedHeader)
 * - Single Responsibility: Provides legacy API compatibility
 * - Open/Closed: Maintains existing API while extending through UnifiedHeader
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import UnifiedHeader from './UnifiedHeader';

interface GlassmorphismHeaderProps {
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Main header title */
  title: string;
  /** Descriptive subtitle text */
  description?: string;
  /** Custom className for additional styling */
  className?: string;
  /** Children elements (like action buttons) */
  children?: React.ReactNode;
}

/**
 * @deprecated Use UnifiedHeader with variant="glassmorphism" instead
 * This wrapper is maintained for backward compatibility
 */
const GlassmorphismHeader: React.FC<GlassmorphismHeaderProps> = ({
  icon,
  title,
  description,
  className = '',
  children,
}) => {
  return (
    <UnifiedHeader
      title={title}
      subtitle={description}
      icon={icon}
      variant="glassmorphism"
      size="lg"
      className={className}
    >
      {children}
    </UnifiedHeader>
  );
};

export default GlassmorphismHeader;