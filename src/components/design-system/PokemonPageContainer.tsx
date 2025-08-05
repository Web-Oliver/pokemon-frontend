/**
 * Pokemon Page Container Component - Unified Design System
 * Layer 3: Components (UI Building Blocks)
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles page layout and background
 * - Open/Closed: Extensible through background variants
 * - Reusability: Works across all pages replacing individual backgrounds
 * - DRY: Eliminates duplicate page structure patterns
 */

import React from 'react';
import { cn } from '../../utils/common';

export interface PokemonPageContainerProps {
  children: React.ReactNode;
  withParticles?: boolean;
  withNeural?: boolean;
  className?: string;
}

/**
 * Unified page container based on analysis of Activity, Dashboard, Auctions
 * Consolidates: background patterns, particle systems, neural networks
 */
export const PokemonPageContainer: React.FC<PokemonPageContainerProps> = ({
  children,
  withParticles = true,
  withNeural = true,
  className = '',
}) => {
  return (
    <div className={cn('page-container', className)}>
      {/* Context7 2025 Futuristic Neural Background */}
      {withNeural && (
        <div className="absolute inset-0 opacity-20">
          {/* Primary Neural Network Pattern */}
          <div className="absolute inset-0 bg-neural" />
          
          {/* Secondary Quantum Particles */}
          <div
            className="absolute inset-0 animate-bounce"
            style={{
              animationDuration: '6s',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.05'%3E%3Ccircle cx='100' cy='50' r='1.5'/%3E%3Ccircle cx='50' cy='100' r='1'/%3E%3Ccircle cx='150' cy='100' r='1.5'/%3E%3Ccircle cx='100' cy='150' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Holographic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.1) 100%), linear-gradient(transparent 98%, rgba(168, 85, 247, 0.1) 100%)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* Floating Particle Systems */}
      {withParticles && (
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: `radial-gradient(circle, ${['#06b6d4', '#a855f7', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]}, transparent)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 4 + 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="content-wrapper">
        <div className="main-container">
          {children}
        </div>
      </div>
    </div>
  );
};