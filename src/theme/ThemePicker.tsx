/**
 * THEME PICKER COMPONENT - Pokemon Collection
 * Advanced theme selection with live preview
 * 
 * Replaces over-engineered theme selection components
 */

import React from 'react';
import { Monitor, Moon, Palette, Sun, Sparkles, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import type { ThemeName } from './themeSystem';

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  preview: {
    bg: string;
    accent: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    name: 'light',
    label: 'Light Mode',
    description: 'Clean and bright interface',
    icon: Sun,
    gradient: 'from-amber-400 to-orange-500',
    preview: { bg: 'bg-white', accent: 'bg-amber-500' },
  },
  {
    name: 'dark',
    label: 'Dark Mode',
    description: 'Easy on the eyes',
    icon: Moon,
    gradient: 'from-slate-700 to-slate-900',
    preview: { bg: 'bg-slate-900', accent: 'bg-cyan-500' },
  },
  {
    name: 'context7-premium',
    label: 'Context7 Premium',
    description: 'Professional glassmorphism design',
    icon: Sparkles,
    gradient: 'from-purple-600 to-blue-600',
    preview: { bg: 'bg-slate-800', accent: 'bg-purple-500' },
  },
  {
    name: 'context7-futuristic',
    label: 'Context7 Futuristic',
    description: 'Neural network patterns',
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-600',
    preview: { bg: 'bg-slate-900', accent: 'bg-cyan-400' },
  },
  {
    name: 'dba-cosmic',
    label: 'DBA Cosmic',
    description: 'Space-themed with cosmic gradients',
    icon: Palette,
    gradient: 'from-purple-500 to-pink-500',
    preview: { bg: 'bg-purple-900', accent: 'bg-pink-500' },
  },
  {
    name: 'minimal',
    label: 'Minimal Clean',
    description: 'Reduced visual complexity',
    icon: Monitor,
    gradient: 'from-emerald-500 to-teal-500',
    preview: { bg: 'bg-gray-50', accent: 'bg-emerald-500' },
  },
];

export const ThemePicker: React.FC = () => {
  const { settings, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {themeOptions.map((theme) => {
        const Icon = theme.icon;
        const isActive = settings.theme === theme.name;

        return (
          <button
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-lg group
              ${isActive 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }
            `}
          >
            {/* Preview */}
            <div className={`
              w-full h-16 rounded-lg mb-3 relative overflow-hidden
              ${theme.preview.bg}
            `}>
              <div className={`
                absolute top-2 left-2 w-3 h-3 rounded-full
                ${theme.preview.accent}
              `} />
              <div className={`
                absolute bottom-2 right-2 w-8 h-2 rounded-full
                ${theme.preview.accent} opacity-60
              `} />
              <div className={`
                absolute inset-0 bg-gradient-to-r ${theme.gradient}
                opacity-10 group-hover:opacity-20 transition-opacity
              `} />
            </div>

            {/* Icon and Label */}
            <div className="text-center">
              <Icon className="w-5 h-5 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
              <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {theme.label}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {theme.description}
              </p>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemePicker;