/**
 * PremiumGlow - Reusable glow effect component
 * Eliminates duplicate glow effects across Button and other components
 * 
 * Following CLAUDE.md DRY principles:
 * - Centralized glow effect styling
 * - Consistent color themes and animations
 * - Reusable across interactive elements
 */

import React from 'react';

interface PremiumGlowProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
  className?: string;
}

export const PremiumGlow: React.FC<PremiumGlowProps> = ({
  variant = 'default',
  className = '',
}) => {
  const glowVariants = {
    primary: 'from-indigo-500/20 via-purple-500/20 to-blue-500/20',
    secondary: 'from-slate-500/20 via-gray-500/20 to-slate-500/20',
    danger: 'from-red-500/20 via-rose-500/20 to-red-500/20',
    success: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
    default: 'from-indigo-500/20 via-purple-500/20 to-blue-500/20',
  };

  return (
    <div 
      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${glowVariants[variant]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 ${className}`} 
    />
  );
};

export default PremiumGlow;