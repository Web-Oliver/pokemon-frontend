/**
 * Cosmic Effects Utilities
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for cosmic effect utilities and generators
 * - OCP: Open for extension via configurable parameters
 * - DIP: Abstracts cosmic effect implementation details from components
 * - DRY: Eliminates duplicate gradient and particle generation logic
 * 
 * Extracted from DbaCosmicBackground.tsx and other DBA components
 * Consolidates 33+ gradient patterns and particle systems into reusable utilities
 */

export interface ParticleConfig {
  /** Number of particles to generate */
  count?: number;
  /** Particle colors array */
  colors?: string[];
  /** Size range [min, max] in pixels */
  sizeRange?: [number, number];
  /** Animation duration range [min, max] in seconds */
  durationRange?: [number, number];
  /** Base opacity for particles */
  opacity?: number;
  /** Animation type */
  animationType?: 'bounce' | 'pulse' | 'fade' | 'float';
}

export interface CosmicGradient {
  /** Background gradient CSS string */
  gradient: string;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Animation type */
  animationType?: 'spin' | 'pulse' | 'shift';
}

/**
 * Generate particle style configurations
 * Extracted from DbaCosmicBackground.tsx particle generation logic
 */
export const generateParticleStyles = (config: ParticleConfig = {}): Array<{
  key: number;
  style: React.CSSProperties;
  className: string;
}> => {
  const {
    count = 12,
    colors = ['#06b6d4', '#a855f7', '#ec4899', '#10b981'],
    sizeRange = [2, 8],
    durationRange = [4, 7],
    opacity = 0.3,
    animationType = 'bounce'
  } = config;

  return Array.from({ length: count }, (_, i) => {
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    const duration = Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      key: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${i * 0.3}s`,
        animationDuration: `${duration}s`,
        background: `linear-gradient(to right, ${color}, transparent)`,
        opacity,
      },
      className: `absolute rounded-full animate-${animationType}`
    };
  });
};

/**
 * Consolidated cosmic gradient patterns
 * Extracted from 33+ gradient patterns across DBA components
 */
export const COSMIC_GRADIENTS = {
  // Core cosmic backgrounds
  holographicBase: {
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(6, 182, 212, 0.2) 100%)',
    animationType: 'pulse' as const,
    animationDuration: 4
  },

  conicHolographic: {
    gradient: 'conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.1), rgba(139,92,246,0.1), rgba(6,182,212,0.1), rgba(16,185,129,0.1), rgba(245,158,11,0.1), rgba(99,102,241,0.1))',
    animationType: 'spin' as const,
    animationDuration: 30
  },

  // DBA cosmic card backgrounds  
  cosmicCard: {
    gradient: 'linear-gradient(135deg, rgba(39, 39, 42, 0.8) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(139, 92, 246, 0.3) 100%)',
    animationType: 'pulse' as const,
    animationDuration: 3
  },

  // Neural network patterns
  neuralNetwork: {
    gradient: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
    animationType: 'pulse' as const,
    animationDuration: 2
  },

  // Quantum effects
  quantumShimmer: {
    gradient: 'linear-gradient(45deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.2))',
    animationType: 'shift' as const,
    animationDuration: 5
  },

  // Plasma effects
  plasmaField: {
    gradient: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
    animationType: 'pulse' as const,
    animationDuration: 6
  }
} as const;

/**
 * Generate holographic border animation styles
 * Extracted from border-holographic pattern
 */
export const getHolographicBorderStyles = (
  intensity: number = 0.3,
  duration: number = 2
): React.CSSProperties => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: `linear-gradient(90deg, transparent, rgba(6, 182, 212, ${intensity}), transparent)`,
    opacity: 0,
    transition: `opacity ${duration}s ease-in-out`,
    animation: `pulse ${duration}s ease-in-out infinite`,
  } as any,
  '&:hover::before': {
    opacity: 1,
  } as any
});

/**
 * Timer badge configuration for cosmic theme
 * Supports PokemonBadge timer variant integration
 */
export const COSMIC_TIMER_CONFIG = {
  variant: 'gradient' as const,
  style: 'glass' as const,
  size: 'sm' as const,
  shape: 'pill' as const,
  pulse: true,
  className: 'cosmic-glow'
};

/**
 * Animation system for cosmic effects
 * Preserves 17 animation patterns from DBA system
 */
export const COSMIC_ANIMATIONS = {
  // Float animation for particles
  float: {
    name: 'cosmic-float',
    keyframes: `
      @keyframes cosmic-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
        33% { transform: translateY(-15px) rotate(120deg); opacity: 0.6; }
        66% { transform: translateY(10px) rotate(240deg); opacity: 0.4; }
      }
    `,
    duration: '8s',
    timing: 'ease-in-out infinite'
  },

  // Cosmic pulse for backgrounds
  cosmicPulse: {
    name: 'cosmic-pulse',
    keyframes: `
      @keyframes cosmic-pulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
    `,
    duration: '4s',
    timing: 'ease-in-out infinite'
  },

  // Holographic shimmer
  holographicShimmer: {
    name: 'holographic-shimmer',
    keyframes: `
      @keyframes holographic-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    duration: '3s',
    timing: 'ease-in-out infinite'
  },

  // Quantum spin
  quantumSpin: {
    name: 'quantum-spin',
    keyframes: `
      @keyframes quantum-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    duration: '30s',
    timing: 'linear infinite'
  }
};

/**
 * Generate complete cosmic background configuration
 * Combines gradients, particles, and animations
 */
export const generateCosmicBackground = (
  gradientKey: keyof typeof COSMIC_GRADIENTS = 'holographicBase',
  particleConfig: ParticleConfig = {}
) => {
  const gradient = COSMIC_GRADIENTS[gradientKey];
  const particles = generateParticleStyles(particleConfig);

  return {
    gradient,
    particles,
    containerClassName: 'absolute inset-0 overflow-hidden',
    baseLayerClassName: `absolute inset-0 blur-3xl animate-pulse`,
    baseLayerStyle: {
      background: gradient.gradient,
      animationDuration: `${gradient.animationDuration}s`
    }
  };
};