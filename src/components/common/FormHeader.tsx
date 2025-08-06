/**
 * FormHeader Component - LEGACY WRAPPER
 * 
 * MIGRATED to UnifiedHeader system for DRY compliance
 * This component now serves as a backward-compatible wrapper
 *
 * Following CLAUDE.md principles + DRY optimization:
 * - DRY: Eliminates repetitive header code (now in UnifiedHeader)
 * - Single Responsibility: Provides legacy API compatibility  
 * - Open/Closed: Maintains existing API while extending through UnifiedHeader
 * - Theme centralization: Uses UnifiedHeader variant system
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ThemeColor } from '../../theme/formThemes';
import UnifiedHeader from './UnifiedHeader';

interface FormHeaderProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main header title */
  title: string;
  /** Descriptive subtitle text */
  description: string;
  /** Primary color theme for gradients */
  primaryColorClass?: ThemeColor;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * @deprecated Use UnifiedHeader with variant="form" instead
 * This wrapper is maintained for backward compatibility
 */
const FormHeader: React.FC<FormHeaderProps> = ({
  icon,
  title,
  description,
  primaryColorClass: _primaryColorClass = 'purple',
  className = '',
}) => {
  return (
    <UnifiedHeader
      title={title}
      subtitle={description}
      icon={icon}
      variant="form"
      size="lg"
      className={className}
    />
  );
};

export default FormHeader;
