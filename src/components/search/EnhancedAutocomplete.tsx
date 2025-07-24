/**
 * Enhanced Autocomplete Component - Context7 Reusable Implementation
 * Layer 3: Components (UI Building Blocks)
 *
 * Following CLAUDE.md DRY and SOLID principles:
 * - Single Responsibility: Only handles autocomplete UI
 * - Open/Closed: Extensible for different autocomplete styles
 * - Dependency Inversion: Uses useEnhancedAutocomplete hook
 * - DRY: Reusable across different form contexts
 */

import React, { forwardRef } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import { useEnhancedAutocomplete } from '../../hooks/useEnhancedAutocomplete';

export interface EnhancedAutocompleteProps {
  config: any;
  fields: any[];
  onSelectionChange?: (selectedData: any) => void;
  onError?: (error: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'premium';
  showMetadata?: boolean;
  allowClear?: boolean;
  maxHeight?: number;
}

/**
 * Enhanced Autocomplete Component
 * Reusable autocomplete component with Context7 design
 */
export const EnhancedAutocomplete = forwardRef<HTMLDivElement, EnhancedAutocompleteProps>(
  (
    {
      config,
      fields,
      onSelectionChange,
      onError,
      className = '',
      disabled = false,
      variant = 'default',
      showMetadata = true,
      allowClear = true,
      maxHeight = 300,
      ..._props
    },
    ref
  ) => {
    const { state, callbacks } = useEnhancedAutocomplete({
      config,
      fields,
      onSelectionChange,
      onError,
    });

    const baseClasses = `
      relative w-full
      ${variant === 'premium' ? 'premium-autocomplete' : ''}
      ${variant === 'compact' ? 'compact-autocomplete' : ''}
      ${className}
    `;

    const inputClasses = `
      w-full px-4 py-3 pr-12
      bg-zinc-900/80 backdrop-blur-xl
      border border-zinc-700/40
      rounded-lg
      text-zinc-100
      placeholder-zinc-400
      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400
      transition-all duration-200
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${variant === 'premium' ? 'backdrop-blur-sm bg-zinc-900/90' : ''}
    `;

    const dropdownClasses = `
      absolute top-full left-0 right-0 z-50 mt-1
      bg-zinc-900/95 backdrop-blur-xl
      border border-zinc-700/40
      rounded-lg shadow-2xl
      overflow-hidden
      ${variant === 'premium' ? 'backdrop-blur-sm bg-zinc-900/95' : ''}
    `;

    const suggestionClasses = `
      px-4 py-3 cursor-pointer
      hover:bg-zinc-800/80 hover:backdrop-blur-xl
      transition-colors duration-150
      border-b border-zinc-700/30 last:border-b-0
    `;

    return (
      <div ref={ref} className={baseClasses}>
        {/* Render fields */}
        {fields.map(field => (
          <div key={field.id} className='relative mb-4 last:mb-0'>
            {/* Field Label */}
            <label htmlFor={field.id} className='block text-sm font-medium text-zinc-300 mb-2'>
              {field.placeholder}
              {field.required && <span className='text-red-500 ml-1'>*</span>}
            </label>

            {/* Input Field */}
            <div className='relative'>
              <input
                id={field.id}
                type='text'
                value={state.fields[field.id]?.value || ''}
                onChange={e => callbacks.onFieldChange(field.id, e.target.value)}
                onFocus={() => callbacks.onFieldFocus(field.id)}
                onBlur={() => callbacks.onFieldBlur(field.id)}
                placeholder={field.placeholder}
                disabled={disabled || field.disabled}
                className={inputClasses}
                autoComplete='off'
              />

              {/* Input Icons */}
              <div className='absolute inset-y-0 right-0 flex items-center pr-3 space-x-2'>
                {/* Clear Button */}
                {allowClear && state.fields[field.id]?.value && (
                  <button
                    type='button'
                    onClick={() => callbacks.onClear(field.id)}
                    className='text-zinc-400 hover:text-zinc-200 transition-colors'
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Loading Indicator */}
                {state.isLoading && state.activeField === field.id && (
                  <div className='animate-spin'>
                    <Search size={16} className='text-zinc-400' />
                  </div>
                )}

                {/* Dropdown Indicator */}
                {!state.isLoading && (
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${
                      state.activeField === field.id ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {state.activeField === field.id && state.suggestions.length > 0 && (
              <div className={dropdownClasses}>
                <div className='overflow-y-auto' style={{ maxHeight: `${maxHeight}px` }}>
                  {/* Suggestions Header */}
                  {showMetadata && (
                    <div className='px-4 py-2 bg-zinc-800/60 backdrop-blur-xl text-sm text-zinc-300 border-b border-zinc-700/30'>
                      <div className='flex items-center space-x-2'>
                        <Search size={14} />
                        <span>
                          {state.suggestions.length} suggestion
                          {state.suggestions.length !== 1 ? 's' : ''} for "
                          {state.fields[field.id]?.value}"
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Suggestions List */}
                  {state.suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id || index}
                      className={suggestionClasses}
                      onClick={() => callbacks.onSuggestionSelect(suggestion, field.id)}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-zinc-100'>{suggestion.displayName}</div>

                          {/* Metadata */}
                          {showMetadata && (
                            <div className='flex items-center space-x-4 mt-1 text-sm text-zinc-400'>
                              {suggestion.metadata.setName && (
                                <span className='flex items-center space-x-1'>
                                  <span>Set:</span>
                                  <span className='font-medium'>{suggestion.metadata.setName}</span>
                                </span>
                              )}
                              {suggestion.metadata.category && (
                                <span className='flex items-center space-x-1'>
                                  <span>Category:</span>
                                  <span className='font-medium'>
                                    {suggestion.metadata.category}
                                  </span>
                                </span>
                              )}
                              {suggestion.metadata.count !== undefined && (
                                <span className='flex items-center space-x-1'>
                                  <span>{suggestion.metadata.count} items</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className='ml-2 text-cyan-400'>
                          <Check size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Keyboard Shortcuts */}
                <div className='px-4 py-2 bg-zinc-800/60 backdrop-blur-xl text-xs text-zinc-400 border-t border-zinc-700/30'>
                  <div className='flex items-center space-x-4'>
                    <span className='flex items-center space-x-1'>
                      <kbd className='px-1.5 py-0.5 bg-zinc-700/80 rounded text-xs'>↑↓</kbd>
                      <span>Navigate</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <kbd className='px-1.5 py-0.5 bg-zinc-700/80 rounded text-xs'>Enter</kbd>
                      <span>Select</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <kbd className='px-1.5 py-0.5 bg-zinc-700/80 rounded text-xs'>Esc</kbd>
                      <span>Close</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {state.error && state.activeField === field.id && (
              <div className='mt-2 text-sm text-red-400'>{state.error}</div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

EnhancedAutocomplete.displayName = 'EnhancedAutocomplete';

/**
 * Premium variant with enhanced styling
 */
export const PremiumAutocomplete = forwardRef<
  HTMLDivElement,
  Omit<EnhancedAutocompleteProps, 'variant'>
>((props, ref) => <EnhancedAutocomplete {...props} ref={ref} variant='premium' />);

PremiumAutocomplete.displayName = 'PremiumAutocomplete';

/**
 * Compact variant for space-constrained layouts
 */
export const CompactAutocomplete = forwardRef<
  HTMLDivElement,
  Omit<EnhancedAutocompleteProps, 'variant'>
>((props, ref) => <EnhancedAutocomplete {...props} ref={ref} variant='compact' />);

CompactAutocomplete.displayName = 'CompactAutocomplete';
