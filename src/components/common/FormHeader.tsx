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
import { getHeaderTheme, ThemeColor } from '../../theme/formThemes';

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
  icon: Icon,
  title,
  description,
  primaryColorClass = 'purple',
  className = '',
}) => {
  const theme = getHeaderTheme(primaryColorClass);

  return (
    <div
      className={`bg-gradient-to-r ${theme.background} backdrop-blur-sm border ${theme.border} rounded-3xl p-8 relative ${className}`}
    >
      {/* Top accent border */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.topBorder}`}
      ></div>

      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${theme.overlay}`}
      ></div>

      {/* Content */}
      <div className="flex items-center relative z-10">
        {/* Icon container */}
        <div
          className={`w-14 h-14 bg-gradient-to-br ${theme.iconBackground} rounded-2xl shadow-xl flex items-center justify-center`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Text content */}
        <div className="ml-6">
          <h3
            className={`text-2xl font-bold bg-gradient-to-r ${theme.titleText} bg-clip-text text-transparent mb-2`}
          >
            {title}
          </h3>
          <p className={`${theme.descriptionText} font-medium`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
