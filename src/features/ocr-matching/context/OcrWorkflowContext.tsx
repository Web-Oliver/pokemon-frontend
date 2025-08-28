/**
 * OCR WORKFLOW CONTEXT - SOLID & DRY
 * Single Responsibility: Provide workflow state to all components
 * Dependency Inversion: Components depend on context abstraction
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useOcrWorkflow } from '../hooks/useOcrWorkflow';

// CONTEXT TYPE - Interface Segregation
type OcrWorkflowContextType = ReturnType<typeof useOcrWorkflow>;

const OcrWorkflowContext = createContext<OcrWorkflowContextType | undefined>(undefined);

// PROVIDER COMPONENT - Single Responsibility
export const OcrWorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const workflowState = useOcrWorkflow();

  return (
    <OcrWorkflowContext.Provider value={workflowState}>
      {children}
    </OcrWorkflowContext.Provider>
  );
};

// HOOK TO USE CONTEXT - DRY: Reusable context access
export const useOcrWorkflowContext = (): OcrWorkflowContextType => {
  const context = useContext(OcrWorkflowContext);
  if (!context) {
    throw new Error('useOcrWorkflowContext must be used within OcrWorkflowProvider');
  }
  return context;
};