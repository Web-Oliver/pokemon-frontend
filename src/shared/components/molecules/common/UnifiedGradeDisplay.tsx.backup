/**
 * Unified Grade Display Component - PSA Grade Breakdown
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates repeated PSA grade display patterns
 * - SRP: Single responsibility for PSA grade visualization
 * - Reusable: Works across forms, cards, and analytics
 * - Open/Closed: Extensible through props
 *
 * Consolidates grade display patterns from:
 * - CardInformationFields (8 occurrences)
 * - Analytics grade charts
 * - Collection item displays
 */

import React from 'react';
import { IGrades } from '../../domain/models/card';

// Display modes for different contexts
export type GradeDisplayMode =
  | 'full' // Complete 1-10 breakdown with totals
  | 'compact' // Simplified display with highlights
  | 'summary' // Total only with key metrics
  | 'chart' // Optimized for chart/analytics display
  | 'inline'; // Horizontal compact display

// Visual themes for different contexts
export type GradeDisplayTheme =
  | 'default' // Standard colors
  | 'vibrant' // High contrast colors
  | 'minimal' // Subtle grays
  | 'premium' // Premium gradient styling
  | 'analytics'; // Optimized for data visualization

export interface UnifiedGradeDisplayProps {
  /** PSA grade data to display */
  grades: IGrades;

  /** Display mode */
  mode?: GradeDisplayMode;

  /** Visual theme */
  theme?: GradeDisplayTheme;

  /** Show individual grade labels */
  showLabels?: boolean;

  /** Show total graded count */
  showTotal?: boolean;

  /** Highlight specific grade (for analytics) */
  highlightGrade?: number;

  /** Custom title */
  title?: string;

  /** Custom className */
  className?: string;

  /** Click handler for individual grades */
  onGradeClick?: (grade: number, count: number) => void;

  /** Loading state */
  loading?: boolean;
}

const UnifiedGradeDisplay: React.FC<UnifiedGradeDisplayProps> = ({
  grades,
  mode = 'full',
  theme = 'default',
  showLabels = true,
  showTotal = true,
  highlightGrade,
  title = 'PSA Population Breakdown',
  className = '',
  onGradeClick,
  loading = false,
}) => {
  // Grade color mapping based on theme
  const getGradeColors = (grade: number, gradeTheme: GradeDisplayTheme) => {
    const colorMaps = {
      default: {
        1: 'text-red-600 dark:text-red-400',
        2: 'text-red-500 dark:text-red-400',
        3: 'text-orange-600 dark:text-orange-400',
        4: 'text-orange-500 dark:text-orange-400',
        5: 'text-yellow-600 dark:text-yellow-400',
        6: 'text-yellow-500 dark:text-yellow-400',
        7: 'text-lime-600 dark:text-lime-400',
        8: 'text-green-600 dark:text-green-400',
        9: 'text-blue-600 dark:text-blue-400',
        10: 'text-purple-600 dark:text-purple-400',
      },
      vibrant: {
        1: 'text-red-700 dark:text-red-300 font-bold',
        2: 'text-red-600 dark:text-red-300 font-bold',
        3: 'text-orange-700 dark:text-orange-300 font-bold',
        4: 'text-orange-600 dark:text-orange-300 font-bold',
        5: 'text-yellow-700 dark:text-yellow-300 font-bold',
        6: 'text-yellow-600 dark:text-yellow-300 font-bold',
        7: 'text-lime-700 dark:text-lime-300 font-bold',
        8: 'text-green-700 dark:text-green-300 font-bold',
        9: 'text-blue-700 dark:text-blue-300 font-bold',
        10: 'text-purple-700 dark:text-purple-300 font-bold',
      },
      minimal: {
        1: 'text-zinc-600 dark:text-zinc-400',
        2: 'text-zinc-600 dark:text-zinc-400',
        3: 'text-zinc-600 dark:text-zinc-400',
        4: 'text-zinc-600 dark:text-zinc-400',
        5: 'text-zinc-600 dark:text-zinc-400',
        6: 'text-zinc-600 dark:text-zinc-400',
        7: 'text-zinc-600 dark:text-zinc-400',
        8: 'text-zinc-600 dark:text-zinc-400',
        9: 'text-zinc-600 dark:text-zinc-400',
        10: 'text-zinc-600 dark:text-zinc-400',
      },
      premium: {
        1: 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded px-2',
        2: 'text-red-500 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded px-2',
        3: 'text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded px-2',
        4: 'text-orange-500 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded px-2',
        5: 'text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded px-2',
        6: 'text-yellow-500 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded px-2',
        7: 'text-lime-600 dark:text-lime-300 bg-lime-50 dark:bg-lime-900/20 rounded px-2',
        8: 'text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded px-2',
        9: 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded px-2',
        10: 'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded px-2',
      },
      analytics: {
        1: 'text-red-500',
        2: 'text-red-400',
        3: 'text-orange-500',
        4: 'text-orange-400',
        5: 'text-yellow-500',
        6: 'text-yellow-400',
        7: 'text-lime-500',
        8: 'text-green-500',
        9: 'text-blue-500',
        10: 'text-purple-500',
      },
    };

    return (
      colorMaps[gradeTheme][grade as keyof (typeof colorMaps)[gradeTheme]] ||
      'text-zinc-500'
    );
  };

  // Get grade value with proper handling
  const getGradeValue = (grade: number): number => {
    const gradeKey = `grade_${grade}` as keyof IGrades;
    return grades[gradeKey] || 0;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-zinc-700 h-4 w-1/3 mb-2 rounded"></div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-zinc-700 h-12 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Summary mode - total only
  if (mode === 'summary') {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-gray-600 dark:text-zinc-400 font-medium text-sm">
          Total PSA Graded
        </div>
        <div className="font-bold text-lg text-blue-800 dark:text-blue-300">
          {grades.grade_total?.toLocaleString() || '0'}
        </div>
      </div>
    );
  }

  // Inline mode - horizontal compact
  if (mode === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-xs ${className}`}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => {
          const count = getGradeValue(grade);
          if (count === 0) return null;

          return (
            <span
              key={grade}
              className={`px-2 py-1 rounded ${getGradeColors(grade, theme)} ${
                onGradeClick ? 'cursor-pointer hover:opacity-75' : ''
              } ${highlightGrade === grade ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => onGradeClick?.(grade, count)}
            >
              PSA {grade}: {count.toLocaleString()}
            </span>
          );
        })}
        {showTotal && (
          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
            Total: {grades.grade_total?.toLocaleString() || '0'}
          </span>
        )}
      </div>
    );
  }

  // Compact mode - key highlights only
  if (mode === 'compact') {
    const topGrades = Array.from({ length: 10 }, (_, i) => i + 1)
      .map((grade) => ({ grade, count: getGradeValue(grade) }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Top PSA Grades
          </h4>
          {showTotal && (
            <span className="text-xs text-gray-600 dark:text-zinc-400">
              Total: {grades.grade_total?.toLocaleString() || '0'}
            </span>
          )}
        </div>
        <div className="flex space-x-4">
          {topGrades.map(({ grade, count }) => (
            <div key={grade} className="text-center">
              <div className="text-gray-600 dark:text-zinc-400 font-medium text-xs">
                PSA {grade}
              </div>
              <div className={`font-semibold ${getGradeColors(grade, theme)}`}>
                {count.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full mode - complete breakdown (default)
  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-xl p-4 border border-blue-200/50 dark:border-zinc-700/50">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {title}
        </h4>

        {/* PSA 1-5 */}
        <div className="grid grid-cols-5 gap-2 text-xs">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((grade) => (
            <div
              key={grade}
              className={`text-center ${onGradeClick ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-700 rounded p-1' : ''} ${
                highlightGrade === grade ? 'ring-2 ring-blue-400 rounded' : ''
              }`}
              onClick={() => onGradeClick?.(grade, getGradeValue(grade))}
            >
              {showLabels && (
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA {grade}
                </div>
              )}
              <div className={`font-semibold ${getGradeColors(grade, theme)}`}>
                {getGradeValue(grade).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* PSA 6-10 */}
        <div className="grid grid-cols-5 gap-2 text-xs mt-2">
          {Array.from({ length: 5 }, (_, i) => i + 6).map((grade) => (
            <div
              key={grade}
              className={`text-center ${onGradeClick ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-700 rounded p-1' : ''} ${
                highlightGrade === grade ? 'ring-2 ring-blue-400 rounded' : ''
              }`}
              onClick={() => onGradeClick?.(grade, getGradeValue(grade))}
            >
              {showLabels && (
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA {grade}
                </div>
              )}
              <div className={`font-semibold ${getGradeColors(grade, theme)}`}>
                {getGradeValue(grade).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        {showTotal && (
          <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-zinc-700/50">
            <div className="text-center">
              <div className="text-gray-600 dark:text-zinc-400 font-medium text-sm">
                Total Graded
              </div>
              <div className="font-bold text-lg text-blue-800 dark:text-blue-300">
                {grades.grade_total?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedGradeDisplay;
