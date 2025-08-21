/**
 * SOLID/DRY Implementation: OCR Workflow State Management Hook
 * Single Responsibility: Manage OCR workflow state and transitions
 * Open/Closed: Extensible for new workflow steps without modification
 * DRY: Centralized state logic eliminates duplication
 */

import { useState, useCallback } from 'react';

export type WorkflowStep = 'start' | 'results' | 'card-detail' | 'edit-card' | 'grade-input' | 'complete';
export type TabType = 'upload' | 'bulk';

export interface WorkflowState {
  activeTab: TabType;
  workflowStep: WorkflowStep;
  selectedCard: any | null;
  isEditingCard: boolean;
}

export interface WorkflowActions {
  setActiveTab: (tab: TabType) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  setSelectedCard: (card: any | null) => void;
  setIsEditingCard: (editing: boolean) => void;
  goBack: () => void;
  proceedToGrading: () => void;
  handleEditCard: () => void;
  handlePsaCardSelect: (card: any, psaLabel: any) => void;
  resetWorkflow: () => void;
}

const initialState: WorkflowState = {
  activeTab: 'upload',
  workflowStep: 'start',
  selectedCard: null,
  isEditingCard: false
};

// Workflow step transitions (Open/Closed principle - easy to extend)
const workflowTransitions: Record<WorkflowStep, WorkflowStep[]> = {
  start: ['results'],
  results: ['start', 'card-detail', 'edit-card'],
  'card-detail': ['results', 'edit-card', 'grade-input'],
  'edit-card': ['card-detail', 'results'],
  'grade-input': ['card-detail', 'complete'],
  complete: ['start']
};

export const useOcrWorkflowState = () => {
  const [state, setState] = useState<WorkflowState>(initialState);

  // Safe transition checker
  const canTransitionTo = useCallback((newStep: WorkflowStep): boolean => {
    return workflowTransitions[state.workflowStep].includes(newStep);
  }, [state.workflowStep]);

  // Workflow actions
  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setWorkflowStep = useCallback((step: WorkflowStep) => {
    if (canTransitionTo(step)) {
      setState(prev => ({ ...prev, workflowStep: step }));
    } else {
      console.warn(`Invalid workflow transition: ${state.workflowStep} → ${step}`);
    }
  }, [canTransitionTo, state.workflowStep]);

  const setSelectedCard = useCallback((card: any | null) => {
    setState(prev => ({ ...prev, selectedCard: card }));
  }, []);

  const setIsEditingCard = useCallback((editing: boolean) => {
    setState(prev => ({ ...prev, isEditingCard: editing }));
  }, []);

  // Complex workflow actions
  const goBack = useCallback(() => {
    const { workflowStep, selectedCard } = state;
    
    switch (workflowStep) {
      case 'card-detail':
        setWorkflowStep('results');
        setSelectedCard(null);
        break;
      case 'edit-card':
        // If we came from a "help needed" card, go back to results
        if (selectedCard?.card?.cardName === 'Unknown Card') {
          setWorkflowStep('results');
          setSelectedCard(null);
        } else {
          setWorkflowStep('card-detail');
        }
        setIsEditingCard(false);
        break;
      case 'grade-input':
        setWorkflowStep('card-detail');
        break;
      case 'results':
        setWorkflowStep('start');
        break;
      default:
        console.warn(`No back transition defined for step: ${workflowStep}`);
    }
  }, [state, setWorkflowStep, setSelectedCard, setIsEditingCard]);

  const proceedToGrading = useCallback(() => {
    if (state.selectedCard) {
      setWorkflowStep('grade-input');
    }
  }, [state.selectedCard, setWorkflowStep]);

  const handleEditCard = useCallback(() => {
    setWorkflowStep('edit-card');
    setIsEditingCard(true);
  }, [setWorkflowStep, setIsEditingCard]);

  const handlePsaCardSelect = useCallback((card: any, psaLabel: any) => {
    setSelectedCard({ ...card, psaLabel });
    setWorkflowStep('card-detail');
  }, [setSelectedCard, setWorkflowStep]);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  const actions: WorkflowActions = {
    setActiveTab,
    setWorkflowStep,
    setSelectedCard,
    setIsEditingCard,
    goBack,
    proceedToGrading,
    handleEditCard,
    handlePsaCardSelect,
    resetWorkflow
  };

  return {
    ...state,
    ...actions,
    canTransitionTo
  };
};