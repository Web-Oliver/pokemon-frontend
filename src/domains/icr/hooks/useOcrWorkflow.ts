/**
 * OCR WORKFLOW HOOK - SOLID ARCHITECTURE
 * Single Responsibility: Manage OCR workflow state and navigation
 * Dependency Inversion: Depends on abstractions, not implementations
 */

import { useState, useCallback, useMemo } from 'react';
import { OcrStep, WorkflowState, StepState, StepNavigation } from '@/types/OcrWorkflowTypes';

// INITIAL STATE - DRY: Reusable initialization
const createInitialStepState = (): StepState => ({
  isActive: false,
  isCompleted: false,
  isDisabled: false,
  data: undefined,
  errors: undefined
});

const INITIAL_WORKFLOW_STATE: WorkflowState = {
  currentStep: OcrStep.UPLOAD,
  steps: {
    [OcrStep.UPLOAD]: { ...createInitialStepState(), isActive: true },
    [OcrStep.EXTRACT]: { ...createInitialStepState(), isDisabled: false }, // Allow independent access
    [OcrStep.STITCH]: { ...createInitialStepState(), isDisabled: false }, // Allow independent access
    [OcrStep.OCR_UPDATE]: { ...createInitialStepState(), isDisabled: false }, // Allow independent access
    [OcrStep.MATCH_DISPLAY]: { ...createInitialStepState(), isDisabled: false } // Allow independent access
  },
  globalData: {}
};

// STEP ORDER - Open/Closed: Easy to modify step sequence
const STEP_ORDER: OcrStep[] = [
  OcrStep.UPLOAD, 
  OcrStep.EXTRACT, 
  OcrStep.STITCH, 
  OcrStep.OCR_UPDATE, 
  OcrStep.MATCH_DISPLAY
];

export const useOcrWorkflow = () => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(INITIAL_WORKFLOW_STATE);

  // NAVIGATION LOGIC - Single Responsibility (Independent step navigation)
  const navigation = useMemo((): StepNavigation => {
    const currentIndex = STEP_ORDER.indexOf(workflowState.currentStep);
    return {
      canGoNext: currentIndex < STEP_ORDER.length - 1, // Allow navigation without completion requirement
      canGoPrevious: currentIndex > 0,
      nextStep: currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : undefined,
      previousStep: currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : undefined
    };
  }, [workflowState.currentStep]);

  // STEP COMPLETION - DRY: Reusable completion logic
  const completeStep = useCallback((step: OcrStep, data: unknown) => {
    setWorkflowState(prev => {
      const newSteps = { ...prev.steps };
      
      // Mark current step as completed
      newSteps[step] = {
        ...newSteps[step],
        isCompleted: true,
        data,
        errors: undefined
      };

      // All steps are already enabled for independent access, no need to enable next step

      return {
        ...prev,
        steps: newSteps,
        globalData: { ...prev.globalData, [step]: data }
      };
    });
  }, []);

  // STEP ERROR HANDLING - Single Responsibility
  const setStepError = useCallback((step: OcrStep, error: string) => {
    setWorkflowState(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [step]: {
          ...prev.steps[step],
          errors: [error],
          isCompleted: false
        }
      }
    }));
  }, []);

  // NAVIGATION ACTIONS - DRY: Reusable navigation functions
  const goToStep = useCallback((targetStep: OcrStep) => {
    setWorkflowState(prev => {
      const newSteps = { ...prev.steps };
      
      // Deactivate all steps
      Object.keys(newSteps).forEach(step => {
        newSteps[step as OcrStep] = {
          ...newSteps[step as OcrStep],
          isActive: false
        };
      });

      // Activate target step
      newSteps[targetStep] = {
        ...newSteps[targetStep],
        isActive: true
      };

      return {
        ...prev,
        currentStep: targetStep,
        steps: newSteps
      };
    });
  }, []);

  const goNext = useCallback(() => {
    if (navigation.nextStep) {
      goToStep(navigation.nextStep);
    }
  }, [navigation.nextStep, goToStep]);

  const goPrevious = useCallback(() => {
    if (navigation.previousStep) {
      goToStep(navigation.previousStep);
    }
  }, [navigation.previousStep, goToStep]);

  // RESET WORKFLOW - DRY: Reusable reset
  const resetWorkflow = useCallback(() => {
    setWorkflowState(INITIAL_WORKFLOW_STATE);
  }, []);

  return {
    // STATE
    workflowState,
    navigation,
    
    // ACTIONS
    completeStep,
    setStepError,
    goToStep,
    goNext,
    goPrevious,
    resetWorkflow,
    
    // COMPUTED
    currentStepData: workflowState.steps[workflowState.currentStep]?.data,
    globalData: workflowState.globalData
  };
};