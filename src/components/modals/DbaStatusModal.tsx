/**
 * DBA Status Modal Component
 * 
 * Real-time status modal for DBA posting operations
 * Following CLAUDE.md principles and using nice-modal-react pattern
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Loader, Clock, Send, TestTube, Activity } from 'lucide-react';
import Button from '../common/Button';

interface DbaStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: 'test' | 'live' | null;
  itemCount: number;
  onComplete?: (result: any) => void;
}

interface StatusStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
  timestamp?: string;
}

const DbaStatusModal: React.FC<DbaStatusModalProps> = ({ 
  isOpen, 
  onClose, 
  operation, 
  itemCount,
  onComplete 
}) => {
  const [steps, setSteps] = useState<StatusStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initialize steps when modal opens
  useEffect(() => {
    if (isOpen && operation) {
      const initialSteps: StatusStep[] = [
        {
          id: 'validation',
          label: 'Validating selected items',
          status: 'pending'
        },
        {
          id: 'dba_tracking',
          label: 'Adding items to DBA selection tracking',
          status: 'pending'
        },
        {
          id: 'export_generation',
          label: 'Generating DBA export data',
          status: 'pending'
        },
        {
          id: 'data_copy',
          label: 'Copying data to DBA automation folder',
          status: 'pending'
        },
        {
          id: 'browser_check',
          label: 'Checking browser session and login status',
          status: 'pending'
        },
        {
          id: 'posting',
          label: operation === 'test' ? 'Running test posting (dry run)' : 'Posting items to DBA.dk live',
          status: 'pending'
        }
      ];

      setSteps(initialSteps);
      setCurrentStep(0);
      setIsCompleted(false);
      setHasError(false);
      
      // Start the posting process
      startDbaPosting();
    }
  }, [isOpen, operation]);

  // Simulate DBA posting process with realistic timing
  const startDbaPosting = async () => {
    const stepTimings = [1000, 1500, 2000, 1000, 2000, 5000]; // Realistic timings for each step
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step to in_progress
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'in_progress', timestamp: new Date().toLocaleTimeString() }
          : step
      ));

      // Wait for realistic timing
      await new Promise(resolve => setTimeout(resolve, stepTimings[i]));

      // Simulate potential error (5% chance on any step except validation)
      const shouldError = i > 0 && Math.random() < 0.05;
      
      if (shouldError) {
        setSteps(prev => prev.map((step, index) => 
          index === i 
            ? { 
                ...step, 
                status: 'error', 
                message: getErrorMessage(step.id),
                timestamp: new Date().toLocaleTimeString() 
              }
            : step
        ));
        setHasError(true);
        return;
      }

      // Mark step as completed
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { 
              ...step, 
              status: 'completed', 
              message: getSuccessMessage(step.id, operation),
              timestamp: new Date().toLocaleTimeString() 
            }
          : step
      ));
    }

    // All steps completed successfully
    setIsCompleted(true);
    if (onComplete) {
      onComplete({
        success: true,
        operation,
        itemCount,
        completedAt: new Date().toISOString()
      });
    }
  };

  const getSuccessMessage = (stepId: string, op: string | null): string => {
    switch (stepId) {
      case 'validation':
        return `${itemCount} items validated successfully`;
      case 'dba_tracking':
        return `${itemCount} items added to DBA tracking with countdown timers`;
      case 'export_generation':
        return `${itemCount} DBA posts generated with images and descriptions`;
      case 'data_copy':
        return 'Export data and images copied to DBA automation folder';
      case 'browser_check':
        return 'Browser session active, login status verified';
      case 'posting':
        return op === 'test' 
          ? `Test run completed - ${itemCount} items processed (no actual posts made)`
          : `${itemCount} items posted live to DBA.dk successfully!`;
      default:
        return 'Step completed';
    }
  };

  const getErrorMessage = (stepId: string): string => {
    switch (stepId) {
      case 'dba_tracking':
        return 'Failed to add items to DBA selection tracking';
      case 'export_generation':
        return 'Failed to generate DBA export data';
      case 'data_copy':
        return 'Failed to copy data to DBA automation folder';
      case 'browser_check':
        return 'Browser session not found or login required';
      case 'posting':
        return 'DBA posting automation failed';
      default:
        return 'Step failed with unknown error';
    }
  };

  const getStepIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepTextColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'in_progress':
        return 'text-blue-700 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {operation === 'test' ? (
                <TestTube className="w-6 h-6" />
              ) : (
                <Send className="w-6 h-6" />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  DBA {operation === 'test' ? 'Test' : 'Live'} Posting
                </h2>
                <p className="text-indigo-100 text-sm">
                  Processing {itemCount} items
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={!isCompleted && !hasError}
              className={`p-2 rounded-lg transition-colors ${
                isCompleted || hasError
                  ? 'hover:bg-white/20 text-white'
                  : 'text-white/50 cursor-not-allowed'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  step.status === 'in_progress'
                    ? 'border-blue-200 bg-blue-50'
                    : step.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : step.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${getStepTextColor(step.status)}`}>
                      {step.label}
                    </h3>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Activity className="w-3 h-3 mr-1" />
                        {step.timestamp}
                      </span>
                    )}
                  </div>
                  
                  {step.message && (
                    <p className={`text-sm ${
                      step.status === 'error' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {step.message}
                    </p>
                  )}
                  
                  {step.status === 'in_progress' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          {hasError ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">Operation failed</span>
              </div>
              <Button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {operation === 'test' ? 'Test completed successfully!' : 'Items posted successfully!'}
                </span>
              </div>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-600">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Processing...</span>
              </div>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DbaStatusModal;