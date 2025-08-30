/**
 * STEP WIZARD - SOLID & DRY ARCHITECTURE
 * Single Responsibility: Manage step navigation and rendering
 * Open/Closed: Extensible through step configuration
 * DRY: Reusable wizard component for any multi-step process
 */

import React from 'react';
import { OcrStep } from '@/types/OcrWorkflowTypes';
import { useOcrWorkflowContext } from '@/domains/icr/context/OcrWorkflowContext';

// STEP CONFIGURATION - DRY: Reusable step definitions
interface StepDefinition {
  id: OcrStep;
  title: string;
  description: string;
  icon: string;
}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: OcrStep.UPLOAD,
    title: '1. Upload',
    description: 'Upload card images',
    icon: '📤'
  },
  {
    id: OcrStep.EXTRACT,
    title: '2. Extract Labels', 
    description: 'Extract PSA labels from images',
    icon: '🏷️'
  },
  {
    id: OcrStep.STITCH,
    title: '3. Stitch',
    description: 'Combine label parts',
    icon: '🧩'
  },
  {
    id: OcrStep.OCR_UPDATE,
    title: '4. OCR & Update',
    description: 'Extract text and update PSA data',
    icon: '🔍'
  },
  {
    id: OcrStep.MATCH_DISPLAY,
    title: '5. Match & Display',
    description: 'Match cards and show results',
    icon: '🎯'
  }
];

// STEP INDICATOR - DRY: Reusable progress indicator
const StepIndicator: React.FC<{
  steps: StepDefinition[];
  currentStep: OcrStep;
  stepStates: ReturnType<typeof useOcrWorkflowContext>['workflowState']['steps'];
  onStepClick: (step: OcrStep) => void;
}> = ({ steps, currentStep, stepStates, onStepClick }) => (
  <div className="flex items-center justify-center mb-8 space-x-4">
    {steps.map((step, index) => {
      const state = stepStates[step.id];
      const isActive = currentStep === step.id;
      const isCompleted = state.isCompleted;
      const isDisabled = state.isDisabled;

      return (
        <React.Fragment key={step.id}>
          <button
            onClick={() => !isDisabled && onStepClick(step.id)}
            disabled={isDisabled}
            className={`
              flex flex-col items-center p-4 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                : isCompleted 
                  ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700' 
                  : isDisabled 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700'
              }
            `}
          >
            <div className="text-2xl mb-2">{step.icon}</div>
            <div className="text-sm font-semibold">{step.title}</div>
            <div className="text-xs opacity-75">{step.description}</div>
          </button>
          {index < steps.length - 1 && (
            <div className={`
              h-1 w-8 transition-colors duration-200
              ${state.isCompleted ? 'bg-green-500' : 'bg-gray-600'}
            `} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// NAVIGATION CONTROLS - DRY: Reusable navigation buttons
const NavigationControls: React.FC<{
  navigation: ReturnType<typeof useOcrWorkflowContext>['navigation'];
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}> = ({ navigation, onNext, onPrevious, onReset }) => (
  <div className="flex items-center justify-between mt-8 p-4 bg-gray-800/50 rounded-lg">
    <button
      onClick={onPrevious}
      disabled={!navigation.canGoPrevious}
      className={`
        px-6 py-2 rounded-lg font-medium transition-all duration-200
        ${navigation.canGoPrevious
          ? 'bg-gray-600 hover:bg-gray-700 text-white'
          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      ← Previous
    </button>

    <button
      onClick={onReset}
      className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
    >
      🔄 Reset Workflow
    </button>

    <button
      onClick={onNext}
      disabled={!navigation.canGoNext}
      className={`
        px-6 py-2 rounded-lg font-medium transition-all duration-200
        ${navigation.canGoNext
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      Next →
    </button>
  </div>
);

// MAIN WIZARD COMPONENT - Single Responsibility
export const StepWizard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { 
    workflowState, 
    navigation, 
    goToStep, 
    goNext, 
    goPrevious, 
    resetWorkflow 
  } = useOcrWorkflowContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">OCR Card Processing Workflow</h1>
          <p className="text-gray-400 text-lg">Complete each step to process your Pokemon cards</p>
        </div>

        {/* STEP INDICATOR */}
        <StepIndicator
          steps={STEP_DEFINITIONS}
          currentStep={workflowState.currentStep}
          stepStates={workflowState.steps}
          onStepClick={goToStep}
        />

        {/* STEP CONTENT */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-8 mb-8 min-h-[600px]">
          {children}
        </div>

        {/* NAVIGATION */}
        <NavigationControls
          navigation={navigation}
          onNext={goNext}
          onPrevious={goPrevious}
          onReset={resetWorkflow}
        />
      </div>
    </div>
  );
};