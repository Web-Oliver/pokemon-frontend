/**
 * Lazy Search Dropdown - Context7 Bundle Optimization
 *
 * Following Context7 React documentation patterns:
 * - React.lazy for code splitting complex highlighting component
 * - Suspense boundary with loading fallback
 * - Tree-shaking optimization for unused utilities
 * - Performance-first architecture following Context7 best practices
 */

import { lazy, Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy load the complex SearchDropdown component with highlighting
const SearchDropdown = lazy(() => import('./SearchDropdown'));

interface LazySearchDropdownProps {
  suggestions: any[];
  isVisible: boolean;
  activeField: 'set' | 'category' | 'cardProduct' | null;
  onSuggestionSelect: (
    suggestion: any,
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => void;
  onClose: () => void;
  searchTerm: string;
  loading?: boolean;
}

/**
 * Lazy-loaded Search Dropdown with Suspense boundary
 * Only loads complex highlighting logic when needed
 */
const LazySearchDropdown: React.FC<LazySearchDropdownProps> = (props) => {
  // Don't load the component if not visible to save bundle size
  if (!props.isVisible) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/40 rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-3 text-sm text-zinc-300">
                Loading search...
              </span>
            </div>
          </div>
        </div>
      }
    >
      <SearchDropdown {...props} />
    </Suspense>
  );
};

export default LazySearchDropdown;
