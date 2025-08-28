/**
 * OCR Workflow Error Boundary - Specialized Error Handling for OCR Steps
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles OCR-specific errors with context
 * - Open/Closed: Extensible for different OCR error types
 * - Dependency Inversion: Uses base ErrorBoundary functionality
 */

import React, { ReactNode } from 'react';
import { AlertCircle, Camera, FileImage, Layers, Search } from 'lucide-react';
import { ErrorBoundary } from '../../../../components/error/ErrorBoundary';
import { PokemonButton } from '../../../../shared/components/atoms/design-system/PokemonButton';

interface OcrWorkflowError {
  step: 'upload' | 'extract' | 'stitch' | 'ocr' | 'match' | 'approve';
  phase: 'validation' | 'processing' | 'api' | 'rendering';
  context?: {
    imageHashes?: string[];
    scanIds?: string[];
    fileName?: string;
    apiEndpoint?: string;
  };
}

interface OcrWorkflowErrorBoundaryProps {
  children: ReactNode;
  step: OcrWorkflowError['step'];
  onRetryStep?: () => void;
  onResetWorkflow?: () => void;
  onReportIssue?: (error: Error, context: OcrWorkflowError) => void;
}

const stepIcons = {
  upload: Camera,
  extract: FileImage,
  stitch: Layers,
  ocr: Search,
  match: Search,
  approve: AlertCircle,
};

const stepTitles = {
  upload: 'Image Upload',
  extract: 'Label Extraction',
  stitch: 'Label Stitching',
  ocr: 'OCR Processing',
  match: 'Card Matching',
  approve: 'Approval Review',
};

const stepDescriptions = {
  upload: 'Upload and process PSA graded card images',
  extract: 'Extract PSA labels from uploaded images',
  stitch: 'Combine multiple views of the same PSA label',
  ocr: 'Extract text from stitched PSA labels',
  match: 'Match OCR results to card database',
  approve: 'Review and approve matched cards',
};

export const OcrWorkflowErrorBoundary: React.FC<OcrWorkflowErrorBoundaryProps> = ({
  children,
  step,
  onRetryStep,
  onResetWorkflow,
  onReportIssue,
}) => {
  const StepIcon = stepIcons[step];

  const handleOcrError = (error: Error, errorInfo: any) => {
    console.group(`🔴 OCR Workflow Error - ${stepTitles[step]}`);
    console.error('Step:', step);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Create OCR-specific error context
    const ocrContext: OcrWorkflowError = {
      step,
      phase: 'processing', // Default, could be determined from error message
      context: {
        apiEndpoint: `ICR ${step} endpoint`,
      },
    };

    // Call custom error reporter if provided
    if (onReportIssue) {
      onReportIssue(error, ocrContext);
    }

    // Report to performance monitoring with OCR context
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `OCR ${step} error: ${error.message}`,
        fatal: false,
        custom_map: {
          ocr_step: step,
          workflow_phase: ocrContext.phase,
        },
      });
    }
  };

  const customFallback = (
    <div className="min-h-[400px] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800/50 flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* Step Icon with Error Overlay */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <StepIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
          {stepTitles[step]} Error
        </h2>
        
        {/* Error Description */}
        <p className="text-red-700 dark:text-red-300 mb-6 leading-relaxed">
          An error occurred during {stepDescriptions[step].toLowerCase()}. 
          This could be due to network issues, invalid data, or a temporary service problem.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetryStep && (
            <PokemonButton
              variant="primary"
              onClick={onRetryStep}
              className="min-w-[140px]"
            >
              Retry {stepTitles[step]}
            </PokemonButton>
          )}
          
          {onResetWorkflow && (
            <PokemonButton
              variant="secondary"
              onClick={onResetWorkflow}
              className="min-w-[140px]"
            >
              Restart Workflow
            </PokemonButton>
          )}
          
          <PokemonButton
            variant="outline"
            onClick={() => window.location.reload()}
            className="min-w-[140px]"
          >
            Refresh Page
          </PokemonButton>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            Troubleshooting Tips:
          </h3>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 text-left">
            <li>• Check your internet connection</li>
            <li>• Ensure uploaded images are clear and readable</li>
            <li>• Try refreshing the page if the error persists</li>
            {step === 'upload' && <li>• Verify image file format (JPG, PNG supported)</li>}
            {step === 'extract' && <li>• Ensure PSA labels are clearly visible in images</li>}
            {step === 'stitch' && <li>• Check that images contain extracted PSA labels</li>}
            {step === 'ocr' && <li>• Verify stitched images are high quality</li>}
            {step === 'match' && <li>• Ensure OCR text extraction was successful</li>}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={customFallback}
      onError={handleOcrError}
      componentName={`OCR-${stepTitles[step]}`}
      maxRetries={2}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
};

export default OcrWorkflowErrorBoundary;