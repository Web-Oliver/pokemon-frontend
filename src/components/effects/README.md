# Effects Components Documentation

## Overview

This directory contains reusable effect components extracted from the Context7 2025 futuristic design system, specifically from `CreateAuction.tsx`. These components follow CLAUDE.md principles and are theme-compatible.

## Components

### ParticleSystem

Renders floating particles with configurable properties.

**Props:**
- `particleCount?: number` - Number of particles (default: 12)
- `colors?: string[]` - Array of hex colors (default: ['#06b6d4', '#a855f7', '#ec4899', '#10b981'])
- `sizeRange?: [number, number]` - Size range in pixels (default: [2, 8])
- `durationRange?: [number, number]` - Animation duration range in seconds (default: [3, 7])
- `opacity?: number` - Base opacity (default: 0.2)
- `animationType?: 'pulse' | 'bounce' | 'fade'` - Animation type (default: 'pulse')

**Theme Integration:**
- Respects `config.particleEffectsEnabled` setting
- Automatically disabled when particle effects are turned off

**Usage Example:**
```tsx
<ParticleSystem
  particleCount={12}
  colors={['#06b6d4', '#a855f7', '#ec4899', '#10b981']}
  sizeRange={[2, 8]}
  durationRange={[3, 7]}
  opacity={0.2}
  animationType="pulse"
/>
```

### NeuralNetworkBackground

Creates a neural network pattern background with quantum particles and grid overlay.

**Props:**
- `primaryColor?: string` - Primary neural network color (default: '#06b6d4')
- `secondaryColor?: string` - Secondary quantum particles color (default: '#a855f7')
- `gridColor?: string` - Grid overlay color (default: '#06b6d4')
- `opacity?: number` - Overall opacity (default: 0.2)
- `enableQuantumParticles?: boolean` - Enable quantum particles animation (default: true)
- `enableGrid?: boolean` - Enable holographic grid overlay (default: true)
- `animationSpeed?: number` - Animation speed multiplier (default: 1)

**Theme Integration:**
- Respects `config.particleEffectsEnabled` for quantum particles
- Uses `config.glassmorphismIntensity` to adjust opacity
- Animation speed affected by theme animation settings

**Usage Example:**
```tsx
<NeuralNetworkBackground
  primaryColor="#06b6d4"
  secondaryColor="#a855f7"
  gridColor="#06b6d4"
  opacity={0.2}
  enableQuantumParticles={true}
  enableGrid={true}
  animationSpeed={1}
/>
```

### FloatingGeometry

Renders configurable floating geometric elements with animations.

**Props:**
- `elements?: GeometricElement[]` - Array of geometric elements to render
- `className?: string` - Additional CSS classes

**GeometricElement Interface:**
```typescript
interface GeometricElement {
  type: 'square' | 'circle' | 'triangle' | 'diamond';
  size: number;
  color: string;
  position: { top: string; left?: string; right?: string; bottom?: string };
  animation: 'spin' | 'pulse' | 'bounce' | 'float';
  animationDuration?: string;
  borderOnly?: boolean;
  opacity?: number;
  glowEffect?: boolean;
}
```

**Theme Integration:**
- Respects `config.animationIntensity` setting
- Automatically disabled when animations are set to 'disabled'
- Animation speeds adjust based on theme animation intensity

**Usage Example:**
```tsx
const futuristicElements: GeometricElement[] = [
  {
    type: 'square',
    size: 80,
    color: '#06b6d4',
    position: { top: '2rem', right: '2rem' },
    animation: 'spin',
    animationDuration: '20s',
    borderOnly: true,
    opacity: 0.4,
    glowEffect: true,
  },
];

<FloatingGeometry elements={futuristicElements} />
```

## Context7 2025 Futuristic Pattern

The Context7 2025 futuristic design system represents an advanced neural network aesthetic with:

### Visual Elements
- **Neural Network Patterns**: SVG-based network visualizations with glow effects
- **Quantum Particle Systems**: Floating animated particles with dynamic colors
- **Holographic Grid Overlays**: Subtle grid patterns with transparency
- **Glassmorphism Integration**: Theme-aware backdrop blur and transparency
- **Geometric Elements**: Animated floating shapes with glow effects

### Color Palette
- **Primary Cyan**: `#06b6d4` - Neural network connections
- **Secondary Purple**: `#a855f7` - Quantum particles and accents
- **Accent Pink**: `#ec4899` - Particle variations
- **Success Green**: `#10b981` - Particle variations

### Animation Characteristics
- **Duration Range**: 3-20 seconds for various elements
- **Easing**: CSS ease-out and custom cubic-bezier functions
- **Staggered Delays**: Random delays for natural particle movement
- **Intensity Scaling**: Animation speeds scale with theme intensity settings

### Theme Compatibility

All Context7 2025 components are designed to:
1. **Respect Theme Settings**: Honor particle effects, animation intensity, and glassmorphism settings
2. **Graceful Degradation**: Disable effects when theme settings require it
3. **Accessibility**: Support reduced motion preferences
4. **Performance**: Efficient rendering with requestAnimationFrame where applicable

### Reusability Guidelines

When using these effects in other components:

1. **Performance**: Use sparingly - neural networks and particles are resource-intensive
2. **Context**: Best suited for hero sections, create/edit flows, and premium interfaces
3. **Accessibility**: Always check `config.reducedMotion` and provide alternatives
4. **Theme Consistency**: Use the predefined color palette for visual consistency

### Migration Notes

These components were extracted from `CreateAuction.tsx` to promote:
- **Code Reuse**: Eliminate duplication across components
- **Theme Integration**: Ensure all effects respect global theme settings
- **Maintainability**: Centralized effect logic for easier updates
- **Performance**: Shared utilities reduce bundle size

The original `CreateAuction.tsx` now uses these shared components while maintaining its unique Context7 2025 futuristic aesthetic and theme switching compatibility.