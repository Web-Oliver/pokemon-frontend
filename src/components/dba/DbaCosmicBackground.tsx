/**
 * DBA Cosmic Background Component
 * Layer 3: Components (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for cosmic background effects
 * - OCP: Open for extension via props
 * - DIP: Self-contained visual component
 */

import React from 'react';

const DbaCosmicBackground: React.FC = () => {
  return (
    <>
      {/* 🌌 COSMIC BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Holographic base layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-800/15 to-cyan-900/20 blur-3xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(99,102,241,0.1),rgba(139,92,246,0.1),rgba(6,182,212,0.1),rgba(16,185,129,0.1),rgba(245,158,11,0.1),rgba(99,102,241,0.1))] animate-spin" style={{ animationDuration: '30s' }}></div>
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </>
  );
};

export default DbaCosmicBackground;