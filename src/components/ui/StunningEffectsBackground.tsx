/**
 * STUNNING EFFECTS BACKGROUND 2025
 * Integrated with existing UnifiedEffectSystem
 * 
 * Features:
 * - Liquid glass effects with Apple Vision Pro inspiration
 * - Pokemon holographic effects
 * - Cosmic aurora animations
 * - Ethereal dream particles
 * - Full integration with theme system
 * - Performance optimized
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { isStunningTheme } from '../../theme/themeSystem';
import { UnifiedEffectSystem } from '../organisms/effects/UnifiedEffectSystem';

interface StunningEffectsBackgroundProps {
  /** Override automatic theme detection */
  forceStunningEffects?: boolean;
  
  /** Intensity level */
  intensity?: 'subtle' | 'medium' | 'intense' | 'maximum';
  
  /** Animation speed */
  animationSpeed?: 'slow' | 'normal' | 'fast' | 'static';
  
  /** Particle count */
  particleCount?: 'few' | 'normal' | 'many' | 'maximum';
  
  /** Custom features */
  features?: {
    blur?: boolean;
    glow?: boolean;
    shimmer?: boolean;
    pulse?: boolean;
    float?: boolean;
    liquidGlass?: boolean;
    holographic?: boolean;
    aurora?: boolean;
    particles?: boolean;
  };
  
  /** Overlay opacity */
  opacity?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Children to render over the effects */
  children?: React.ReactNode;
}

const StunningEffectsBackground: React.FC<StunningEffectsBackgroundProps> = ({
  forceStunningEffects = false,
  intensity = 'medium',
  animationSpeed = 'normal',
  particleCount = 'normal',
  features = {},
  opacity = 0.6,
  className = '',
  children,
}) => {
  const { settings, resolvedTheme } = useTheme();
  
  // Determine if we should use stunning effects
  const shouldUseStunningEffects = forceStunningEffects || isStunningTheme(resolvedTheme);
  
  // Get the appropriate effect type based on theme
  const getEffectTypeForTheme = useMemo(() => {
    if (!shouldUseStunningEffects) {
      return 'cosmic'; // Fallback to existing effect
    }
    
    switch (resolvedTheme) {
      case 'liquid-glass':
        return 'quantum';
      case 'holo-collection':
        return 'holographic';
      case 'cosmic-aurora':
        return 'aurora';
      case 'ethereal-dream':
        return 'cosmic';
      default:
        return 'holographic';
    }
  }, [resolvedTheme, shouldUseStunningEffects]);
  
  // Enhanced features based on theme
  const getEnhancedFeatures = useMemo(() => {
    if (!shouldUseStunningEffects) {
      return features;
    }
    
    const baseFeatures = {
      blur: true,
      glow: true,
      shimmer: true,
      pulse: true,
      float: true,
      ...features,
    };
    
    switch (resolvedTheme) {
      case 'liquid-glass':
        return {
          ...baseFeatures,
          liquidGlass: true,
          shimmer: true,
        };
      case 'holo-collection':
        return {
          ...baseFeatures,
          holographic: true,
          shimmer: true,
          glow: true,
        };
      case 'cosmic-aurora':
        return {
          ...baseFeatures,
          aurora: true,
          pulse: true,
          float: true,
        };
      case 'ethereal-dream':
        return {
          ...baseFeatures,
          particles: true,
          pulse: true,
          glow: true,
        };
      default:
        return baseFeatures;
    }
  }, [resolvedTheme, shouldUseStunningEffects, features]);
  
  // Get color scheme based on theme
  const getColorScheme = useMemo(() => {
    switch (resolvedTheme) {
      case 'liquid-glass':
        return 'primary';
      case 'holo-collection':
        return 'cosmic';
      case 'cosmic-aurora':
        return 'neural';
      case 'ethereal-dream':
        return 'secondary';
      default:
        return 'primary';
    }
  }, [resolvedTheme]);

  // Render liquid glass overlay for liquid-glass theme
  const renderLiquidGlassOverlay = () => {
    if (resolvedTheme !== 'liquid-glass' || !shouldUseStunningEffects) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        {/* Liquid glass bubbles */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full backdrop-blur-md"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                background: 'rgba(102, 126, 234, 0.3)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  // Render holographic overlay for holo-collection theme
  const renderHolographicOverlay = () => {
    if (resolvedTheme !== 'holo-collection' || !shouldUseStunningEffects) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
      >
        {/* Rainbow shimmer bands */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(255, 0, 110, 0.3), rgba(255, 133, 0, 0.3), rgba(255, 183, 0, 0.3), rgba(199, 240, 0, 0.3), rgba(0, 212, 170, 0.3), rgba(0, 153, 255, 0.3), rgba(139, 0, 255, 0.3), transparent)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Holographic sparkles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'rgba(251, 191, 36, 0.8)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  // Render aurora overlay for cosmic-aurora theme
  const renderAuroraOverlay = () => {
    if (resolvedTheme !== 'cosmic-aurora' || !shouldUseStunningEffects) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5 }}
      >
        {/* Aurora waves */}
        <motion.div
          className="absolute inset-0 blur-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(168, 85, 247, 0.4), rgba(14, 165, 233, 0.4))',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
        
        {/* Aurora particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: ['rgba(34, 197, 94, 0.6)', 'rgba(168, 85, 247, 0.6)', 'rgba(14, 165, 233, 0.6)'][i % 3],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  // Render ethereal overlay for ethereal-dream theme
  const renderEtherealOverlay = () => {
    if (resolvedTheme !== 'ethereal-dream' || !shouldUseStunningEffects) return null;
    
    return (
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
      >
        {/* Dream glow */}
        <motion.div
          className="absolute inset-0 blur-2xl"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4), rgba(139, 92, 246, 0.4), rgba(99, 102, 241, 0.3))',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Floating dream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-sm"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: ['rgba(236, 72, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(99, 102, 241, 0.4)'][i % 3],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, Math.random() * 15 - 7.5, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base Unified Effect System */}
      <UnifiedEffectSystem
        effectType={getEffectTypeForTheme as any}
        intensity={intensity}
        colorScheme={getColorScheme as any}
        animationSpeed={animationSpeed}
        particleCount={particleCount}
        features={getEnhancedFeatures}
        opacity={opacity}
        respectThemeSettings={true}
      />
      
      {/* Theme-specific overlays (only for stunning themes) */}
      {shouldUseStunningEffects && (
        <>
          {renderLiquidGlassOverlay()}
          {renderHolographicOverlay()}
          {renderAuroraOverlay()}
          {renderEtherealOverlay()}
        </>
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-20">
          {children}
        </div>
      )}
    </div>
  );
};

export default StunningEffectsBackground;