/**
 * SOLID/DRY Implementation: Hero Section Component
 * Single Responsibility: Display main hero section with navigation tabs
 * Open/Closed: Extensible through props and composition
 * DRY: Reusable hero pattern
 */

import React from 'react';
import { Upload, Layers } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system';
// Removed design-tokens import - using inline styling instead
const generateGradientText = (color: string) => `bg-gradient-to-r ${color === 'cyan' ? 'from-cyan-300 to-blue-300' : 'from-purple-300 to-pink-300'} bg-clip-text text-transparent`;
const typography = {
  hero: 'text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight'
};

export interface HeroSectionProps {
  activeTab: 'upload' | 'bulk';
  onTabChange: (tab: 'upload' | 'bulk') => void;
  psaResultsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeTab,
  onTabChange,
  psaResultsCount
}) => {
  return (
    <PokemonCard className="bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-xl border-cyan-400/30 overflow-hidden">
      <div className="px-8 py-12 space-y-12">
        {/* Enhanced Hero Section */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 backdrop-blur-sm border border-cyan-300/20 rounded-full">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-200/90 font-semibold text-sm uppercase tracking-wider">
              Advanced OCR Technology
            </span>
          </div>
          
          <h1 className={typography.hero}>
            <span className={`${generateGradientText('cyan')} leading-tight block`}>
              OCR Card
            </span>
            <span className={`${generateGradientText('purple')} leading-tight block mt-2`}>
              Matching
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-cyan-100/80 max-w-4xl mx-auto leading-relaxed font-light">
            Transform your <span className="font-semibold text-cyan-200">Pokemon cards</span> into digital collections with 
            <span className="font-semibold text-purple-200"> AI-powered OCR</span> and 
            <span className="font-semibold text-pink-200">intelligent matching</span> algorithms
          </p>
        </div>
        
        {/* Enhanced Tab Navigation */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Tab background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50"></div>
            
            <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-3 shadow-2xl">
              <div className="flex items-center gap-4">
                <TabButton
                  active={activeTab === 'upload'}
                  onClick={() => onTabChange('upload')}
                  icon={<Upload className="w-6 h-6" />}
                  title="Image Upload & OCR"
                  subtitle="Process single cards"
                  colorScheme="cyan"
                />
                
                <TabButton
                  active={activeTab === 'bulk'}
                  onClick={() => onTabChange('bulk')}
                  icon={<Layers className="w-6 h-6" />}
                  title="PSA Bulk Processing"
                  subtitle="Batch process multiple cards"
                  colorScheme="emerald"
                  badge={psaResultsCount > 0 ? psaResultsCount : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  colorScheme: 'cyan' | 'emerald';
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  title,
  subtitle,
  colorScheme,
  badge
}) => {
  const colorConfig = {
    cyan: {
      gradient: 'from-cyan-500/20 to-purple-500/20',
      border: 'border-cyan-400/40',
      shadow: 'shadow-cyan-500/25',
      hoverGradient: 'from-cyan-500/10 to-purple-500/10'
    },
    emerald: {
      gradient: 'from-emerald-500/20 to-teal-500/20', 
      border: 'border-emerald-400/40',
      shadow: 'shadow-emerald-500/25',
      hoverGradient: 'from-emerald-500/10 to-teal-500/10'
    }
  };

  const config = colorConfig[colorScheme];

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden transition-all duration-500 ${
        active ? 'scale-105' : 'scale-100 hover:scale-[1.02]'
      }`}
    >
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
        active 
          ? `bg-gradient-to-r ${config.gradient} opacity-100` 
          : `bg-gradient-to-r ${config.hoverGradient} opacity-0 group-hover:opacity-100`
      }`}></div>
      
      <div className={`relative flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-300 ${
        active
          ? `bg-gradient-to-r ${config.gradient} ${config.border} text-white shadow-xl ${config.shadow}`
          : 'bg-transparent border-transparent text-cyan-100/70 hover:text-white hover:border-white/10'
      }`}>
        {icon}
        <div className="text-left">
          <div className="font-bold text-lg">{title}</div>
          <div className="text-xs opacity-70">{subtitle}</div>
        </div>
        {active && (
          <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
        )}
        {badge && (
          <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${config.gradient.replace('/20', '')} text-white text-sm px-3 py-1 rounded-full font-black shadow-lg`}>
            {badge}
          </div>
        )}
      </div>
    </button>
  );
};