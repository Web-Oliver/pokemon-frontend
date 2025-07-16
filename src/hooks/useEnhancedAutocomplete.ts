/**
 * Enhanced Autocomplete Hook - Context7 Reusable Implementation
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md DRY and SOLID principles:
 * - Single Responsibility: Only handles autocomplete logic
 * - Open/Closed: Extensible for different autocomplete types
 * - Dependency Inversion: Uses HierarchicalSearchService abstraction
 * - DRY: Reusable across different form contexts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HierarchicalSearchService, 
  HierarchicalSearchConfig, 
  SearchSuggestion, 
  createHierarchicalSearchService 
} from '../services/hierarchicalSearchService';
import { SEARCH_CONFIG } from '../utils/constants';

export interface AutocompleteField {
  id: string;
  value: string;
  placeholder: string;
  type: 'set' | 'category' | 'cardProduct';
  required?: boolean;
  disabled?: boolean;
}

export interface AutocompleteState {
  fields: Record<string, AutocompleteField>;
  suggestions: SearchSuggestion[];
  activeField: string | null;
  isLoading: boolean;
  error: string | null;
  selectedData: any | null;
}

export interface AutocompleteCallbacks {
  onFieldChange: (fieldId: string, value: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion, fieldId: string) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: (fieldId: string) => void;
  onClear: (fieldId: string) => void;
}

export interface UseEnhancedAutocompleteProps {
  config: HierarchicalSearchConfig;
  fields: AutocompleteField[];
  onSelectionChange?: (selectedData: any) => void;
  onError?: (error: string) => void;
}

export interface UseEnhancedAutocompleteReturn {
  state: AutocompleteState;
  callbacks: AutocompleteCallbacks;
  service: HierarchicalSearchService;
}

/**
 * Enhanced Autocomplete Hook - Context7 Implementation
 * Reusable hook for hierarchical autocomplete functionality
 */
export function useEnhancedAutocomplete({
  config,
  fields,
  onSelectionChange,
  onError
}: UseEnhancedAutocompleteProps): UseEnhancedAutocompleteReturn {
  
  console.log('[ENHANCED AUTOCOMPLETE] useEnhancedAutocomplete called with config:', config);
  
  // Create service instance (memoized) - ensure config is properly passed
  const serviceRef = useRef<HierarchicalSearchService>();
  
  if (!serviceRef.current) {
    console.log('[ENHANCED AUTOCOMPLETE] Creating hierarchical search service with config:', config);
    serviceRef.current = createHierarchicalSearchService(config);
  } else {
    // Update existing service config to ensure searchMode is correct
    console.log('[ENHANCED AUTOCOMPLETE] Updating existing service config:', config);
    serviceRef.current.updateConfig(config);
  }
  const service = serviceRef.current;

  // Initialize state
  const [state, setState] = useState<AutocompleteState>(() => ({
    fields: fields.reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {} as Record<string, AutocompleteField>),
    suggestions: [],
    activeField: null,
    isLoading: false,
    error: null,
    selectedData: null
  }));

  // Debounce timer ref
  const debounceRef = useRef<number>();

  /**
   * Handle field value change with debounced suggestions
   */
  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    // Update field value immediately
    setState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: { ...prev.fields[fieldId], value }
      },
      activeField: fieldId
    }));

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounced suggestion fetch
    debounceRef.current = window.setTimeout(async () => {
      const field = state.fields[fieldId];
      const minLength = field.type === 'set' 
        ? SEARCH_CONFIG.SET_MIN_QUERY_LENGTH 
        : field.type === 'cardProduct'
        ? SEARCH_CONFIG.SEALED_PRODUCT_MIN_QUERY_LENGTH
        : config.minQueryLength || SEARCH_CONFIG.DEFAULT_MIN_QUERY_LENGTH;
        
      if (value.trim().length >= minLength) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        try {
          const suggestions = await service.getSuggestions(value, field.type);
          
          setState(prev => ({
            ...prev,
            suggestions,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Search failed';
          setState(prev => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
            suggestions: []
          }));
          onError?.(errorMessage);
        }
      } else {
        setState(prev => ({
          ...prev,
          suggestions: [],
          isLoading: false
        }));
      }
    }, config.debounceMs || SEARCH_CONFIG.DEBOUNCE_MS);
  }, [service, config.debounceMs, onError]);

  /**
   * Handle suggestion selection
   */
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion, fieldId: string) => {
    console.log('[ENHANCED AUTOCOMPLETE] handleSuggestionSelect called with:', {
      suggestion,
      fieldId,
      fieldType: state.fields[fieldId]?.type
    });
    
    // Update field value
    setState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: { ...prev.fields[fieldId], value: suggestion.displayName }
      },
      suggestions: [],
      activeField: null,
      selectedData: suggestion.data
    }));

    // Update service state with hierarchical logic
    const field = state.fields[fieldId];
    const newServiceState = service.handleSuggestionSelect(suggestion, field.type);
    
    console.log('[ENHANCED AUTOCOMPLETE] About to call onSelectionChange with:', suggestion.data);

    // Auto-fill related fields based on hierarchical context
    if (newServiceState.selectedSet) {
      const setField = Object.values(state.fields).find(f => f.type === 'set');
      if (setField) {
        setState(prev => ({
          ...prev,
          fields: {
            ...prev.fields,
            [setField.id]: { ...setField, value: newServiceState.selectedSet! }
          }
        }));
      }
    }

    if (newServiceState.selectedCategory) {
      const categoryField = Object.values(state.fields).find(f => f.type === 'category');
      if (categoryField) {
        setState(prev => ({
          ...prev,
          fields: {
            ...prev.fields,
            [categoryField.id]: { ...categoryField, value: newServiceState.selectedCategory! }
          }
        }));
      }
    }

    // Notify parent of selection
    console.log('[ENHANCED AUTOCOMPLETE] Calling onSelectionChange with:', suggestion.data);
    onSelectionChange?.(suggestion.data);
    console.log('[ENHANCED AUTOCOMPLETE] onSelectionChange called successfully');
  }, [service, state.fields, onSelectionChange]);

  /**
   * Handle field focus
   */
  const handleFieldFocus = useCallback((fieldId: string) => {
    setState(prev => ({ ...prev, activeField: fieldId }));
    
    // Update service state
    const field = state.fields[fieldId];
    service.updateState({ activeField: field.type });
  }, [service, state.fields]);

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback((fieldId: string) => {
    // Delay clearing to allow for suggestion selection
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        activeField: prev.activeField === fieldId ? null : prev.activeField,
        suggestions: prev.activeField === fieldId ? [] : prev.suggestions
      }));
    }, 150);
  }, []);

  /**
   * Clear field and related context
   */
  const handleClear = useCallback((fieldId: string) => {
    const field = state.fields[fieldId];
    
    // Clear field value
    setState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: { ...field, value: '' }
      },
      suggestions: [],
      selectedData: null
    }));

    // Clear service context
    if (field.type === 'set') {
      service.clearContext('set');
    } else if (field.type === 'category') {
      service.clearContext('category');
    }
  }, [service, state.fields]);

  /**
   * Update fields configuration
   */
  const updateFields = useCallback((newFields: AutocompleteField[]) => {
    setState(prev => ({
      ...prev,
      fields: newFields.reduce((acc, field) => {
        acc[field.id] = field;
        return acc;
      }, {} as Record<string, AutocompleteField>)
    }));
  }, []);

  /**
   * Update service configuration
   */
  const updateConfig = useCallback((newConfig: Partial<HierarchicalSearchConfig>) => {
    service.updateConfig(newConfig);
  }, [service]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      service.clearCache();
    };
  }, [service]);

  // Return interface
  return {
    state,
    callbacks: {
      onFieldChange: handleFieldChange,
      onSuggestionSelect: handleSuggestionSelect,
      onFieldFocus: handleFieldFocus,
      onFieldBlur: handleFieldBlur,
      onClear: handleClear
    },
    service
  };
}

/**
 * Factory function for creating autocomplete configurations
 */
export function createAutocompleteConfig(
  searchMode: 'cards' | 'products',
  options?: Partial<HierarchicalSearchConfig>
): HierarchicalSearchConfig {
  return {
    searchMode,
    debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
    cacheEnabled: true,
    maxSuggestions: SEARCH_CONFIG.MAX_SUGGESTIONS,
    minQueryLength: searchMode === 'products' 
      ? SEARCH_CONFIG.SEALED_PRODUCT_MIN_QUERY_LENGTH 
      : SEARCH_CONFIG.CARD_MIN_QUERY_LENGTH,
    ...options
  };
}

/**
 * Pre-configured autocomplete for card searches
 */
export function useCardAutocomplete(
  fields: AutocompleteField[],
  options?: {
    onSelectionChange?: (selectedData: any) => void;
    onError?: (error: string) => void;
  }
): UseEnhancedAutocompleteReturn {
  console.log('[CARD AUTOCOMPLETE] useCardAutocomplete called with options:', options);
  
  return useEnhancedAutocomplete({
    config: createAutocompleteConfig('cards'),
    fields,
    ...options
  });
}

/**
 * Pre-configured autocomplete for product searches
 */
export function useProductAutocomplete(
  fields: AutocompleteField[],
  options?: {
    onSelectionChange?: (selectedData: any) => void;
    onError?: (error: string) => void;
  }
): UseEnhancedAutocompleteReturn {
  return useEnhancedAutocomplete({
    config: createAutocompleteConfig('products'),
    fields,
    ...options
  });
}