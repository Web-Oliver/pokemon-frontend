/**
 * Loading State Pattern Examples
 * Demonstrates how to replace inconsistent loading patterns with standardized hooks
 * 
 * This file shows before/after examples of loading state consolidation
 * following CLAUDE.md principles and the Loading State Patterns refactoring
 */

import React, { useEffect, useState } from 'react';
import { 
  useLoadingState, 
  useDataLoadingState, 
  useFormLoadingState 
} from '../../hooks/common/useLoadingState';
import { usePageLayout } from '../../hooks/usePageLayout';
import LoadingSpinner from '../molecules/common/LoadingSpinner';

// ============================================================================
// BEFORE: Inconsistent loading patterns (OLD)
// ============================================================================

// Pattern 1: Direct useState (inconsistent with other components)
const OldDirectStateComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Inconsistent conditional rendering
  return (
    <div>
      {loading && <div>Loading...</div>}
      {!loading && !error && data.length > 0 && (
        <div>Data: {JSON.stringify(data)}</div>
      )}
      {!loading && error && <div>Error: {error}</div>}
    </div>
  );
};

// Pattern 2: usePageLayout (inconsistent usage)  
const OldPageLayoutComponent: React.FC = () => {
  const { loading, error, handleAsyncAction } = usePageLayout();

  const fetchData = () => {
    return handleAsyncAction(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  // Complex conditional rendering with loading states
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error occurred</div>;

  return <div>Content loaded</div>;
};

// ============================================================================
// AFTER: Standardized loading patterns (NEW)
// ============================================================================

// Pattern 1: Standardized loading state with useLoadingState
const NewStandardizedComponent: React.FC = () => {
  const loadingState = useLoadingState({
    errorContext: { component: 'NewStandardizedComponent' }
  });
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    await loadingState.withLoading(async () => {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simplified conditional rendering
  if (loadingState.loading) return <LoadingSpinner />;
  if (loadingState.hasError) return <div>Error: {loadingState.error?.message}</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
};

// Pattern 2: Data loading state with useDataLoadingState
const NewDataLoadingComponent: React.FC = () => {
  const dataState = useDataLoadingState<any[]>([]);

  const fetchData = async () => {
    await dataState.withLoadingAndData(
      async () => {
        const response = await fetch('/api/data');
        return response.json();
      },
      {
        updateData: (result) => result, // Direct assignment
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clean conditional rendering
  if (dataState.loading) return <LoadingSpinner />;
  if (dataState.hasError) return <div>Error: {dataState.error?.message}</div>;
  if (!dataState.hasData) return <div>No data available</div>;

  return <div>Data: {JSON.stringify(dataState.data)}</div>;
};

// Pattern 3: Form submission with useFormLoadingState
const NewFormSubmissionComponent: React.FC = () => {
  const formState = useFormLoadingState();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await formState.withFormSubmission(
      async () => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        return response.json();
      },
      {
        onSuccess: () => {
          console.log('Form submitted successfully');
          setFormData({ name: '', email: '' });
        },
        onError: (error) => {
          console.error('Form submission failed:', error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={formState.isSubmitting}
      />
      <input
        type="email" 
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={formState.isSubmitting}
      />
      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      {formState.hasError && (
        <div>Error: {formState.error?.message}</div>
      )}
    </form>
  );
};

// ============================================================================
// COMPARISON SUMMARY
// ============================================================================

/**
 * BENEFITS OF STANDARDIZED LOADING PATTERNS:
 * 
 * 1. CONSISTENCY:
 *    - All components use the same loading interface
 *    - Unified error handling with ApplicationError
 *    - Consistent conditional rendering patterns
 * 
 * 2. DRY COMPLIANCE:
 *    - Eliminates repetitive useState(loading) patterns
 *    - Reduces boilerplate error handling code
 *    - Centralized loading state logic
 * 
 * 3. ENHANCED FUNCTIONALITY:
 *    - Built-in error context and logging
 *    - Race condition prevention
 *    - Specialized variants for different use cases
 * 
 * 4. SIMPLIFIED CONDITIONAL RENDERING:
 *    - Clear loading/error/success states
 *    - Reduced complex conditional logic
 *    - Better developer experience
 * 
 * 5. TYPE SAFETY:
 *    - Full TypeScript support
 *    - Enhanced error types (ApplicationError)
 *    - Better IDE integration
 */

export {
  // Old patterns (for reference only)
  OldDirectStateComponent,
  OldPageLayoutComponent,
  
  // New standardized patterns  
  NewStandardizedComponent,
  NewDataLoadingComponent,
  NewFormSubmissionComponent,
};