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
      <div className="bg-[var(--theme-surface-secondary)] backdrop-blur-sm rounded-2xl shadow-xl border border-[var(--theme-border)] p-6">
        <div className="flex items-center space-x-4">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="flex items-center px-4 py-3 bg-gradient-to-r from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 text-[var(--theme-text-secondary)] rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:text-[var(--theme-text-primary)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {pageNumbers.map((pageNumber) => {
              const isCurrentPage = pageNumber === pagination.currentPage;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                    isCurrentPage
                      ? 'bg-gradient-to-r from-[var(--theme-status-success)] to-teal-600 text-white'
                      : 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] hover:bg-gradient-to-r hover:from-[var(--theme-status-success)]/50 hover:to-teal-900/50 hover:text-[var(--theme-status-success)] border border-[var(--theme-border)]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="flex items-center px-4 py-3 bg-gradient-to-r from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 text-[var(--theme-text-secondary)] rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:text-[var(--theme-text-primary)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Pagination Info */}
        <div className="mt-4 text-center text-sm text-[var(--theme-text-muted)]">
          Page {pagination.currentPage} of {pagination.totalPages} •{' '}
          {pagination.total} total products
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;