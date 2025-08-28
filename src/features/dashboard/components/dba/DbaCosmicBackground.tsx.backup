/**
 * DBA Cosmic Background Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for cosmic background effects
 * - OCP: Open for extension via props
 * - DIP: Uses shared Layer 1 utilities (cosmicEffects.ts)
 *
 * UPDATED: Uses shared cosmic effect system from utils/cosmicEffects.ts
 * Maintains original DBA aesthetic while leveraging unified utilities
 */

import React from 'react';
import { CosmicBackground } from '../../../../shared/components/organisms/effects';

interface DbaCosmicBackgroundProps {
  /** Custom particle configuration */
  particleConfig?: {
    count?: number;
    colors?: string[];
    sizeRange?: [number, number];
    durationRange?: [number, number];
    opacity?: number;
    animationType?: 'bounce' | 'pulse' | 'fade' | 'float';
  };
  /** Additional CSS classes */
  className?: string;
}

const DbaCosmicBackground: React.FC<DbaCosmicBackgroundProps> = ({
  particleConfig = {
    count: 12,
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
    sizeRange: [2, 6],
    durationRange: [4, 7],
    opacity: 0.3,
    animationType: 'bounce',
  },
  className = '',
}) => {
  return (
    <CosmicBackground
      gradientKey="holographicBase"
      particleConfig={particleConfig}
      className={className}
      respectThemeSettings={true}
    />
  );
};

export default DbaCosmicBackground;
