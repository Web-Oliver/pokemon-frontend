/**
 * DBA Header Galaxy Component (Cosmic Theme)
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying the cosmic header with stats
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 * - DRY: Uses enhanced PokemonPageContainer with cosmic header
 */

import React from 'react';
import { Archive, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import { PokemonPageContainer } from '../design-system/PokemonPageContainer';

interface DbaHeaderGalaxyCosmicProps {
  dbaSelections: any[];
  selectedItems: any[];
  children: React.ReactNode;
}

const DbaHeaderGalaxyCosmic: React.FC<DbaHeaderGalaxyCosmicProps> = ({
  dbaSelections,
  selectedItems,
  children,
}) => {
  const urgentCount =
    dbaSelections?.filter((s) => s.daysRemaining <= 10).length || 0;

  const cosmicHeaderConfig = {
    title: 'DBA Export',
    subtitle: 'Export your collection items to DBA.dk',
    icon: <Archive className="w-5 h-5 text-white" />,
    stats: [
      {
        icon: <Clock className="w-5 h-5" />,
        label: 'Queue',
        value: dbaSelections?.length || 0,
        color: 'blue' as const,
      },
      {
        icon: <AlertTriangle className="w-5 h-5" />,
        label: 'Urgent',
        value: urgentCount,
        color: 'red' as const,
      },
      {
        icon: <CheckSquare className="w-5 h-5" />,
        label: 'Selected',
        value: selectedItems.length,
        color: 'green' as const,
      },
    ],
  };

  return (
    <PokemonPageContainer
      withCosmicHeader={true}
      cosmicHeaderConfig={cosmicHeaderConfig}
      withParticles={true}
      withNeural={true}
    >
      {children}
    </PokemonPageContainer>
  );
};

export default DbaHeaderGalaxyCosmic;