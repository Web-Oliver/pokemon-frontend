/**
 * Glow - Reusable glow effect component
 * Eliminates duplicate glow effects across Button and other components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized glow effect styling
 * - Consistent color themes and animations
 * - Reusable across interactive elements
 */

import React from 'react';

interface GlowProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
  className?: string;
}

export const Glow: React.FC<GlowProps> = ({
  variant = 'default',
  className = '',
}) => {
  const glowVariants = {
    primary: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
    secondary: 'from-zinc-500/20 via-zinc-600/20 to-zinc-500/20',
    danger: 'from-red-500/20 via-rose-500/20 to-red-500/20',
    success: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
    default: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
  };

  return (
    <div
      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${glowVariants[variant]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 ${className}`}
    />
  );
};

export default Glow;
