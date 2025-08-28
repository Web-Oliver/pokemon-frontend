/**
 * PaginationControls Component - DRY Violation Fix
 *
 * Reusable pagination controls component extracted from SealedProductSearch.tsx
 * to prevent JSX duplication for pagination UI including Previous/Next buttons and page numbers.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles pagination UI and page navigation logic
 * - DRY: Eliminates repeated pagination JSX structures
 * - Reusability: Can be used across different paginated displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
}

interface PaginationControlsProps {
  /** Pagination data object */
  pagination: PaginationData;
  /** Function to handle page changes */
  onPageChange: (page: number) => void;
  /** Additional CSS classes */
  className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  className = '',
}) => {
  // Don't render if only one page
  if (pagination.totalPages <= 1) {
    return null;
  }

  // Generate page numbers array with smart truncation
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      // Show first 7 pages if current page is near the beginning
      for (let i = 1; i <= 7; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 3) {
      // Show last 7 pages if current page is near the end
      for (let i = totalPages - 6; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show 7 pages centered around current page
      for (let i = currentPage - 3; i <= currentPage + 3; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`mt-12 flex items-center justify-center ${className}`}>
      <div className="bg-gradient-to-br from-zinc-900/95 to-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 border border-cyan-500/20 p-6">
        <div className="flex items-center space-x-4">
          {/* Previous Button */}
          <PokemonButton
            variant="outline"
            size="default"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            startIcon={<ChevronLeft className="w-5 h-5" />}
            className="text-cyan-200 border-cyan-500/30 hover:border-cyan-400/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Previous
          </PokemonButton>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {pageNumbers.map((pageNumber) => {
              const isCurrentPage = pageNumber === pagination.currentPage;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                    isCurrentPage
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/60 shadow-cyan-400/30'
                      : 'bg-zinc-800/90 text-cyan-200 hover:bg-gradient-to-r hover:from-cyan-600/50 hover:to-blue-600/50 hover:text-white border border-cyan-500/30 hover:border-cyan-400/60'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <PokemonButton
            variant="outline"
            size="default"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            endIcon={<ChevronRight className="w-5 h-5" />}
            className="text-cyan-200 border-cyan-500/30 hover:border-cyan-400/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Next
          </PokemonButton>
        </div>

        {/* Pagination Info */}
        <div className="mt-4 text-center text-sm text-cyan-200/80">
          Page {pagination.currentPage} of {pagination.totalPages} •{' '}
          {pagination.total} total products
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
