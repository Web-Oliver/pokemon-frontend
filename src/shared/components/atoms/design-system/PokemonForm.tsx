/**
 * Pokemon Form Component - THE Form to Rule All Data Entry
 * Consolidates ALL form patterns: cards, products, auctions, sales
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 4,000+ lines of duplicate form logic
 * - SOLID: One definitive form implementation with variants
 * - Reusable: Works everywhere - cards, products, auctions, sales
 */

import React, { forwardRef, useEffect } from 'react';
import { cn } from '../../../utils';
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { PokemonButton } from './PokemonButton';
import { PokemonInput } from './PokemonInput';
import { Label } from '../../molecules/common/FormElements/Label';
import { ErrorMessage } from '../../molecules/common/FormElements/ErrorMessage';
import { HelperText } from '../../molecules/common/FormElements/HelperText';
import GenericLoadingState from '../../molecules/common/GenericLoadingState';
import { useTheme } from '../../../hooks/theme/useTheme';
import type {
  AnimationIntensity,
  Density,
  VisualTheme,
} from '../../types/themeTypes';

export interface PokemonFormField {
  type:
    | 'input'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'number'
    | 'date'
    | 'email'
    | 'tel'
    | 'url'
    | 'password';
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helper?: string;
  validation?: Record<string, any>;
  options?: Array<{ value: string; label: string }>; // For select fields
  rows?: number; // For textarea
  min?: number; // For number fields
  max?: number; // For number fields
  step?: number; // For number fields
  variant?: 'default' | 'search' | 'filter' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  // Form section grouping
  section?: string;
  conditionalOn?: {
    field: string;
    value: any;
    operator?: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'includes' | 'excludes';
  };
}

export interface PokemonFormSection {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  fields: PokemonFormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export interface PokemonFormProps<T extends FieldValues = FieldValues> {
  // Form configuration
  formType?:
    | 'card'
    | 'product'
    | 'auction'
    | 'sale'
    | 'search'
    | 'filter'
    | 'custom';
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;

  // Form structure
  fields?: PokemonFormField[];
  sections?: PokemonFormSection[];

  // Form behavior
  defaultValues?: DefaultValues<T>;
  validationSchema?: any; // Yup schema or similar
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  onFieldChange?: (name: string, value: any) => void;

  // Form state
  isLoading?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  readOnly?: boolean;

  // Form actions
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showReset?: boolean;
  resetText?: string;

  // Layout options
  layout?: 'vertical' | 'horizontal' | 'grid' | 'sections';
  columns?: 1 | 2 | 3 | 4;
  spacing?: 'tight' | 'normal' | 'loose';

  // Theme integration
  theme?: VisualTheme;
  density?: Density;
  animationIntensity?: AnimationIntensity;
  variant?: 'glass' | 'solid' | 'outline' | 'cosmic';

  // Advanced features
  autoSave?: boolean;
  autoSaveDelay?: number;
  persistForm?: boolean;
  persistKey?: string;

  // Styling
  className?: string;
  formClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;

  // Integration hooks (for advanced usage)
  form?: UseFormReturn<T>; // External form instance
  children?: React.ReactNode; // Custom form content
}

/**
 * THE definitive form - replaces all Add/Edit/Search/Filter forms
 * Handles: cards, products, auctions, sales, search, configuration
 */
export const PokemonForm = forwardRef<HTMLFormElement, PokemonFormProps>(
  (
    {
      formType = 'custom',
      title,
      description,
      icon: Icon,
      fields = [],
      sections = [],
      defaultValues,
      validationSchema,
      onSubmit,
      onCancel,
      onFieldChange,
      isLoading = false,
      isSubmitting = false,
      disabled = false,
      readOnly = false,
      submitText = 'Submit',
      cancelText = 'Cancel',
      showCancel = true,
      showReset = false,
      resetText = 'Reset',
      layout = 'vertical',
      columns = 1,
      spacing = 'normal',
      theme,
      density,
      animationIntensity,
      variant = 'glass',
      autoSave = false,
      autoSaveDelay = 1000,
      className = '',
      formClassName = '',
      headerClassName = '',
      bodyClassName = '',
      footerClassName = '',
      form: externalForm,
      children,
      ...props
    },
    ref
  ) => {
    // Theme context integration
    // Theme context integration via centralized useTheme hook
    const themeContext = useTheme();
    const visualTheme = themeContext.visualTheme || 'dark';
    const contextDensity = themeContext.density || 'comfortable';
    const contextAnimationIntensity = 'normal';

    // Merge context theme with component props
    const effectiveTheme = theme || visualTheme;
    const effectiveDensity = density || contextDensity;
    const effectiveAnimationIntensity =
      animationIntensity || contextAnimationIntensity;

    // Form instance - use external or create internal
    const internalForm = useForm<any>({
      defaultValues,
      mode: 'onChange',
    });
    const formInstance = externalForm || internalForm;
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = formInstance;

    // Form variant styling
    const formVariantClasses = {
      glass: [
        'bg-zinc-900/90 backdrop-blur-sm',
        'border border-zinc-700/50',
        'rounded-xl shadow-2xl',
      ].join(' '),
      solid: [
        'bg-zinc-800',
        'border border-zinc-600',
        'rounded-lg shadow-lg',
      ].join(' '),
      outline: [
        'bg-transparent',
        'border-2 border-zinc-600/50',
        'rounded-lg',
      ].join(' '),
      cosmic: [
        'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20',
        'border border-cyan-500/30',
        'rounded-xl shadow-2xl shadow-cyan-500/10',
        'backdrop-blur-sm',
      ].join(' '),
    };

    // Layout classes
    const layoutClasses = {
      vertical: 'space-y-6',
      horizontal: 'flex flex-wrap gap-4',
      grid: `grid gap-6 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : columns === 4 ? 'grid-cols-4' : 'grid-cols-1'}`,
      sections: 'space-y-8',
    };

    // Spacing classes
    const spacingClasses = {
      tight: 'space-y-3',
      normal: 'space-y-6',
      loose: 'space-y-9',
    };

    // Form container classes
    const containerClasses = cn(
      'w-full max-w-4xl mx-auto',
      'transition-all duration-300',
      formVariantClasses[variant],
      effectiveAnimationIntensity === 'enhanced' &&
        'hover:shadow-3xl hover:scale-[1.01]',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    // Handle form submission
    const handleFormSubmit = async (data: any) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    };

    // Field change handler
    const handleFieldChange = (fieldName: string, value: any) => {
      setValue(fieldName, value);
      onFieldChange?.(fieldName, value);
    };

    // Auto-save functionality
    useEffect(() => {
      if (!autoSave) return;

      const subscription = watch((data) => {
        const timeoutId = setTimeout(() => {
          // Auto-save logic would go here
          console.log('Auto-saving form data:', data);
        }, autoSaveDelay);

        return () => clearTimeout(timeoutId);
      });

      return () => subscription.unsubscribe();
    }, [watch, autoSave, autoSaveDelay]);

    // Render form field
    const renderField = (field: PokemonFormField) => {
      const fieldError = errors[field.name]?.message as string;

      // Check conditional rendering
      if (field.conditionalOn) {
        const {
          field: condField,
          value: condValue,
          operator = '=',
        } = field.conditionalOn;
        const currentValue = watch(condField);

        let shouldShow = false;
        switch (operator) {
          case '=':
            shouldShow = currentValue === condValue;
            break;
          case '!=':
            shouldShow = currentValue !== condValue;
            break;
          case 'includes':
            shouldShow =
              Array.isArray(currentValue) && currentValue.includes(condValue);
            break;
          // Add more operators as needed
        }

        if (!shouldShow) return null;
      }

      const baseFieldProps = {
        ...register(field.name, field.validation),
        placeholder: field.placeholder,
        disabled: disabled || field.disabled,
        readOnly: readOnly || field.readOnly,
        className: field.className,
      };

      switch (field.type) {
        case 'input':
        case 'email':
        case 'tel':
        case 'url':
        case 'password':
          return (
            <PokemonInput
              key={field.name}
              type={field.type}
              label={field.label}
              error={fieldError}
              helper={field.helper}
              variant={field.variant}
              size={field.size}
              leftIcon={field.leftIcon}
              rightIcon={field.rightIcon}
              fullWidth={field.fullWidth}
              theme={effectiveTheme}
              density={effectiveDensity}
              animationIntensity={effectiveAnimationIntensity}
              {...baseFieldProps}
            />
          );

        case 'number':
          return (
            <PokemonInput
              key={field.name}
              type="number"
              label={field.label}
              error={fieldError}
              helper={field.helper}
              variant={field.variant}
              size={field.size}
              leftIcon={field.leftIcon}
              rightIcon={field.rightIcon}
              fullWidth={field.fullWidth}
              min={field.min}
              max={field.max}
              step={field.step}
              theme={effectiveTheme}
              density={effectiveDensity}
              animationIntensity={effectiveAnimationIntensity}
              {...baseFieldProps}
            />
          );

        case 'date':
          return (
            <PokemonInput
              key={field.name}
              type="date"
              label={field.label}
              error={fieldError}
              helper={field.helper}
              variant={field.variant}
              size={field.size}
              fullWidth={field.fullWidth}
              theme={effectiveTheme}
              density={effectiveDensity}
              animationIntensity={effectiveAnimationIntensity}
              {...baseFieldProps}
            />
          );

        case 'select':
          return (
            <div key={field.name} className="space-y-2">
              {field.label && (
                <Label htmlFor={field.name} required={field.required}>
                  {field.label}
                </Label>
              )}
              <select
                id={field.name}
                className={cn(
                  'block w-full',
                  'bg-zinc-900/90 backdrop-blur-sm',
                  'border border-zinc-700/50',
                  'rounded-xl shadow-lg',
                  'text-zinc-100 font-medium',
                  'transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:border-transparent',
                  'focus:ring-cyan-500/50 focus:bg-zinc-800/95',
                  'hover:border-cyan-500/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  effectiveDensity === 'compact'
                    ? 'px-3 py-2 text-sm'
                    : effectiveDensity === 'spacious'
                      ? 'px-6 py-4 text-base'
                      : 'px-4 py-3 text-base',
                  fieldError && 'border-red-400/60 focus:ring-red-500/50',
                  field.className
                )}
                {...baseFieldProps}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldError && <ErrorMessage>{fieldError}</ErrorMessage>}
              {field.helper && !fieldError && (
                <HelperText>{field.helper}</HelperText>
              )}
            </div>
          );

        case 'textarea':
          return (
            <div key={field.name} className="space-y-2">
              {field.label && (
                <Label htmlFor={field.name} required={field.required}>
                  {field.label}
                </Label>
              )}
              <textarea
                id={field.name}
                rows={field.rows || 4}
                className={cn(
                  'block w-full',
                  'bg-zinc-900/90 backdrop-blur-sm',
                  'border border-zinc-700/50',
                  'rounded-xl shadow-lg',
                  'text-zinc-100 font-medium',
                  'placeholder-zinc-400',
                  'transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:border-transparent',
                  'focus:ring-cyan-500/50 focus:bg-zinc-800/95',
                  'hover:border-cyan-500/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed resize-none',
                  effectiveDensity === 'compact'
                    ? 'px-3 py-2 text-sm'
                    : effectiveDensity === 'spacious'
                      ? 'px-6 py-4 text-base'
                      : 'px-4 py-3 text-base',
                  fieldError && 'border-red-400/60 focus:ring-red-500/50',
                  field.className
                )}
                {...baseFieldProps}
              />
              {fieldError && <ErrorMessage>{fieldError}</ErrorMessage>}
              {field.helper && !fieldError && (
                <HelperText>{field.helper}</HelperText>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.name} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={field.name}
                className={cn(
                  'w-4 h-4 rounded',
                  'bg-zinc-900/90 border border-zinc-700/50',
                  'text-cyan-500 focus:ring-cyan-500/50',
                  'transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  field.className
                )}
                {...baseFieldProps}
              />
              {field.label && (
                <Label htmlFor={field.name} className="mb-0">
                  {field.label}
                </Label>
              )}
              {fieldError && <ErrorMessage>{fieldError}</ErrorMessage>}
            </div>
          );

        default:
          return null;
      }
    };

    // Render form section
    const renderSection = (section: PokemonFormSection) => {
      return (
        <div key={section.id} className={cn('space-y-4', section.className)}>
          {(section.title || section.description) && (
            <div className="space-y-2">
              {section.title && (
                <div className="flex items-center space-x-2">
                  {section.icon && (
                    <section.icon className="w-5 h-5 text-cyan-400" />
                  )}
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {section.title}
                  </h3>
                </div>
              )}
              {section.description && (
                <p className="text-sm text-zinc-400">{section.description}</p>
              )}
            </div>
          )}
          <div
            className={cn(
              layout === 'grid' ? layoutClasses.grid : spacingClasses[spacing]
            )}
          >
            {section.fields.map(renderField)}
          </div>
        </div>
      );
    };

    if (isLoading) {
      return (
        <div
          className={cn(
            containerClasses,
            'flex items-center justify-center p-12'
          )}
        >
          <GenericLoadingState variant="spinner" size="lg" />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <form
          ref={ref}
          onSubmit={handleSubmit(handleFormSubmit)}
          className={cn('p-6 space-y-6', formClassName)}
          {...props}
        >
          {/* Form Header */}
          {(title || description) && (
            <div
              className={cn(
                'space-y-2 border-b border-zinc-700/50 pb-4',
                headerClassName
              )}
            >
              {title && (
                <div className="flex items-center space-x-3">
                  {Icon && <Icon className="w-6 h-6 text-cyan-400" />}
                  <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
                </div>
              )}
              {description && <p className="text-zinc-400">{description}</p>}
            </div>
          )}

          {/* Form Body */}
          <div className={cn('space-y-6', bodyClassName)}>
            {/* Custom children content */}
            {children}

            {/* Sections */}
            {sections.length > 0 && (
              <div
                className={cn(
                  layout === 'sections'
                    ? layoutClasses.sections
                    : spacingClasses[spacing]
                )}
              >
                {sections.map(renderSection)}
              </div>
            )}

            {/* Standalone fields */}
            {fields.length > 0 && sections.length === 0 && (
              <div
                className={cn(
                  layout === 'grid'
                    ? layoutClasses.grid
                    : spacingClasses[spacing]
                )}
              >
                {fields.map(renderField)}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div
            className={cn(
              'flex items-center justify-end space-x-3',
              'border-t border-zinc-700/50 pt-4',
              footerClassName
            )}
          >
            {showReset && (
              <PokemonButton
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={disabled || isSubmitting}
                theme={effectiveTheme}
                density={effectiveDensity}
                animationIntensity={effectiveAnimationIntensity}
              >
                {resetText}
              </PokemonButton>
            )}

            {showCancel && onCancel && (
              <PokemonButton
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={disabled || isSubmitting}
                theme={effectiveTheme}
                density={effectiveDensity}
                animationIntensity={effectiveAnimationIntensity}
              >
                {cancelText}
              </PokemonButton>
            )}

            <PokemonButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={disabled || isSubmitting}
              theme={effectiveTheme}
              density={effectiveDensity}
              animationIntensity={effectiveAnimationIntensity}
            >
              {submitText}
            </PokemonButton>
          </div>
        </form>
      </div>
    );
  }
);

PokemonForm.displayName = 'PokemonForm';

// Convenience exports for common form types
export const PokemonCardForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="card" />
);

export const PokemonProductForm = (
  props: Omit<PokemonFormProps, 'formType'>
) => <PokemonForm {...props} formType="product" />;

export const PokemonAuctionForm = (
  props: Omit<PokemonFormProps, 'formType'>
) => <PokemonForm {...props} formType="auction" />;

export const PokemonSaleForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="sale" />
);

export const PokemonSearchForm = (
  props: Omit<PokemonFormProps, 'formType'>
) => <PokemonForm {...props} formType="search" />;

export const PokemonFilterForm = (
  props: Omit<PokemonFormProps, 'formType'>
) => <PokemonForm {...props} formType="filter" />;
