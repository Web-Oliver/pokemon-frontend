/**
 * ThemeToggle Component - Stunning Modern Design
 * Layer 3: Components (UI Building Blocks)
 * Beautiful animated theme toggle with light/dark/system modes
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Sparkles } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-zinc-800/50 animate-pulse" />
    );
  }

  const themes = [
    {
      name: 'light',
      icon: Sun,
      label: 'Light Mode',
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'bg-gradient-to-br from-amber-100 to-orange-200',
      bgDark: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      textLight: 'text-amber-600',
      textDark: 'text-amber-400',
    },
    {
      name: 'dark',
      icon: Moon,
      label: 'Dark Mode',
      gradient: 'from-indigo-500 to-purple-600',
      bgLight: 'bg-gradient-to-br from-indigo-100 to-purple-200',
      bgDark: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
      textLight: 'text-indigo-600',
      textDark: 'text-indigo-400',
    },
    {
      name: 'system',
      icon: Monitor,
      label: 'System',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-gradient-to-br from-emerald-100 to-teal-200',
      bgDark: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      textLight: 'text-emerald-600',
      textDark: 'text-emerald-400',
    },
  ];

  const currentTheme = themes.find((t) => t.name === theme) || themes[0];
  const Icon = currentTheme.icon;

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].name);
  };

  return (
    <div className="relative group">
      {/* Main Toggle Button */}
      <button
        onClick={handleThemeChange}
        className={`
          relative w-10 h-10 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
          ${
            resolvedTheme === 'dark'
              ? `${currentTheme.bgDark} border border-zinc-700/50 shadow-lg hover:shadow-xl`
              : `${currentTheme.bgLight} border border-white/50 shadow-lg hover:shadow-xl`
          }
          group-hover:shadow-2xl backdrop-blur-sm
        `}
        aria-label={`Switch to next theme. Current: ${currentTheme.label}`}
        title={currentTheme.label}
      >
        {/* Animated Background Glow */}
        <div
          className={`
          absolute inset-0 rounded-xl bg-gradient-to-r ${currentTheme.gradient} 
          opacity-0 group-hover:opacity-20 transition-opacity duration-300
        `}
        />

        {/* Icon */}
        <Icon
          className={`
            relative z-10 w-5 h-5 transition-all duration-300
            ${resolvedTheme === 'dark' ? currentTheme.textDark : currentTheme.textLight}
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
          resolvedTheme === 'dark'
            ? 'bg-zinc-800/95 text-zinc-200 border border-zinc-700/50'
            : 'bg-white/95 text-zinc-700 border border-zinc-200/50'
        }
        backdrop-blur-sm shadow-lg whitespace-nowrap z-50
      `}
      >
        {currentTheme.label}
        <div
          className={`
          absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45
          ${resolvedTheme === 'dark' ? 'bg-zinc-800/95 border-r border-b border-zinc-700/50' : 'bg-white/95 border-r border-b border-zinc-200/50'}
        `}
        />
      </div>

      {/* System Theme Indicator */}
      {theme === 'system' && (
        <div
          className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse
          ${resolvedTheme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}
        `}
        >
          <div
            className={`
            absolute inset-0 rounded-full animate-ping
            ${resolvedTheme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}
          `}
          />
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
