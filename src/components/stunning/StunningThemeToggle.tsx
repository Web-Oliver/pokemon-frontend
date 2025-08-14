/**
 * STUNNING THEME TOGGLE 2025
 * Breathtaking, sensational theme toggle with advanced micro-interactions
 * 
 * Features:
 * - Liquid Glass morphing animations
 * - Holographic Pokemon card effects
 * - Advanced micro-interactions (200-500ms timing)
 * - Accessibility compliant (WCAG AA)
 * - Apple Vision Pro inspired design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Monitor, Moon, Sun, Sparkles, Zap, Aurora, Palette } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { applyStunningTheme, StunningThemeName } from '../../theme/stunningModernThemes';

interface StunningTheme {
  name: StunningThemeName;
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

const StunningThemeToggle: React.FC = () => {
  const { settings, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Spring physics for smooth interactions
  const rotationSpring = useSpring(0, { stiffness: 300, damping: 30 });
  const scaleSpring = useSpring(1, { stiffness: 400, damping: 25 });
  
  const rotation = useTransform(rotationSpring, [0, 1], [0, 360]);
  const scale = useTransform(scaleSpring, [1, 1.1], [1, 1.1]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const currentTheme = stunningThemes.find(t => 
    settings.theme === t.name || settings.theme.includes(t.name.split('-')[0])
  ) || stunningThemes[0];

  const handleThemeSelect = (theme: StunningTheme) => {
    // Stunning transition effect
    scaleSpring.set(1.1);
    rotationSpring.set(1);
    
    // Apply the stunning theme
    applyStunningTheme(theme.name);
    setTheme(theme.name as any);
    
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

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse backdrop-blur-sm" />
    );
  }

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
        aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
        aria-expanded={isExpanded}
      >
        {/* Stunning Background */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}
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
            <currentTheme.icon className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Glow Effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
          bg-gradient-to-br ${currentTheme.gradient}
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

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stunningThemes.map((theme, index) => {
                  const Icon = theme.icon;
                  const isActive = currentTheme.name === theme.name;
                  const isHovered = hoveredTheme === theme.name;
                  
                  return (
                    <motion.button
                      key={theme.name}
                      onClick={() => handleThemeSelect(theme)}
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
            {currentTheme.label}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 border-r border-b border-white/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StunningThemeToggle;