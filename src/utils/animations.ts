/**
 * Context7 Premium Animation Utilities
 * Advanced micro-interactions and stunning visual effects
 * 
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning animation patterns and micro-interactions
 * - Performance-optimized CSS-only animations
 * - Reusable animation utilities for consistent experience
 * - Premium timing functions and easing curves
 */

// Context7 Premium Easing Functions
export const premiumEasing = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.2, 0, 0, 1)', 
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  fluid: 'cubic-bezier(0.3, 0, 0, 1)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  dramatic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
} as const;

// Context7 Premium Duration Scales
export const premiumDuration = {
  instant: '100ms',
  fast: '200ms',
  normal: '300ms',
  smooth: '500ms',
  slow: '700ms',
  dramatic: '1000ms',
  epic: '1500ms'
} as const;

// Context7 Premium Scale Effects
export const scaleEffects = {
  subtle: 'scale-102',
  normal: 'scale-105',
  dramatic: 'scale-110',
  epic: 'scale-125'
} as const;

// Context7 Premium Rotation Effects
export const rotationEffects = {
  subtle: 'rotate-1',
  normal: 'rotate-3',
  dramatic: 'rotate-6',
  flip: 'rotate-180'
} as const;

// Context7 Premium Shadow Effects
export const shadowEffects = {
  soft: 'shadow-lg',
  normal: 'shadow-xl',
  dramatic: 'shadow-2xl',
  glow: 'shadow-2xl shadow-indigo-500/25',
  coloredGlow: (color: string) => `shadow-2xl shadow-${color}-500/25`
} as const;

// Context7 Premium Gradient Backgrounds
export const gradientBackgrounds = {
  primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600',
  secondary: 'bg-gradient-to-r from-slate-600 to-gray-600',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-600',
  warning: 'bg-gradient-to-r from-amber-600 to-orange-600',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600',
  premium: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  aurora: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600',
  sunset: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
  ocean: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600'
} as const;

// Context7 Premium Glass Morphism Effects
export const glassMorphism = {
  light: 'bg-white/80 backdrop-blur-sm',
  medium: 'bg-white/90 backdrop-blur-md',
  heavy: 'bg-white/95 backdrop-blur-lg',
  ultra: 'bg-white/98 backdrop-blur-xl'
} as const;

// Context7 Premium Border Effects
export const borderEffects = {
  soft: 'border border-white/20',
  normal: 'border border-white/30',
  strong: 'border border-white/50',
  gradient: 'border border-transparent bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20'
} as const;

// Context7 Animation Class Generator
export const createAnimationClasses = (
  scale: keyof typeof scaleEffects = 'normal',
  rotation: keyof typeof rotationEffects = 'normal',
  shadow: keyof typeof shadowEffects = 'normal',
  duration: keyof typeof premiumDuration = 'normal'
) => {
  return [
    'transition-all',
    `duration-${duration}`,
    'ease-out',
    `hover:${scaleEffects[scale]}`,
    `hover:${rotationEffects[rotation]}`,
    `hover:${shadowEffects[shadow]}`,
    'group-hover:scale-110',
    'active:scale-95'
  ].join(' ');
};

// Context7 Shimmer Effect Generator
export const createShimmerEffect = (direction: 'left' | 'right' = 'right') => {
  const translateStart = direction === 'right' ? '-translate-x-full' : 'translate-x-full';
  const translateEnd = direction === 'right' ? 'translate-x-full' : '-translate-x-full';
  
  return [
    'absolute inset-0',
    'bg-gradient-to-r from-transparent via-white/20 to-transparent',
    translateStart,
    `group-hover:${translateEnd}`,
    'transition-transform duration-1000 ease-out pointer-events-none'
  ].join(' ');
};

// Context7 Particle Animation Generator
export const createParticleAnimation = (count: number = 3) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const delay = i * 100;
    particles.push({
      size: Math.random() > 0.5 ? 'w-2 h-2' : 'w-1.5 h-1.5',
      position: `top-${Math.floor(Math.random() * 4) + 1}/4 left-${Math.floor(Math.random() * 4) + 1}/4`,
      color: ['bg-indigo-300/40', 'bg-blue-300/30', 'bg-purple-300/25'][i % 3],
      animation: ['animate-bounce', 'animate-pulse', 'animate-ping'][i % 3],
      delay: `delay-${delay}`
    });
  }
  return particles;
};

// Context7 Premium Card Animation
export const premiumCardAnimation = {
  base: 'group relative overflow-hidden transition-all duration-500 ease-out',
  hover: 'hover:scale-105 hover:shadow-2xl hover:-translate-y-1',
  active: 'active:scale-98 active:translate-y-0',
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20',
  glow: 'hover:shadow-indigo-500/25'
};

// Context7 Premium Button Animation
export const premiumButtonAnimation = {
  base: 'relative overflow-hidden group transform transition-all duration-300 ease-out',
  hover: 'hover:scale-105 hover:shadow-xl active:scale-95',
  shimmer: createShimmerEffect(),
  glow: 'focus:shadow-2xl focus:ring-2 focus:ring-offset-2'
};

// Context7 Premium Input Animation
export const premiumInputAnimation = {
  base: 'transition-all duration-300 ease-out group',
  focus: 'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:shadow-2xl',
  glass: 'bg-white/90 backdrop-blur-sm border border-slate-200/50',
  glow: 'group-focus-within:shadow-xl'
};