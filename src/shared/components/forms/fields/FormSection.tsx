/**
 * FormSection Component - Generic Form Section for Grouping Related Fields
 * Layer 3: Components (UI Building Blocks)
 *
 * CENTRAL: THE form section component for grouping related fields
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Groups and organizes form fields into logical sections
 * - DRY: Eliminates section duplication across all forms
 * - Interface Segregation: Focused interface for section rendering
 * - Open/Closed: Extensible layouts and styling without modification
 * - Composition: Works with any form fields, especially FormField components
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

// Section layout variants
export type SectionLayout = 'stack' | 'grid' | 'inline';

// Section styling variants
export type SectionVariant = 
  | 'default'      // Standard section with border
  | 'card'         // Card-style with background
  | 'glassmorphism' // Premium glass effect
  | 'minimal'      // Clean minimal design
  | 'premium'      // Premium with gradients
  | 'none';        // No styling, just grouping

// Section size variants
export type SectionSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FormSectionProps {
  /** Section content */
  children: React.ReactNode;
  
  /** Section identification */
  title?: string;
  subtitle?: string;
  description?: string;
  
  /** Visual elements */
  icon?: LucideIcon;
  variant?: SectionVariant;
  size?: SectionSize;
  
  /** Layout configuration */
  layout?: SectionLayout;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  
  /** Behavior */
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  
  /** Visibility */
  visible?: boolean;
  required?: boolean;
  
  /** Styling */
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  
  /** Actions */
  actions?: React.ReactNode;
  
  /** Additional props */
  testId?: string;
}

/**
 * Generic FormSection component for organizing form fields into logical groups
 * Works seamlessly with FormField components and any other form elements
 */
export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  subtitle,
  description,
  icon: Icon,
  variant = 'default',
  size = 'md',
  layout = 'stack',
  columns = 2,
  gap = 'md',
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  visible = true,
  required = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  actions,
  testId,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggleCollapse?.();
  };

  if (!visible) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-base font-semibold',
      subtitleSize: 'text-sm',
      iconSize: 'w-4 h-4',
      gap: 'gap-3',
    },
    md: {
      padding: 'p-6',
      titleSize: 'text-lg font-bold',
      subtitleSize: 'text-base',
      iconSize: 'w-5 h-5',
      gap: 'gap-4',
    },
    lg: {
      padding: 'p-8',
      titleSize: 'text-xl font-bold',
      subtitleSize: 'text-lg',
      iconSize: 'w-6 h-6',
      gap: 'gap-6',
    },
    xl: {
      padding: 'p-10',
      titleSize: 'text-2xl font-bold',
      subtitleSize: 'text-xl',
      iconSize: 'w-8 h-8',
      gap: 'gap-8',
    },
  }[size];

  // Layout configurations
  const layoutConfig = {
    stack: 'space-y-4',
    grid: `grid grid-cols-1 md:grid-cols-${columns} ${gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-6' : 'gap-4'}`,
    inline: 'flex flex-wrap gap-4',
  }[layout];

  // Variant configurations
  const variantConfig = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
    card: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md',
    glassmorphism: 'backdrop-blur-xl bg-gradient-to-br from-white/10 via-cyan-500/5 to-purple-500/10 border border-white/20 rounded-2xl shadow-2xl',
    minimal: 'border-b border-gray-200 dark:border-gray-700 pb-6',
    premium: 'bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-cyan-900/95 border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    none: '',
  }[variant];

  // Header component
  const SectionHeader = () => {
    if (!title && !subtitle && !description && !Icon && !actions) {
      return null;
    }

    return (
      <div className={`flex items-start justify-between mb-4 ${headerClassName}`}>
        <div className="flex-1">
          {/* Title row with icon and collapse button */}
          {title && (
            <div className="flex items-center mb-2">
              {Icon && (
                <div className={`${sizeConfig.iconSize} mr-3 text-gray-600 dark:text-gray-400 flex-shrink-0`}>
                  <Icon className="w-full h-full" />
                </div>
              )}
              
              <h3 className={`${sizeConfig.titleSize} text-gray-900 dark:text-gray-100 flex-1`}>
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
              </h3>

              {collapsible && (
                <button
                  type="button"
                  onClick={handleToggle}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className={`${sizeConfig.subtitleSize} text-gray-600 dark:text-gray-400 mb-2`}>
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      data-testid={testId}
      className={`${variantConfig} ${sizeConfig.padding} ${className}`}
    >
      <SectionHeader />
      
      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div className={`${layoutConfig} ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Convenience components for common section types
export const CardFormSection: React.FC<Omit<FormSectionProps, 'variant'>> = (props) => (
  <FormSection {...props} variant="card" />
);

export const MinimalFormSection: React.FC<Omit<FormSectionProps, 'variant'>> = (props) => (
  <FormSection {...props} variant="minimal" />
);

export const PremiumFormSection: React.FC<Omit<FormSectionProps, 'variant'>> = (props) => (
  <FormSection {...props} variant="premium" />
);

export const GlassmorphismFormSection: React.FC<Omit<FormSectionProps, 'variant'>> = (props) => (
  <FormSection {...props} variant="glassmorphism" />
);

export default FormSection;