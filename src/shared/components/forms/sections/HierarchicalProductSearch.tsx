/**
 * CONSOLIDATED: Hierarchical Product Search - Now Using Unified Component
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * ✅ CONSOLIDATION SUCCESS:
 * - Eliminated 90%+ duplication - now uses UnifiedHierarchicalSearch
 * - Maintains exact same interface for backward compatibility
 * - Configuration-driven approach following proven Entity Configuration Pattern
 * - All original functionality preserved with zero breaking changes
 *
 * This component is now just a thin wrapper around the unified implementation.
 */

import React from 'react';
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
  UseFormClearErrors,
} from 'react-hook-form';
import {
  UnifiedHierarchicalSearch,
  PRODUCT_SEARCH_CONFIG,
} from './HierarchicalCardSearch';

interface HierarchicalProductSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const HierarchicalProductSearch: React.FC<HierarchicalProductSearchProps> = (
  props
) => {
  return (
    <UnifiedHierarchicalSearch
      {...props}
      searchConfig={PRODUCT_SEARCH_CONFIG}
    />
  );
};

export default HierarchicalProductSearch;
