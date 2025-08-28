import React from 'react';
import { MatchingProvider } from '../context/MatchingContext';
import { MatchingInterface } from '../components/MatchingInterface';
import { PokemonPageContainer } from '../../../shared/components/atoms/design-system/PokemonPageContainer';

/**
 * Dedicated Card Matching Workflow Page
 * 
 * Independent matching interface for processing OCR-completed scans
 * and matching them against the card database.
 */
export const MatchingWorkflow: React.FC = () => {
  return (
    <PokemonPageContainer>
      <MatchingProvider>
        <MatchingInterface />
      </MatchingProvider>
    </PokemonPageContainer>
  );
};

export default MatchingWorkflow;