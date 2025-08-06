/**
 * GlassmorphismHeader Component
 * CENTRALIZED premium glassmorphism header styling
 * 
 * Following CLAUDE.md principles:
 * - DRY: Single source of truth for all premium header styling
 * - Single Responsibility: Only handles glassmorphism header presentation
 * - Reusability: Used across ALL pages and forms
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassmorphismHeaderProps {
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Main header title */
  title: string;
  /** Descriptive subtitle text */
  description?: string;
  /** Custom className for additional styling */
  className?: string;
  /** Children elements (like action buttons) */
  children?: React.ReactNode;
}

const GlassmorphismHeader: React.FC<GlassmorphismHeaderProps> = ({
  icon: Icon,
  title,
  description,
  className = '',
  children,
}) => {
  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br from-white/[0.15] via-cyan-500/[0.12] to-purple-500/[0.15] border border-white/[0.20] rounded-[2rem] shadow-2xl text-white p-12 relative overflow-hidden group ${className}`}>
      {/* Neural Network Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 opacity-70 blur-3xl"></div>
      
      {/* Holographic Border Animation */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>
      
      {/* Floating Geometric Elements */}
      <div className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]" style={{animationDuration: '20s'}}></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-8">
          {Icon && (
            <div className="relative mr-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg"></div>
                <Icon className="w-10 h-10 text-cyan-300 relative z-10 animate-pulse" />
                <div className="absolute inset-0 animate-spin opacity-40" style={{animationDuration: '15s'}}>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              {title}
            </h1>
            {description && (
              <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                <span className="w-5 h-5 text-cyan-400 animate-pulse">✨</span>
                {description}
              </p>
            )}
          </div>

          {children && (
            <div className="flex items-center space-x-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismHeader;