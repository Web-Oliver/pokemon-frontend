/**
 * ThemeToggle Component - Stunning Modern Design
 * Unified theme toggle supporting both standard and stunning themes
 * Layer 3: Components (UI Building Blocks)
 * Beautiful animated theme toggle with light/dark/system modes + stunning themes
 */

import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sparkles, Sun, Zap, Aurora, Palette } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '@/theme';
import { ThemeName, getThemeDisplayName } from '@/theme/DesignSystem';

interface StunningTheme {
  name: ThemeName;
  icon: React.ComponentType<any>;
  label: string;
  gradient: string;
  particles: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const { settings, setColorScheme, setTheme, resolvedTheme } = useTheme();

  // Spring physics for smooth interactions
  const rotationSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const scaleSpring = useSpring(1, { stiffness: 400, damping: 25 });
  
  const rotation = useTransform(rotationSpring, [0, 1], [0, 360]);
  const scale = useTransform(scaleSpring, [1, 1.1], [1, 1.1]);

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-zinc-800/50 animate-pulse" />
    );
  }

  const stunningThemes: StunningTheme[] = [
    {
      name: 'liquid-glass',
      icon: Zap,
      label: 'Liquid Glass',
      gradient: 'from-indigo-500 via-purple-600 to-pink-500',
      particles: 'liquid-bubbles',
      description: 'Apple Vision Pro inspired',
      preview: {
        primary: 'rgba(102, 126, 234, 0.85)',
        secondary: 'rgba(59, 130, 246, 0.8)',
        accent: 'rgba(236, 72, 153, 0.75)',
      },
    },
    {
      name: 'holo-collection',
      icon: Sparkles,
      label: 'Holographic',
      gradient: 'from-purple-500 via-blue-500 to-yellow-400',
      particles: 'holographic-sparkles',
      description: 'Pokemon card effects',
      preview: {
        primary: 'rgba(147, 51, 234, 0.9)',
        secondary: 'rgba(59, 130, 246, 0.85)',
        accent: 'rgba(251, 191, 36, 0.8)',
      },
    },
    {
      name: 'cosmic-aurora',
      icon: Aurora,
      label: 'Cosmic Aurora',
      gradient: 'from-green-400 via-purple-500 to-blue-500',
      particles: 'aurora-particles',
      description: 'Northern lights magic',
      preview: {
        primary: 'rgba(34, 197, 94, 0.85)',
        secondary: 'rgba(168, 85, 247, 0.8)',
        accent: 'rgba(14, 165, 233, 0.75)',
      },
    },
    {
      name: 'ethereal-dream',
      icon: Palette,
      label: 'Ethereal Dream',
      gradient: 'from-pink-500 via-purple-500 to-indigo-500',
      particles: 'dream-particles',
      description: 'Mystical beauty',
      preview: {
        primary: 'rgba(236, 72, 153, 0.88)',
        secondary: 'rgba(139, 92, 246, 0.82)',
        accent: 'rgba(99, 102, 241, 0.78)',
      },
    },
  ];

  // Check if current theme is stunning theme
  const isStunningTheme = stunningThemes.some(t => t.name === resolvedTheme);
  const currentStunningTheme = stunningThemes.find(t => t.name === resolvedTheme);

  // Handle stunning theme selection
  const handleStunningThemeSelect = (theme: StunningTheme) => {
    // Stunning transition effect
    scaleSpring.set(1.1);
    rotationSpring.set(1);
    
    // Apply the stunning theme via unified system
    setTheme(theme.name);
    
    // Collapse after selection
    setTimeout(() => {
      setIsExpanded(false);
      scaleSpring.set(1);
      rotationSpring.set(0);
    }, 300);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      scaleSpring.set(1.05);
    } else {
      scaleSpring.set(1);
    }
  };

  // If stunning theme is active, show stunning toggle interface
  if (isStunningTheme && currentStunningTheme) {
    return (
      <div className="relative">
        {/* Main Toggle Button */}
        <motion.button
          onClick={handleToggleExpanded}
          onHoverStart={() => scaleSpring.set(1.05)}
          onHoverEnd={() => !isExpanded && scaleSpring.set(1)}
          style={{ scale }}
          className={`
            relative group w-12 h-12 rounded-2xl overflow-hidden
            backdrop-blur-md border border-white/20
            transition-all duration-300 ease-out
            hover:border-white/30 active:scale-95
            ${isExpanded ? 'shadow-2xl shadow-black/40' : 'shadow-lg shadow-black/20'}
          `}
          aria-label={`Current theme: ${currentStunningTheme.label}. Click to change theme.`}
          aria-expanded={isExpanded}
        >
          {/* Stunning Background */}
          <div className={`
            absolute inset-0 bg-gradient-to-br ${currentStunningTheme.gradient}
            opacity-80 group-hover:opacity-90 transition-opacity duration-300
          `} />
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
            animate={{ translateX: isExpanded ? '200%' : '-100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {/* Icon */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <motion.div
              style={{ rotate: rotation }}
              className="text-white drop-shadow-lg"
            >
              <currentStunningTheme.icon className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Glow Effect */}
          <div className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
            bg-gradient-to-br ${currentStunningTheme.gradient}
            blur-lg -z-10 transition-opacity duration-300
          `} />

          {/* Active Indicator */}
          {isExpanded && (
            <div className="absolute -top-1 -right-1 w-3 h-3">
              <div className="w-full h-full bg-white rounded-full animate-pulse shadow-lg" />
              <div className="absolute inset-0 bg-white rounded-full animate-ping" />
            </div>
          )}
        </motion.button>

        {/* Expanded Theme Selector */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute top-16 right-0 z-50"
            >
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
              
              {/* Theme Selector Panel */}
              <motion.div 
                className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl min-w-80"
                layoutId="theme-panel"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Choose Your Style</h3>
                  <p className="text-sm text-white/70">Stunning themes for 2025</p>
                </div>

                {/* Standard Theme Quick Access */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <button
                    onClick={() => {
                      setTheme('g100');
                      setIsExpanded(false);
                    }}
                    className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    Switch to Standard Themes
                  </button>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {stunningThemes.map((theme, index) => {
                    const Icon = theme.icon;
                    const isActive = currentStunningTheme.name === theme.name;
                    const isHovered = hoveredTheme === theme.name;
                    
                    return (
                      <motion.button
                        key={theme.name}
                        onClick={() => handleStunningThemeSelect(theme)}
                        onHoverStart={() => setHoveredTheme(theme.name)}
                        onHoverEnd={() => setHoveredTheme(null)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative p-4 rounded-2xl overflow-hidden
                          backdrop-blur-md border transition-all duration-300
                          ${isActive 
                            ? 'border-white/40 shadow-lg shadow-white/20' 
                            : 'border-white/20 hover:border-white/30'
                          }
                          ${isHovered ? 'shadow-xl shadow-black/30' : 'shadow-lg shadow-black/20'}
                        `}
                        aria-label={`Select ${theme.label} theme. ${theme.description}`}
                      >
                        {/* Background */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-br ${theme.gradient}
                          opacity-60 transition-opacity duration-300
                          ${isHovered || isActive ? 'opacity-80' : 'opacity-60'}
                        `} />
                        
                        {/* Glass Overlay */}
                        <div className="absolute inset-0 bg-white/10" />
                        
                        {/* Content */}
                        <div className="relative z-10 text-center">
                          {/* Icon */}
                          <div className="mb-2 flex justify-center">
                            <Icon className={`
                              w-8 h-8 text-white drop-shadow-lg
                              transition-transform duration-200
                              ${isHovered ? 'scale-110' : 'scale-100'}
                            `} />
                          </div>
                          
                          {/* Title */}
                          <h4 className="font-semibold text-white text-sm mb-1">
                            {theme.label}
                          </h4>
                          
                          {/* Description */}
                          <p className="text-xs text-white/80">
                            {theme.description}
                          </p>
                          
                          {/* Color Preview */}
                          <div className="flex justify-center space-x-1 mt-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.preview.primary }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.preview.secondary }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.preview.accent }}
                            />
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                          </motion.div>
                        )}

                        {/* Shimmer Effect */}
                        {(isHovered || isActive) && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ translateX: ['-100%', '100%'] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/60">
                    Experience stunning design with glassmorphism
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {!isExpanded && hoveredTheme === null && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-xs text-white font-medium whitespace-nowrap"
            >
              {currentStunningTheme.label}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 border-r border-b border-white/20 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard theme toggle for non-stunning themes
  const standardThemes = ['white', 'g10', 'g90', 'g100', 'glass', 'premium'] as ThemeName[];
  const allThemes = [
    { name: 'g100' as ThemeName, icon: Moon, label: 'Dark Gray', description: 'Dark professional theme' },
    { name: 'g90' as ThemeName, icon: Monitor, label: 'Gray', description: 'Balanced theme' },
    { name: 'white' as ThemeName, icon: Sun, label: 'Light', description: 'Clean light theme' },
    { name: 'glass' as ThemeName, icon: Sparkles, label: 'Glass', description: 'Glassmorphism theme' },
    { name: 'premium' as ThemeName, icon: Zap, label: 'Premium', description: 'Premium glass theme' },
    ...stunningThemes,
  ];

  const currentTheme = allThemes.find(t => t.name === resolvedTheme) || allThemes[0];
  const Icon = currentTheme.icon;

  const handleThemeClick = () => {
    if (isStunningTheme) {
      // If currently on stunning theme, go back to standard
      setTheme('g100');
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative group">
      {/* Main Toggle Button */}
      <button
        onClick={handleThemeClick}
        className={`
          relative w-10 h-10 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
          ${
            isStunningTheme
              ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30'
              : resolvedTheme === 'white'
                ? 'bg-gradient-to-br from-amber-100 to-orange-200 border border-white/50'
                : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-zinc-700/50'
          }
          shadow-lg hover:shadow-xl group-hover:shadow-2xl backdrop-blur-sm
        `}
        aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
        title={currentTheme.label}
      >
        {/* Animated Background Glow */}
        <div
          className={`
          absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600
          opacity-0 group-hover:opacity-20 transition-opacity duration-300
        `}
        />

        {/* Icon */}
        <Icon
          className={`
            relative z-10 w-5 h-5 transition-all duration-300
            ${isStunningTheme ? 'text-purple-300' : resolvedTheme === 'white' ? 'text-amber-600' : 'text-indigo-400'}
            group-hover:scale-110
          `}
        />

        {/* Sparkle Effect on Hover */}
        <Sparkles
          className={`
          absolute top-0 right-0 w-3 h-3 transition-all duration-300 opacity-0 
          ${isStunningTheme ? 'text-purple-300' : resolvedTheme === 'white' ? 'text-amber-400' : 'text-cyan-400'}
          group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse
        `}
        />
      </button>

      {/* Expanded Theme Selector for Standard Themes */}
      <AnimatePresence>
        {isExpanded && !isStunningTheme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-12 right-0 z-50"
          >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
            
            {/* Theme Selector Panel */}
            <div className={`
              relative rounded-2xl p-4 shadow-2xl min-w-64 border backdrop-blur-xl
              ${resolvedTheme === 'white' 
                ? 'bg-white/90 border-gray-200/50' 
                : 'bg-zinc-800/90 border-zinc-700/50'
              }
            `}>
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className={`text-sm font-semibold mb-1 ${resolvedTheme === 'white' ? 'text-gray-800' : 'text-white'}`}>
                  Choose Theme
                </h3>
                <p className={`text-xs ${resolvedTheme === 'white' ? 'text-gray-600' : 'text-gray-400'}`}>
                  Select your preferred style
                </p>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-2">
                {allThemes.map((theme, index) => {
                  const ThemeIcon = theme.icon;
                  const isActive = resolvedTheme === theme.name;
                  
                  return (
                    <button
                      key={theme.name}
                      onClick={() => {
                        setTheme(theme.name);
                        setIsExpanded(false);
                      }}
                      className={`
                        relative p-3 rounded-xl border transition-all duration-200 text-left
                        ${isActive 
                          ? resolvedTheme === 'white' 
                            ? 'border-blue-300 bg-blue-50 shadow-md'
                            : 'border-purple-400 bg-purple-500/20 shadow-md'
                          : resolvedTheme === 'white'
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-700/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <ThemeIcon className={`
                          w-4 h-4 
                          ${isActive 
                            ? resolvedTheme === 'white' ? 'text-blue-600' : 'text-purple-400'
                            : resolvedTheme === 'white' ? 'text-gray-600' : 'text-gray-400'
                          }
                        `} />
                        <div>
                          <div className={`
                            text-xs font-medium 
                            ${isActive 
                              ? resolvedTheme === 'white' ? 'text-blue-800' : 'text-purple-300'
                              : resolvedTheme === 'white' ? 'text-gray-800' : 'text-white'
                            }
                          `}>
                            {theme.label}
                          </div>
                          <div className={`
                            text-xs 
                            ${resolvedTheme === 'white' ? 'text-gray-500' : 'text-gray-400'}
                          `}>
                            {theme.description}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <div className={`
                          absolute -top-1 -right-1 w-3 h-3 rounded-full
                          ${resolvedTheme === 'white' ? 'bg-blue-500' : 'bg-purple-500'}
                        `} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <div
        className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 
        text-xs font-medium rounded-lg opacity-0 pointer-events-none transition-all duration-300
        group-hover:opacity-100 group-hover:translate-y-0 translate-y-1
        ${
          resolvedTheme === 'white'
            ? 'bg-white/95 text-zinc-700 border border-zinc-200/50'
            : 'bg-zinc-800/95 text-zinc-200 border border-zinc-700/50'
        }
        backdrop-blur-sm shadow-lg whitespace-nowrap z-50
      `}
      >
        {currentTheme.label}
        <div
          className={`
          absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45
          ${resolvedTheme === 'white' ? 'bg-white/95 border-r border-b border-zinc-200/50' : 'bg-zinc-800/95 border-r border-b border-zinc-700/50'}
        `}
        />
      </div>
    </div>
  );
};

export default ThemeToggle;
