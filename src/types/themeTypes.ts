/**
 * Standardized Theme-Aware Component Types
 * Phase 1.2.1: Component Architecture Foundation
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Defines consistent prop interfaces
 * - Open/Closed: Extensible for new component types
 * - Interface Segregation: Specific interfaces for different component needs
 * - DRY: Single source of truth for component prop patterns
 *
 * Integrates with:
 * - ThemeContext.tsx for theme configuration
 * - formThemes.ts for color scheme support
 * - pokemon-design-system.css for styling tokens
 */

import { ReactNode } from 'react';
import { ThemeColor } from '../theme/formThemes';

// Theme types moved here to prevent circular dependencies
export type VisualTheme =
  | 'context7-premium'
  | 'context7-futuristic'
  | 'dba-cosmic'
  | 'minimal';

export type ColorScheme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type AnimationIntensity = 'subtle' | 'normal' | 'enhanced' | 'disabled';

// Theme configuration interface
export interface ThemeConfiguration {
  // Visual Theme Settings
  visualTheme: VisualTheme;
  colorScheme: ColorScheme;
  density: Density;
  animationIntensity: AnimationIntensity;

  // Color Configuration
  primaryColor: ThemeColor;

  // Accessibility Settings
  highContrast: boolean;
  reducedMotion: boolean;

  // Advanced Settings
  glassmorphismIntensity: number; // 0-100
  particleEffectsEnabled: boolean;
  customCSSProperties?: Record<string, string>;
}

// Theme preset interface
export interface ThemePreset {
  id: VisualTheme;
  name: string;
  description: string;
  config: Partial<ThemeConfiguration>;
  preview: {
    gradient: string;
    backgroundColor: string;
    textColor: string;
  };
}

// ================================
// BASE COMPONENT INTERFACES
// ================================

/**
 * Base theme-aware component properties
 * Common props that all theme-aware components should support
 */
export interface BaseThemeProps {
  /** Visual theme variant (overrides context theme) */
  theme?: VisualTheme;
  /** Color scheme (overrides context color scheme) */
  colorScheme?: ThemeColor;
  /** Component density (overrides context density) */
  density?: Density;
  /** Animation intensity (overrides context setting) */
  animationIntensity?: AnimationIntensity;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing frameworks */
  testId?: string;
}

/**
 * Sizing standardization across all components
 * Consistent size variants following Context7 design patterns
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component variant patterns
 * Standardized styling variants across the design system
 */
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'glass'
  | 'minimal';

/**
 * Loading state configuration
 * Standardized loading state management
 */
export interface LoadingProps {
  /** Loading state */
  loading?: boolean;
  /** Loading text override */
  loadingText?: string;
  /** Custom loading indicator */
  loadingIndicator?: ReactNode;
}

/**
 * Icon positioning for components with icon support
 */
export type IconPosition = 'start' | 'end' | 'both';

/**
 * Component state indicators
 */
export type ComponentState =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'error';

// ================================
// INTERACTIVE COMPONENT INTERFACES
// ================================

/**
 * Button component standardized props
 * Extends base theme props with button-specific configuration
 */
export interface StandardButtonProps extends BaseThemeProps, LoadingProps {
  /** Button content */
  children: ReactNode;
  /** Visual variant */
  variant?: ComponentVariant;
  /** Button size */
  size?: ComponentSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Start icon */
  startIcon?: ReactNode;
  /** End icon */
  endIcon?: ReactNode;
  /** Icon position when both icons present */
  iconPosition?: IconPosition;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Input component standardized props
 * Extends base theme props with form input configuration
 */
export interface StandardInputProps extends BaseThemeProps {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Input size */
  size?: ComponentSize;
  /** Full width input */
  fullWidth?: boolean;
  /** Start icon */
  startIcon?: ReactNode;
  /** End icon */
  endIcon?: ReactNode;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Select component standardized props
 */
export interface StandardSelectProps extends BaseThemeProps {
  /** Options for the select */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Select label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Selected value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Select size */
  size?: ComponentSize;
  /** Full width select */
  fullWidth?: boolean;
  /** Multiple selection */
  multiple?: boolean;
  /** Search/filter capability */
  searchable?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (value: string | string[]) => void;
}

// ================================
// LAYOUT COMPONENT INTERFACES
// ================================

/**
 * Card component standardized props
 */
export interface StandardCardProps extends BaseThemeProps {
  /** Card content */
  children: ReactNode;
  /** Visual variant */
  variant?: ComponentVariant;
  /** Card size/padding */
  size?: ComponentSize;
  /** Card elevation/shadow intensity */
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Interactive card (hover effects) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
}

/**
 * Modal component standardized props
 */
export interface StandardModalProps extends BaseThemeProps {
  /** Modal content */
  children: ReactNode;
  /** Modal open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: ComponentSize | 'fullscreen';
  /** Center modal content */
  centered?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
}

// ================================
// FEEDBACK COMPONENT INTERFACES
// ================================

/**
 * Badge component standardized props
 */
export interface StandardBadgeProps extends BaseThemeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: ComponentVariant;
  /** Badge size */
  size?: ComponentSize;
  /** Rounded badge */
  rounded?: boolean;
  /** Dot indicator instead of content */
  dot?: boolean;
}

/**
 * Alert component standardized props
 */
export interface StandardAlertProps extends BaseThemeProps {
  /** Alert content */
  children: ReactNode;
  /** Alert type */
  variant?: 'success' | 'warning' | 'danger' | 'info';
  /** Alert title */
  title?: string;
  /** Dismissible alert */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Start icon */
  icon?: ReactNode;
}

// ================================
// UTILITY TYPES
// ================================

/**
 * Theme override configuration
 * Allows components to override specific theme aspects
 */
export interface ThemeOverride {
  /** Override primary color */
  primaryColor?: string;
  /** Override background color */
  backgroundColor?: string;
  /** Override border color */
  borderColor?: string;
  /** Override text color */
  textColor?: string;
  /** Override shadow */
  boxShadow?: string;
  /** Override border radius */
  borderRadius?: string;
}

/**
 * Component style configuration
 * Advanced styling configuration for theme-aware components
 */
export interface ComponentStyleConfig {
  /** Base component styles */
  base?: string;
  /** Variant-specific styles */
  variants?: Record<ComponentVariant, string>;
  /** Size-specific styles */
  sizes?: Record<ComponentSize, string>;
  /** State-specific styles */
  states?: Record<ComponentState, string>;
  /** Theme overrides */
  themeOverrides?: Partial<Record<VisualTheme, ThemeOverride>>;
}

/**
 * Animation configuration for components
 */
export interface ComponentAnimationConfig {
  /** Entry animation */
  enter?: string;
  /** Exit animation */
  exit?: string;
  /** Hover animation */
  hover?: string;
  /** Focus animation */
  focus?: string;
  /** Active animation */
  active?: string;
  /** Duration override */
  duration?: number;
  /** Easing override */
  easing?: string;
  /** Disable animations */
  disabled?: boolean;
}

// ================================
// COMPOSITION INTERFACES
// ================================

/**
 * Compound component props for complex components
 */
export interface CompoundComponentProps {
  /** Component composition children */
  children: ReactNode;
  /** Pass theme props to children */
  passThemeProps?: boolean;
  /** Component spacing */
  gap?: ComponentSize;
  /** Component direction */
  direction?: 'row' | 'column';
  /** Component alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Component justification */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

/**
 * Polymorphic component props for flexible HTML element rendering
 */
export interface PolymorphicProps<T extends React.ElementType = 'div'> {
  /** HTML element or React component to render as */
  as?: T;
}

/**
 * Form component integration props
 */
export interface FormIntegrationProps {
  /** Form field name */
  name?: string;
  /** Form field ID */
  id?: string;
  /** Form validation */
  validate?: (value: any) => string | undefined;
  /** Form dirty state */
  isDirty?: boolean;
  /** Form touched state */
  isTouched?: boolean;
  /** Form submitted state */
  isSubmitted?: boolean;
}

// ================================
// EXPORT CONSOLIDATED INTERFACES
// ================================

/**
 * Complete standardized component props
 * Union of all standardized component interfaces
 */
export type StandardComponentProps =
  | StandardButtonProps
  | StandardInputProps
  | StandardSelectProps
  | StandardCardProps
  | StandardModalProps
  | StandardBadgeProps
  | StandardAlertProps;

/**
 * Theme-aware component configuration
 * Complete configuration object for theme-aware components
 */
export interface ThemeAwareComponentConfig {
  /** Base theme properties */
  theme: BaseThemeProps;
  /** Style configuration */
  styles: ComponentStyleConfig;
  /** Animation configuration */
  animations: ComponentAnimationConfig;
  /** Form integration */
  form?: FormIntegrationProps;
  /** Compound component configuration */
  compound?: CompoundComponentProps;
}

export default {
  BaseThemeProps,
  StandardButtonProps,
  StandardInputProps,
  StandardSelectProps,
  StandardCardProps,
  StandardModalProps,
  StandardBadgeProps,
  StandardAlertProps,
  ComponentStyleConfig,
  ComponentAnimationConfig,
  ThemeAwareComponentConfig,
};
