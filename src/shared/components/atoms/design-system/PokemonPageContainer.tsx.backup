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
import { cn } from '../../../utils';

export interface PokemonPageContainerProps {
  children: React.ReactNode;
  withParticles?: boolean;
  withNeural?: boolean;
  withCosmicHeader?: boolean;
  cosmicHeaderConfig?: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    stats?: Array<{
      icon: React.ReactNode;
      label: string;
      value: number | string;
      color?: 'blue' | 'red' | 'green' | 'yellow';
    }>;
  };
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
  withCosmicHeader = false,
  cosmicHeaderConfig,
  className = '',
}) => {
  const getStatColorClasses = (color?: 'blue' | 'red' | 'green' | 'yellow') => {
    switch (color) {
      case 'red':
        return 'bg-red-900/30 text-red-400 border-red-600';
      case 'green':
        return 'bg-green-900/30 text-green-400 border-green-600';
      case 'yellow':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      default:
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
    }
  };
  return (
    <div className={cn('page-container', 'relative z-10', className)}>
      {/* Context7 2025 Futuristic Neural Background */}
      {withNeural && (
        <div className="absolute inset-0 opacity-20">
          {/* Primary Neural Network Pattern */}
          <div className="absolute inset-0 bg-neural" />

          {/* Secondary Quantum Particles */}
          <div className="absolute inset-0 quantum-particles" />

          {/* Holographic Grid Overlay */}
          <div className="absolute inset-0 opacity-30 holographic-grid" />
        </div>
      )}

      {/* Floating Particle Systems */}
      {withParticles && (
        <div className="particles">
          {[...Array(15)].map((_, i) => {
            const colors = ['particle-cyan', 'particle-purple', 'particle-pink', 'particle-emerald'];
            const sizes = ['particle-sm', 'particle-md', 'particle-lg'];
            const colorClass = colors[Math.floor(Math.random() * colors.length)];
            const sizeClass = sizes[Math.floor(Math.random() * sizes.length)];
            const delay = Math.floor(Math.random() * 3);
            const duration = Math.floor(Math.random() * 4) + 3;
            
            return (
              <div
                key={i}
                className={`particle ${colorClass} ${sizeClass}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Cosmic Header */}
      {withCosmicHeader && cosmicHeaderConfig && (
        <div className="relative z-20 mb-6">
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4 sm:p-6">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  {cosmicHeaderConfig.icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {cosmicHeaderConfig.title}
                  </h1>
                  {cosmicHeaderConfig.subtitle && (
                    <p className="text-sm text-zinc-400">
                      {cosmicHeaderConfig.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {cosmicHeaderConfig.stats && (
                <div className="grid grid-cols-3 gap-2">
                  {cosmicHeaderConfig.stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 text-center ${getStatColorClasses(stat.color)}`}
                    >
                      <div className="w-4 h-4 mx-auto mb-1">{stat.icon}</div>
                      <p className="text-xs">{stat.label}</p>
                      <p className="text-lg font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  {cosmicHeaderConfig.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {cosmicHeaderConfig.title}
                  </h1>
                  {cosmicHeaderConfig.subtitle && (
                    <p className="text-zinc-400">
                      {cosmicHeaderConfig.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {cosmicHeaderConfig.stats && (
                <div className="flex gap-4">
                  {cosmicHeaderConfig.stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-4 text-center min-w-[80px] ${getStatColorClasses(stat.color)}`}
                    >
                      <div className="w-5 h-5 mx-auto mb-1">{stat.icon}</div>
                      <p className="text-xs">{stat.label}</p>
                      <p className="text-xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="content-wrapper">
        <div className="main-container">{children}</div>
      </div>
    </div>
  );
};
