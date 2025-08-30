/**
 * OCR WORKFLOW MAIN COMPONENT - SOLID & DRY
 * Single Responsibility: Orchestrate the complete OCR workflow
 * Open/Closed: Extensible through step configuration
 * DRY: Reusable workflow orchestration with comprehensive error boundaries
 */

import React from 'react';
import { StepWizard } from './StepWizard';
import { OcrWorkflowProvider, useOcrWorkflowContext } from '../context/OcrWorkflowContext';
import { OcrStep } from '@/types/OcrWorkflowTypes';
import { OcrWorkflowErrorBoundary } from './error/OcrWorkflowErrorBoundary';
import { QueryErrorBoundary } from '@/shared/components/error/QueryErrorBoundary';

// STEP COMPONENTS - DRY: Import all step components
import { UploadStep } from './steps/UploadStep';
import { ExtractStep } from './steps/ExtractStep';
import { StitchStep } from './steps/StitchStep';
import { OcrUpdateStep } from './steps/OcrUpdateStep';
import { MatchDisplayStep } from './steps/MatchDisplayStep';

// STEP RENDERER - Single Responsibility with Error Boundaries
const StepRenderer: React.FC = () => {
  const { workflowState, completeStep, setStepError, goToStep } = useOcrWorkflowContext();
  
  const currentStepData = workflowState.steps[workflowState.currentStep];
  
  // Get data from previous steps for current step
  const getStepData = (step: OcrStep) => {
    const stepOrder = [
      OcrStep.UPLOAD, 
      OcrStep.EXTRACT, 
      OcrStep.STITCH, 
      OcrStep.OCR_UPDATE, 
      OcrStep.MATCH_DISPLAY
    ];
    
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex <= 0) return undefined;
    
    const previousStep = stepOrder[currentIndex - 1];
    return workflowState.steps[previousStep]?.data;
  };

  // STEP COMPONENT MAPPING - Open/Closed: Easy to extend
  const stepComponents = {
    [OcrStep.UPLOAD]: UploadStep,
    [OcrStep.EXTRACT]: ExtractStep,
    [OcrStep.STITCH]: StitchStep,
    [OcrStep.OCR_UPDATE]: OcrUpdateStep,
    [OcrStep.MATCH_DISPLAY]: MatchDisplayStep
  };

  const CurrentStepComponent = stepComponents[workflowState.currentStep];

  // Error boundary handlers
  const handleRetryStep = () => {
    // Reset current step status and retry
    setStepError(workflowState.currentStep, null);
    // Force re-render by toggling step active state
    setTimeout(() => {
      // Trigger step re-initialization if needed
      console.log(`Retrying ${workflowState.currentStep} step`);
    }, 100);
  };

  const handleResetWorkflow = () => {
    // Reset to first step
    goToStep(OcrStep.UPLOAD);
  };

  const handleReportIssue = (error: Error, context: any) => {
    console.error('OCR Workflow Issue Report:', { error, context, workflowState });
    // Could integrate with error reporting service here
  };

  // Get step name for error boundary
  const getStepKey = (step: OcrStep): 'upload' | 'extract' | 'stitch' | 'ocr' | 'match' | 'approve' => {
    const stepMap = {
      [OcrStep.UPLOAD]: 'upload' as const,
      [OcrStep.EXTRACT]: 'extract' as const,
      [OcrStep.STITCH]: 'stitch' as const,
      [OcrStep.OCR_UPDATE]: 'ocr' as const,
      [OcrStep.MATCH_DISPLAY]: 'match' as const,
    };
    return stepMap[step] || 'upload';
  };

  return (
    <QueryErrorBoundary
      queryKey={[`ocr-workflow-${workflowState.currentStep}`]}
      onRetry={handleRetryStep}
    >
      <OcrWorkflowErrorBoundary
        step={getStepKey(workflowState.currentStep)}
        onRetryStep={handleRetryStep}
        onResetWorkflow={handleResetWorkflow}
        onReportIssue={handleReportIssue}
      >
        <CurrentStepComponent
          data={getStepData(workflowState.currentStep)}
          onComplete={(data) => completeStep(workflowState.currentStep, data)}
          onError={(error) => setStepError(workflowState.currentStep, error)}
          isActive={currentStepData.isActive}
        />
      </OcrWorkflowErrorBoundary>
    </QueryErrorBoundary>
  );
};

// MAIN WORKFLOW COMPONENT - Single Responsibility  
export const OcrWorkflow: React.FC = () => {
  return (
    <OcrWorkflowProvider>
      <StepWizard>
        <StepRenderer />
      </StepWizard>
    </OcrWorkflowProvider>
  );
};

export default OcrWorkflow;