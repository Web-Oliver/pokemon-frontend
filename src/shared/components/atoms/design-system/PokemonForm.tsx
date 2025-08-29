import React, { forwardRef, useEffect } from 'react';
import { cn } from "@/lib/utils"
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/primitives/Form';
import { PokemonButton } from './PokemonButton';
import { PokemonInput } from './PokemonInput';
import { Label } from '../../../ui/primitives/Label';
import GenericLoadingState from '../../molecules/common/GenericLoadingState';
import { useTheme } from '../../../../theme';
import { useFormErrorHandler } from '@/shared/hooks/error/useErrorHandler';
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
    const themeContext = useTheme();
    
    // Centralized error handling
    const errorHandler = useFormErrorHandler('POKEMON_FORM');

    // Form instance - use external or create internal
    const internalForm = useForm<any>({
      defaultValues,
      mode: 'onChange',
    });
    const formInstance = externalForm || internalForm;
    const { handleSubmit, watch, reset } = formInstance;

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

    // Form container classes with Pokemon theming
    const containerClasses = cn(
      'w-full max-w-4xl mx-auto',
      'bg-gradient-to-br from-zinc-900/95 to-slate-900/95',
      'backdrop-blur-xl border border-cyan-500/20',
      'rounded-2xl shadow-2xl shadow-cyan-500/10',
      'text-zinc-100 p-6',
      'transition-all duration-300',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    // Handle form submission with centralized error handling
    const handleFormSubmit = async (data: any) => {
      const submitOperation = async () => {
        await onSubmit(data);
        return data;
      };

      await errorHandler.createAsyncErrorHandler(
        submitOperation,
        {
          context: 'FORM_SUBMISSION',
          severity: 'medium',
          toastMessage: 'Form submission failed. Please try again.',
        }
      )();
    };

    // Auto-save functionality with centralized error handling
    useEffect(() => {
      if (!autoSave) return;

      const subscription = watch((data) => {
        const timeoutId = setTimeout(async () => {
          const autoSaveOperation = async () => {
            // Auto-save logic would go here
            return data;
          };

          await errorHandler.createAsyncErrorHandler(
            autoSaveOperation,
            {
              context: 'AUTO_SAVE',
              severity: 'low',
              showToast: false, // Don't show toast for auto-save errors
            }
          )();
        }, autoSaveDelay);

        return () => clearTimeout(timeoutId);
      });

      return () => subscription.unsubscribe();
    }, [watch, autoSave, autoSaveDelay, errorHandler]);

    // Render form field
    const renderField = (field: PokemonFormField) => {
      // Check conditional rendering
      if (field.conditionalOn) {
        const { field: condField, value: condValue, operator = '=' } = field.conditionalOn;
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
            shouldShow = Array.isArray(currentValue) && currentValue.includes(condValue);
            break;
        }

        if (!shouldShow) return null;
      }

      return (
        <FormField
          key={field.name}
          control={formInstance.control}
          name={field.name}
          render={({ field: fieldProps }) => (
            <FormItem>
              {field.label && (
                <FormLabel className="text-zinc-200">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </FormLabel>
              )}
              <FormControl>
                {field.type === 'select' ? (
                  <select
                    {...fieldProps}
                    className={cn(
                      'block w-full bg-zinc-900/90 backdrop-blur-sm',
                      'border border-zinc-700/50 rounded-xl shadow-lg',
                      'text-zinc-100 font-medium px-4 py-3',
                      'transition-all duration-300',
                      'focus:outline-none focus:ring-2 focus:border-transparent',
                      'focus:ring-cyan-500/50 focus:bg-zinc-800/95',
                      'hover:border-cyan-500/40',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      field.className
                    )}
                    disabled={disabled || field.disabled}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    {...fieldProps}
                    rows={field.rows || 4}
                    placeholder={field.placeholder}
                    className={cn(
                      'block w-full bg-zinc-900/90 backdrop-blur-sm',
                      'border border-zinc-700/50 rounded-xl shadow-lg',
                      'text-zinc-100 font-medium px-4 py-3',
                      'placeholder-zinc-400 resize-none',
                      'transition-all duration-300',
                      'focus:outline-none focus:ring-2 focus:border-transparent',
                      'focus:ring-cyan-500/50 focus:bg-zinc-800/95',
                      'hover:border-cyan-500/40',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      field.className
                    )}
                    disabled={disabled || field.disabled}
                    readOnly={readOnly || field.readOnly}
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      {...fieldProps}
                      type="checkbox"
                      className={cn(
                        'w-4 h-4 rounded bg-zinc-900/90',
                        'border border-zinc-700/50 text-cyan-500',
                        'focus:ring-cyan-500/50 transition-all duration-300',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        field.className
                      )}
                      disabled={disabled || field.disabled}
                    />
                    {field.label && <Label className="mb-0 text-zinc-200">{field.label}</Label>}
                  </div>
                ) : (
                  <PokemonInput
                    {...fieldProps}
                    type={field.type}
                    placeholder={field.placeholder}
                    variant={field.variant}
                    inputSize={field.size}
                    leftIcon={field.leftIcon}
                    rightIcon={field.rightIcon}
                    fullWidth={field.fullWidth}
                    disabled={disabled || field.disabled}
                    readOnly={readOnly || field.readOnly}
                    className={field.className}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                  />
                )}
              </FormControl>
              {field.helper && <FormDescription className="text-zinc-400">{field.helper}</FormDescription>}
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      );
    };

    // Render form section
    const renderSection = (section: PokemonFormSection) => {
      return (
        <div key={section.id} className={cn('space-y-4', section.className)}>
          {(section.title || section.description) && (
            <div className="space-y-2">
              {section.title && (
                <div className="flex items-center space-x-2">
                  {section.icon && <section.icon className="w-5 h-5 text-cyan-400" />}
                  <h3 className="text-lg font-semibold text-zinc-100">{section.title}</h3>
                </div>
              )}
              {section.description && (
                <p className="text-sm text-zinc-400">{section.description}</p>
              )}
            </div>
          )}
          <div className={cn(layout === 'grid' ? layoutClasses.grid : spacingClasses[spacing])}>
            {section.fields.map(renderField)}
          </div>
        </div>
      );
    };

    if (isLoading) {
      return (
        <div className={cn(containerClasses, 'flex items-center justify-center p-12')}>
          <GenericLoadingState variant="spinner" size="lg" />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <Form {...formInstance}>
          <form
            ref={ref}
            onSubmit={handleSubmit(handleFormSubmit)}
            className={cn('space-y-6', formClassName)}
            {...props}
          >
            {/* Form Header */}
            {(title || description) && (
              <div className={cn('space-y-2 border-b border-zinc-700/50 pb-4', headerClassName)}>
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
                <div className={cn(layout === 'sections' ? layoutClasses.sections : spacingClasses[spacing])}>
                  {sections.map(renderSection)}
                </div>
              )}

              {/* Standalone fields */}
              {fields.length > 0 && sections.length === 0 && (
                <div className={cn(layout === 'grid' ? layoutClasses.grid : spacingClasses[spacing])}>
                  {fields.map(renderField)}
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className={cn('flex items-center justify-end space-x-3', 'border-t border-zinc-700/50 pt-4', footerClassName)}>
              {showReset && (
                <PokemonButton
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={disabled || isSubmitting}
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
                >
                  {cancelText}
                </PokemonButton>
              )}

              <PokemonButton
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={disabled || isSubmitting}
              >
                {submitText}
              </PokemonButton>
            </div>
          </form>
        </Form>
      </div>
    );
  }
);

PokemonForm.displayName = 'PokemonForm';

// Convenience exports for common form types
export const PokemonCardForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="card" />
);

export const PokemonProductForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="product" />
);

export const PokemonAuctionForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="auction" />
);

export const PokemonSaleForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="sale" />
);

export const PokemonSearchForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="search" />
);

export const PokemonFilterForm = (props: Omit<PokemonFormProps, 'formType'>) => (
  <PokemonForm {...props} formType="filter" />
);