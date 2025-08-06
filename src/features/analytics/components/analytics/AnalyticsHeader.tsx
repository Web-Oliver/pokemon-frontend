/**
 * AnalyticsHeader Component - Analytics Page Header
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for analytics header display
 * - Reusability: Header pattern reusable across analytics pages
 * - Layer 3: Pure UI component
 */

import { BarChart3 } from 'lucide-react';
import React from 'react';
import GlassmorphismHeader from '../common/GlassmorphismHeader';

export interface AnalyticsHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title = 'Analytics Dashboard',
  subtitle = 'Comprehensive analytics and insights for your collection',
  className = '',
}) => {
  return (
    <GlassmorphismHeader
      icon={BarChart3}
      title={title}
      description={subtitle}
      className={className}
    />
  );
};

export default AnalyticsHeader;
