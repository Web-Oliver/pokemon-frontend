# Effects Components

This directory contains reusable visual effect components following CLAUDE.md Layer 3 architecture principles.

## Components

### CosmicBackground

Enhanced version of DbaCosmicBackground with configurable particle systems and gradient patterns.

**Usage:**

```tsx
import { CosmicBackground } from '../effects';

<CosmicBackground
  gradientKey="holographicBase"
  particleConfig={{
    count: 12,
    colors: ['#06b6d4', '#8b5cf6'],
    animationType: 'bounce',
  }}
/>;
```

### HolographicBorder

Reusable holographic border effect component extracted from border-holographic pattern.

**Usage:**

```tsx
import { HolographicBorder } from '../effects';

<HolographicBorder intensity={0.3} colorTheme="cosmic" showOnHover={true}>
  <div>Content with holographic border</div>
</HolographicBorder>;
```

### ParticleSystem

Configurable particle system for dynamic visual effects.

### NeuralNetworkBackground

Neural network pattern background for futuristic themes.

### FloatingGeometry

Geometric shapes with floating animations.

## Integration with CSS Custom Properties

All effects components use CSS custom properties from `pokemon-design-system.css`:

- `--cosmic-holographic-base`
- `--cosmic-conic-holographic`
- `--cosmic-card-gradient`
- `--cosmic-neural-radial`
- `--cosmic-quantum-shimmer`
- `--cosmic-plasma-field`
- `--cosmic-timer-gradient`
- `--cosmic-timer-glow`

## Animation System

The effects use standardized animations:

- `cosmic-float`: 8s ease-in-out infinite
- `cosmic-pulse`: 4s ease-in-out infinite
- `holographic-shimmer`: 3s ease-in-out infinite
- `quantum-spin`: 30s linear infinite

## Theme Compatibility

All effects respect ThemeContext settings:

- `particleEffectsEnabled`: Controls particle rendering
- `animationIntensity`: Affects animation playback
- `reducedMotion`: Provides accessibility compliance
