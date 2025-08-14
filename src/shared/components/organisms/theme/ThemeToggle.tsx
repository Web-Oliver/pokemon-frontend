/**
 * ThemeToggle Component - Stunning Modern Design
 * Layer 3: Components (UI Building Blocks)
 * Beautiful animated theme toggle with light/dark/system modes
 */

import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sparkles, Sun } from 'lucide-react';
import { useTheme } from '../../../../theme/ThemeProvider';
import StunningThemeToggle from '../../../../components/stunning/StunningThemeToggle';

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { settings, setColorScheme, resolvedTheme } = useTheme();

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-zinc-800/50 animate-pulse" />
    );
  }

  // Use stunning theme toggle for stunning themes
  const isStunningTheme = ['liquid-glass', 'holo-collection', 'cosmic-aurora', 'ethereal-dream'].includes(resolvedTheme);
  
  if (isStunningTheme) {
    return <StunningThemeToggle />;
  }

  const colorSchemes = [
    {
      name: 'light' as const,
      icon: Sun,
      label: 'Light Mode',
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-gradient-to-br from-amber-100 to-orange-200',
      bgDark: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      textLight: 'text-amber-600',
      textDark: 'text-amber-400',
    },
    {
      name: 'dark' as const,
      icon: Moon,
      label: 'Dark Mode',
      gradient: 'from-indigo-500 to-purple-600',
      bgLight: 'bg-gradient-to-br from-indigo-100 to-purple-200',
      bgDark: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
      textLight: 'text-indigo-600',
      textDark: 'text-indigo-400',
    },
    {
      name: 'system' as const,
      icon: Monitor,
      label: 'System',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-gradient-to-br from-emerald-100 to-teal-200',
      bgDark: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      textLight: 'text-emerald-600',
      textDark: 'text-emerald-400',
    },
  ];

  const currentScheme = colorSchemes.find((t) => t.name === settings.colorScheme) || colorSchemes[1];
  const Icon = currentScheme.icon;

  const handleThemeChange = () => {
    const currentIndex = colorSchemes.findIndex((t) => t.name === settings.colorScheme);
    const nextIndex = (currentIndex + 1) % colorSchemes.length;
    setColorScheme(colorSchemes[nextIndex].name);
  };

  return (
    <div className="relative group">
      {/* Main Toggle Button */}
      <button
        onClick={handleThemeChange}
        className={`
          relative w-10 h-10 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
          ${
            resolvedTheme === 'light'
              ? `${currentScheme.bgLight} border border-white/50 shadow-lg hover:shadow-xl`
              : `${currentScheme.bgDark} border border-zinc-700/50 shadow-lg hover:shadow-xl`
          }
          group-hover:shadow-2xl backdrop-blur-sm
        `}
        aria-label={`Switch to next color scheme. Current: ${currentScheme.label}`}
        title={currentScheme.label}
      >
        {/* Animated Background Glow */}
        <div
          className={`
          absolute inset-0 rounded-xl bg-gradient-to-r ${currentScheme.gradient} 
          opacity-0 group-hover:opacity-20 transition-opacity duration-300
        `}
        />

        {/* Icon */}
        <Icon
          className={`
            relative z-10 w-5 h-5 transition-all duration-300
            ${resolvedTheme === 'light' ? currentScheme.textLight : currentScheme.textDark}
            group-hover:scale-110
          `}
        />

        {/* Sparkle Effect on Hover */}
        <Sparkles
          className={`
          absolute top-0 right-0 w-3 h-3 transition-all duration-300 opacity-0 
          ${resolvedTheme === 'dark' ? 'text-cyan-400' : 'text-amber-400'}
          group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse
        `}
        />
      </button>

      {/* Tooltip */}
      <div
        className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 
        text-xs font-medium rounded-lg opacity-0 pointer-events-none transition-all duration-300
        group-hover:opacity-100 group-hover:translate-y-0 translate-y-1
        ${
          resolvedTheme === 'light'
            ? 'bg-white/95 text-zinc-700 border border-zinc-200/50'
            : 'bg-zinc-800/95 text-zinc-200 border border-zinc-700/50'
        }
        backdrop-blur-sm shadow-lg whitespace-nowrap z-50
      `}
      >
        {currentScheme.label}
        <div
          className={`
          absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45
          ${resolvedTheme === 'light' ? 'bg-white/95 border-r border-b border-zinc-200/50' : 'bg-zinc-800/95 border-r border-b border-zinc-700/50'}
        `}
        />
      </div>

      {/* System Theme Indicator */}
      {settings.colorScheme === 'system' && (
        <div
          className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse
          ${resolvedTheme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'}
        `}
        >
          <div
            className={`
            absolute inset-0 rounded-full animate-ping
            ${resolvedTheme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'}
          `}
          />
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
