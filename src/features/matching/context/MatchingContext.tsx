import React, { createContext, useContext, ReactNode } from 'react';
import { useMatchingWorkflow } from '../hooks/useMatchingWorkflow';

interface MatchingContextType {
  scansReadyForMatching: any[];
  isLoading: boolean;
  error: string | null;
  selectedScan: any | null;
  setSelectedScan: (scan: any | null) => void;
  matchResults: any;
  isMatching: boolean;
  performMatching: (imageHashes: string[]) => Promise<void>;
  createPsaCard: (cardData: any) => Promise<void>;
  isCreating: boolean;
}

const MatchingContext = createContext<MatchingContextType | undefined>(undefined);

export const useMatchingContext = () => {
  const context = useContext(MatchingContext);
  if (!context) {
    throw new Error('useMatchingContext must be used within a MatchingProvider');
  }
  return context;
};

interface MatchingProviderProps {
  children: ReactNode;
}

export const MatchingProvider: React.FC<MatchingProviderProps> = ({ children }) => {
  const matchingWorkflowData = useMatchingWorkflow();

  return (
    <MatchingContext.Provider value={matchingWorkflowData}>
      {children}
    </MatchingContext.Provider>
  );
};