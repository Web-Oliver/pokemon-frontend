/**
 * Glow - Reusable glow effect component
 * Eliminates duplicate glow effects across Button and other components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized glow effect styling
 * - Consistent color themes and animations
 * - Reusable across interactive elements
 * - Theme-aware glow effects and intensity
 */

import React from 'react';
import { useCentralizedTheme } from '../../../../utils/ui/themeConfig';

interface GlowProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
  className?: string;
}

export const Glow: React.FC<GlowProps> = ({
  variant = 'default',
  className = '',
}) => {
  const themeConfig = useCentralizedTheme();

  // Theme-aware glow variants
  const getGlowVariant = (variantType: string) => {
    const baseVariants = {
      primary:
        themeConfig.isDarkMode
          ? 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20'
          : `from-${themeConfig.primaryColor || 'cyan'}-500/20 via-blue-500/20 to-${themeConfig.primaryColor || 'cyan'}-500/20`,
      secondary: 'from-zinc-500/20 via-zinc-600/20 to-zinc-500/20',
      danger: 'from-red-500/20 via-rose-500/20 to-red-500/20',
      success: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
      default:
        themeConfig.isDarkMode
          ? 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20'
          : `from-${themeConfig.primaryColor || 'cyan'}-500/20 via-blue-500/20 to-${themeConfig.primaryColor || 'cyan'}-500/20`,
    };
    return baseVariants[variantType] || baseVariants.default;
  };

  // Animation duration and blur intensity based on theme
  const animationDuration = themeConfig.reducedMotion
    ? '0s'
    : 'var(--animation-duration-normal, 0.3s)';
  const blurIntensity = `blur(${Math.max(4, themeConfig.glassmorphismIntensity / 20)}px)`;

  return (
    <div
      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getGlowVariant(variant)} opacity-0 group-hover:opacity-100 transition-opacity -z-10 ${className} ${themeConfig.animationIntensity === 'disabled' ? '!opacity-0' : ''}`}
      style={{
        '--glow-duration': animationDuration,
        '--glow-blur': blurIntensity,
        transitionDuration: 'var(--glow-duration)',
        filter: 'var(--glow-blur)',
      }}
    />
  );
};

export default Glow;
