/**
 * FormHeader Component
 * Reusable form header with premium gradient design and theming
 *
 * Following CLAUDE.md principles + DRY optimization:
 * - Single Responsibility: Handles only form header presentation
 * - Open/Closed: Extensible through theme configuration
 * - DRY: Eliminates repetitive header code across forms + uses centralized themes
 * - Theme centralization: Uses formThemes system to eliminate duplication
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ThemeColor } from '../../theme/formThemes';
import GlassmorphismHeader from './GlassmorphismHeader';

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

// Theme configuration now centralized in formThemes system

const FormHeader: React.FC<FormHeaderProps> = ({
  icon,
  title,
  description,
  primaryColorClass: _primaryColorClass = 'purple',
  className = '',
}) => {
  return (
    <GlassmorphismHeader
      icon={icon}
      title={title}
      description={description}
      className={className}
    />
  );
};

export default FormHeader;
