/**
 * ActivityStatCard Component - DRY Violation Fix
 *
 * Reusable statistical card component extracted from Activity.tsx
 * to prevent JSX duplication for statistical cards (Total Activities, Recent Activity, Showing Results).
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles one type of statistical display
 * - DRY: Eliminates repeated statistical card JSX structures
 * - Reusability: Can be used across different activity displays
 * - Design System Integration: Uses PokemonCard for consistency
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PokemonCard } from '../design-system/PokemonCard';

interface ActivityStatCardProps {
  /** Display title of the statistic */
  title: string;
  /** Numerical or text value to display */
  value: string | number;
  /** Icon component to display */
  icon: LucideIcon;
  /** Color scheme configuration */
  colorScheme: {
    /** Gradient background classes (e.g., "from-cyan-500/30 via-purple-500/20 to-pink-500/30") */
    bg: string;
    /** Text color classes for the icon (e.g., "text-cyan-300") */
    iconColor: string;
    /** Title text color classes (e.g., "text-cyan-200/90") */
    titleColor: string;
    /** Value gradient classes (e.g., "from-cyan-300 via-purple-300 to-pink-300") */
    valueGradient: string;
    /** Drop shadow classes for value (e.g., "drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]") */
    valueShadow: string;
    /** Dot colors for orbital elements (e.g., "bg-cyan-400") */
    dotColors: {
      primary: string;
      secondary: string;
    };
  };
  /** Optional children for custom animations inside icon container */
  animationChildren?: React.ReactNode;
}

const ActivityStatCard: React.FC<ActivityStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  colorScheme = 'primary',
  customGradient,
  onClick,
  className = '',
}) => {
  return (
    <PokemonCard
      cardType="metric"
      variant="glass"
      size="md"
      title={title}
      value={value}
      icon={Icon}
      subtitle={subtitle || trendLabel}
      colorScheme={colorScheme}
      customGradient={customGradient}
      onClick={onClick}
      interactive={!!onClick}
      className={className}
    />
  );
}></div>
              </div>
            )}
            
            {/* Custom animations if provided */}
            {animationChildren}
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${colorScheme.titleColor} mb-2 tracking-wider uppercase`}>
            {title}
          </p>
          <p className={`text-3xl font-black bg-gradient-to-r ${colorScheme.valueGradient} bg-clip-text text-transparent ${colorScheme.valueShadow} group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
        </div>
      </div>
    </PokemonCard>
  );
};

export default ActivityStatCard;