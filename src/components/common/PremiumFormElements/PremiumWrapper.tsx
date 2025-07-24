/**
 * PremiumWrapper - Centralized Context7 Premium Form Element Wrapper
 * Eliminates 400+ lines of duplicate styling across Input, Select, Button components
 *
 * Following CLAUDE.md DRY principles:
 * - Single source of truth for premium gradients and effects
 * - Reusable composition pattern for all form elements
 * - Centralized micro-interactions and animations
 */

import React, { ReactNode } from 'react';

interface PremiumWrapperProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
  error?: boolean;
}

export const PremiumWrapper: React.FC<PremiumWrapperProps> = ({
  children,
  fullWidth = false,
  className = '',
  error = false,
}) => {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} group ${className}`}>
      <div className={`relative ${widthClass}`}>
        {/* Context7 Premium Background Gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Premium Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none"></div>

        {/* Error State Glow Override */}
        {error && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none"></div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PremiumWrapper;
