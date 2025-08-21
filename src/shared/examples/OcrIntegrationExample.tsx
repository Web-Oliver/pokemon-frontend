/**
 * OCR Integration Example Component
 * 
 * Demonstrates how to use the complete OCR card detection system
 * This serves as both documentation and a testing component
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/primitives/Card';
import { EnhancedImageUploader } from '../../components/EnhancedImageUploader';
import { CardSuggestions } from '../components/molecules/common/CardSuggestions';
import { useOcrDetection } from '../hooks/useOcrDetection';
import { 
  CardType, 
  CardSuggestion, 
  EnhancedOcrResult,
  TextValidationResult 
} from '../types/ocr';
import { Play, FileText, Database, Zap } from 'lucide-react';

/**
 * Main OCR Integration Example
 */
// Debug log interface
interface DebugLog {
  timestamp: string;
  step: string;
  status: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  message: string;
}

export const OcrIntegrationExample: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardSuggestion | null>(null);
  const [ocrResults, setOcrResults] = useState<EnhancedOcrResult[]>([]);
  const [textValidation, setTextValidation] = useState<TextValidationResult | null>(null);
  const [testText, setTestText] = useState('2019 P M S M BLACK STAR CHARIZARD - HOLO #SM226');
  const [selectedCardType, setSelectedCardType] = useState<CardType>(CardType.PSA_LABEL);
  
  // 🔥 COMPREHENSIVE DEBUG LOGGING 🔥
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const [debugPanelMode, setDebugPanelMode] = useState<'compact' | 'detailed' | 'split'>('compact');
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Add debug log entry
  const addDebugLog = useCallback((step: string, status: DebugLog['status'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      step,
      status,
      message,
      data
    };
    console.log(`[OCR DEBUG ${status.toUpperCase()}] ${step}: ${message}`, data);
    setDebugLogs(prev => {
      const newLogs = [...prev.slice(-49), log]; // Keep last 50 logs
      // Auto-scroll to bottom if enabled
      if (autoScroll) {
        setTimeout(() => {
          const anchor = document.getElementById('debug-scroll-anchor');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      return newLogs;
    });
  }, [autoScroll]);
  
  // Update current processing step
  const updateProcessingStep = useCallback((step: string) => {
    setCurrentStep(step);
    setProcessingSteps(prev => [...prev, step]);
    addDebugLog('PROCESS', 'info', `Current step: ${step}`);
  }, [addDebugLog]);
  
  // Clear debug logs
  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
    setProcessingSteps([]);
    setCurrentStep('');
    // Don't use addDebugLog here to avoid infinite recursion
    const clearLog: DebugLog = {
      timestamp: new Date().toISOString(),
      step: 'SYSTEM',
      status: 'info',
      message: '🗑️ Debug logs cleared and reset'
    };
    setDebugLogs([clearLog]);
  }, []);
  
  // Initialize debug logging
  React.useEffect(() => {
    addDebugLog('INIT', 'info', 'OCR Integration Example initialized', {
      selectedCardType,
      timestamp: new Date().toISOString()
    });
  }, [addDebugLog, selectedCardType]);

  // OCR detection hook
  const {
    processImage,
    validateText,
    getCardSuggestions,
    isProcessing,
    error,
    lastResult
  } = useOcrDetection({
    cardType: selectedCardType,
    enableCache: true
  });

  // Handle card detection from image upload
  const handleCardDetected = useCallback((card: CardSuggestion, result: EnhancedOcrResult) => {
    updateProcessingStep('CARD_DETECTED');
    addDebugLog('DETECTION', 'success', `Card detected: ${card.cardName}`, {
      cardId: card._id,
      cardName: card.cardName,
      setName: card.setId?.setName,
      matchScore: card.matchScore,
      confidence: result.confidence,
      textLength: result.text?.length || 0
    });
    setSelectedCard(card);
  }, [updateProcessingStep, addDebugLog]);

  // Handle OCR completion
  const handleOcrComplete = useCallback((results: EnhancedOcrResult[]) => {
    updateProcessingStep('OCR_COMPLETED');
    addDebugLog('OCR', 'success', `OCR processing completed with ${results.length} results`, {
      resultCount: results.length,
      avgConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length,
      totalTextLength: results.reduce((sum, r) => sum + (r.text?.length || 0), 0),
      suggestionsTotal: results.reduce((sum, r) => sum + (r.cardDetection?.suggestions?.length || 0), 0)
    });
    setOcrResults(results);
  }, [updateProcessingStep, addDebugLog]);

  // Test text validation
  const handleValidateText = useCallback(async () => {
    try {
      updateProcessingStep('TEXT_VALIDATION_START');
      addDebugLog('VALIDATION', 'info', `Starting text validation for: "${testText.substring(0, 50)}..."`, {
        textLength: testText.length,
        wordCount: testText.split(' ').length
      });
      
      const result = await validateText(testText);
      
      updateProcessingStep('TEXT_VALIDATION_SUCCESS');
      addDebugLog('VALIDATION', 'success', 'Text validation completed successfully', {
        quality: result.analysis?.quality,
        wordCount: result.analysis?.wordCount,
        potentialCards: result.analysis?.potentialCardNames?.length || 0,
        potentialYears: result.analysis?.potentialYears?.length || 0,
        recommendationsCount: result.recommendations?.length || 0
      });
      
      setTextValidation(result);
    } catch (error: any) {
      updateProcessingStep('TEXT_VALIDATION_ERROR');
      addDebugLog('VALIDATION', 'error', `Text validation failed: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        textInput: testText
      });
      console.error('Text validation failed:', error);
    }
  }, [testText, validateText, updateProcessingStep, addDebugLog]);

  // Test card suggestions
  const handleTestSuggestions = useCallback(async () => {
    if (selectedCard) {
      try {
        updateProcessingStep('GETTING_SUGGESTIONS');
        addDebugLog('SUGGESTIONS', 'info', `Getting additional suggestions for card: ${selectedCard.cardName}`, {
          cardId: selectedCard._id,
          cardName: selectedCard.cardName
        });
        
        const suggestions = await getCardSuggestions(selectedCard._id);
        
        updateProcessingStep('SUGGESTIONS_SUCCESS');
        addDebugLog('SUGGESTIONS', 'success', `Retrieved ${suggestions.length} additional suggestions`, {
          suggestionsCount: suggestions.length,
          cardNames: suggestions.map(s => s.cardName).slice(0, 5)
        });
      } catch (error: any) {
        updateProcessingStep('SUGGESTIONS_ERROR');
        addDebugLog('SUGGESTIONS', 'error', `Getting suggestions failed: ${error.message}`, {
          error: error.message,
          cardId: selectedCard._id
        });
        console.error('Getting suggestions failed:', error);
      }
    } else {
      addDebugLog('SUGGESTIONS', 'warning', 'No card selected for suggestions');
    }
  }, [selectedCard, getCardSuggestions, updateProcessingStep, addDebugLog]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          OCR Card Detection Integration - DEBUG MODE 🔧
        </h1>
        <p className="text-gray-600">
          Complete demonstration with comprehensive step-by-step debugging
        </p>
        
        {/* Debug Controls */}
        <div className="mt-4 flex justify-center space-x-2 flex-wrap">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              showDebugPanel 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showDebugPanel ? '🔇 Hide Debug' : '🔊 Show Debug'}
          </button>
          
          {showDebugPanel && (
            <>
              <select
                value={debugPanelMode}
                onChange={(e) => setDebugPanelMode(e.target.value as 'compact' | 'detailed' | 'split')}
                className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-900"
              >
                <option value="compact">📋 Compact Mode</option>
                <option value="detailed">📊 Detailed Mode</option>
                <option value="split">📱 Split Mode</option>
              </select>
              
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  autoScroll ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                {autoScroll ? '📜 Auto Scroll ON' : '⏸️ Auto Scroll OFF'}
              </button>
              
              <button
                onClick={clearDebugLogs}
                className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700"
              >
                🗑️ Clear
              </button>
            </>
          )}
        </div>
        
        {/* Current Step Indicator */}
        {currentStep && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Current Step:</div>
            <div className="text-lg font-bold text-blue-700">{currentStep}</div>
            <div className="text-xs text-blue-600 mt-1">
              Step {processingSteps.length} of process
            </div>
          </div>
        )}
      </div>
      
      {/* 🔥 COMPREHENSIVE DEBUG PANEL 🔥 */}
      {showDebugPanel && (
        <div className={`
          rounded-lg font-mono border-2
          ${debugPanelMode === 'compact' ? 'bg-slate-900 text-green-400 border-slate-600' :
            debugPanelMode === 'detailed' ? 'bg-gray-900 text-cyan-400 border-gray-600' :
            'bg-black text-amber-400 border-amber-600'}
        `}>
          
          {/* Debug Panel Header */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <h3 className={`font-bold text-lg flex items-center space-x-2 ${
                debugPanelMode === 'compact' ? 'text-green-400' :
                debugPanelMode === 'detailed' ? 'text-cyan-400' :
                'text-amber-400'
              }`}>
                <span>🔧</span>
                <span>DEBUG CONSOLE</span>
                <span className="text-sm font-normal">({debugPanelMode.toUpperCase()})</span>
              </h3>
              <div className="text-xs opacity-70">
                {debugLogs.length} logs | {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {/* Quick Stats */}
            {debugPanelMode !== 'compact' && (
              <div className="mt-2 flex space-x-4 text-xs">
                <span className="text-green-400">✅ Success: {debugLogs.filter(l => l.status === 'success').length}</span>
                <span className="text-red-400">❌ Errors: {debugLogs.filter(l => l.status === 'error').length}</span>
                <span className="text-yellow-400">⚠️ Warnings: {debugLogs.filter(l => l.status === 'warning').length}</span>
                <span className="text-blue-400">ℹ️ Info: {debugLogs.filter(l => l.status === 'info').length}</span>
              </div>
            )}
          </div>
          
          {/* Debug Logs Container */}
          <div className={`
            p-4 overflow-y-auto
            ${debugPanelMode === 'compact' ? 'max-h-64' :
              debugPanelMode === 'detailed' ? 'max-h-96' :
              'max-h-[500px]'}
          `}>
            {debugLogs.length === 0 ? (
              <div className="text-center py-8 opacity-60">
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm">No debug logs yet... Start interacting with the OCR system!</div>
              </div>
            ) : (
              <div className="space-y-2">
                {debugLogs.map((log, index) => (
                  <div key={index}>
                    {/* Compact Mode */}
                    {debugPanelMode === 'compact' && (
                      <div className={`flex items-center space-x-3 p-2 rounded border-l-4 ${
                        log.status === 'error' ? 'bg-red-900/30 border-red-400 text-red-200' :
                        log.status === 'success' ? 'bg-green-900/30 border-green-400 text-green-200' :
                        log.status === 'warning' ? 'bg-yellow-900/30 border-yellow-400 text-yellow-200' :
                        'bg-blue-900/30 border-blue-400 text-blue-200'
                      }`}>
                        <span className="text-xs opacity-70 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs font-bold">
                          [{log.step}]
                        </span>
                        <span className="text-xs flex-1">{log.message}</span>
                        {log.data && <span className="text-xs opacity-60">📊</span>}
                      </div>
                    )}
                    
                    {/* Detailed Mode */}
                    {debugPanelMode === 'detailed' && (
                      <div className={`p-3 rounded-lg border ${
                        log.status === 'error' ? 'bg-red-900/20 border-red-500 text-red-100' :
                        log.status === 'success' ? 'bg-green-900/20 border-green-500 text-green-100' :
                        log.status === 'warning' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-100' :
                        'bg-blue-900/20 border-blue-500 text-blue-100'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold ${
                            log.status === 'error' ? 'text-red-400' :
                            log.status === 'success' ? 'text-green-400' :
                            log.status === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            [{log.step}] {log.status.toUpperCase()}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm mb-2">{log.message}</div>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                              📊 View Data ({Object.keys(log.data).length} fields)
                            </summary>
                            <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-x-auto border border-gray-600">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                    
                    {/* Split Mode */}
                    {debugPanelMode === 'split' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-2 rounded border-l-4 ${
                          log.status === 'error' ? 'bg-red-900/30 border-red-400' :
                          log.status === 'success' ? 'bg-green-900/30 border-green-400' :
                          log.status === 'warning' ? 'bg-yellow-900/30 border-yellow-400' :
                          'bg-blue-900/30 border-blue-400'
                        }`}>
                          <div className={`text-xs font-bold mb-1 ${
                            log.status === 'error' ? 'text-red-400' :
                            log.status === 'success' ? 'text-green-400' :
                            log.status === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            {new Date(log.timestamp).toLocaleTimeString()} - [{log.step}]
                          </div>
                          <div className="text-xs text-amber-100">{log.message}</div>
                        </div>
                        {log.data && (
                          <div className="p-2 bg-black/40 rounded border border-amber-600">
                            <div className="text-xs text-amber-400 mb-1 font-bold">Data:</div>
                            <pre className="text-xs text-amber-100 overflow-x-auto">
                              {JSON.stringify(log.data, null, 1)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            {autoScroll && <div id="debug-scroll-anchor" />}
          </div>
        </div>
      )}

      {/* Enhanced Status Overview with Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>System Status & Debug Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isProcessing ? '⏳' : '✅'}
              </div>
              <div className="text-sm text-gray-600">OCR Service</div>
              <div className="text-xs text-gray-500 mt-1">
                {isProcessing ? 'Processing...' : 'Ready'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ocrResults.length}
              </div>
              <div className="text-sm text-gray-600">Processed Images</div>
              <div className="text-xs text-gray-500 mt-1">
                Total results
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedCard ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Selected Cards</div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedCard ? selectedCard.cardName.substring(0, 15) + '...' : 'None selected'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {error ? '❌' : '✅'}
              </div>
              <div className="text-sm text-gray-600">Error Status</div>
              <div className="text-xs text-gray-500 mt-1">
                {error ? 'Has errors' : 'No errors'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {debugLogs.length}
              </div>
              <div className="text-sm text-gray-600">Debug Logs</div>
              <div className="text-xs text-gray-500 mt-1">
                Total logged
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {processingSteps.length}
              </div>
              <div className="text-sm text-gray-600">Process Steps</div>
              <div className="text-xs text-gray-500 mt-1">
                Steps completed
              </div>
            </div>
          </div>
          
          {/* Real-time Process Flow */}
          {processingSteps.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Process Flow:</div>
              <div className="flex flex-wrap gap-2">
                {processingSteps.map((step, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      index === processingSteps.length - 1 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}. {step.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium text-sm">Current Error:</div>
              <div className="text-red-600 text-xs mt-1">{error.message}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Upload with OCR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-green-600" />
            <span>1. Upload & Detect Cards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Card Type Selector */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Select Card Type (Manual Override):
            </label>
            <select
              value={selectedCardType}
              onChange={(e) => setSelectedCardType(e.target.value as CardType)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
            >
              <option value={CardType.PSA_LABEL}>🏆 PSA Graded Card Label</option>
              <option value={CardType.ENGLISH_POKEMON}>🇺🇸 English Pokemon Card</option>
              <option value={CardType.JAPANESE_POKEMON}>🇯🇵 Japanese Pokemon Card</option>
              <option value={CardType.GENERIC}>🔍 Generic Card (Auto-detect)</option>
            </select>
            <p className="text-xs text-blue-600 mt-1">
              Choose the type that matches your uploaded image for best results
            </p>
          </div>

          <EnhancedImageUploader
            onImagesChange={(files) => console.log('Files changed:', files)}
            onCardDetected={handleCardDetected}
            onOcrComplete={handleOcrComplete}
            enableOcr={true}
            autoDetectCardType={false}
            cardType={selectedCardType}
            showOcrPreview={true}
            enableBatchOcr={true}
            maxFiles={5}
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Text Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>2. Text Quality Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test OCR Text:
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter text to validate..."
              />
            </div>
            
            <button
              onClick={handleValidateText}
              disabled={!testText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Validate Text Quality
            </button>

            {textValidation && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Validation Results:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quality:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${
                      textValidation.analysis.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                      textValidation.analysis.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                      textValidation.analysis.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {textValidation.analysis.quality}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Word Count:</span> {textValidation.analysis.wordCount}
                  </div>
                  <div>
                    <span className="font-medium">Potential Cards:</span> {textValidation.analysis.potentialCardNames.length}
                  </div>
                  <div>
                    <span className="font-medium">Years Found:</span> {textValidation.analysis.potentialYears.length}
                  </div>
                </div>
                
                {textValidation.recommendations.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium">Recommendations:</span>
                    <ul className="mt-1 space-y-1">
                      {textValidation.recommendations.map((rec, index) => (
                        <li key={index} className={`text-xs flex items-center space-x-2 ${
                          rec.type === 'success' ? 'text-green-600' :
                          rec.type === 'warning' ? 'text-yellow-600' :
                          rec.type === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          <span>{rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : rec.type === 'error' ? '❌' : 'ℹ️'}</span>
                          <span>{rec.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Card Display */}
      {selectedCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span>3. Selected Card Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-lg text-purple-900">{selectedCard.cardName}</h4>
                  <p className="text-purple-700">
                    <span className="font-medium">
                      {selectedCard.setId?.setName || selectedCard.setDisplayName || selectedCard.setName || 'Unknown Set'}
                    </span>
                    {(selectedCard.setId?.year || selectedCard.year) && (
                      <span> ({selectedCard.setId?.year || selectedCard.year})</span>
                    )}
                    {!(selectedCard.setId?.setName || selectedCard.setDisplayName || selectedCard.setName) && (
                      <span className="text-red-500 ml-2">⚠️ Missing set data</span>
                    )}
                  </p>
                  <p className="text-sm text-purple-600">#{selectedCard.cardNumber}</p>
                  {selectedCard.variety && (
                    <p className="text-sm text-purple-600">Variety: {selectedCard.variety}</p>
                  )}
                </div>
                <div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Match Score:</span> {selectedCard.matchScore && !isNaN(selectedCard.matchScore) ? Math.round(selectedCard.matchScore) : 0}%</div>
                    <div><span className="font-medium">Card ID:</span> {selectedCard._id}</div>
                    {selectedCard.grades && (
                      <>
                        <div><span className="font-medium">PSA Population:</span> {selectedCard.grades.grade_total.toLocaleString()}</div>
                        <div><span className="font-medium">PSA 10s:</span> {selectedCard.grades.grade_10.toLocaleString()}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleTestSuggestions}
                  className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                >
                  Get Similar Cards
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Results Display */}
      {ocrResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>OCR Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ocrResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Result #{index + 1}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-sm font-medium mb-1">Extracted Text:</div>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                      {result.text.substring(0, 500)}
                      {result.text.length > 500 ? '...' : ''}
                    </div>
                  </div>

                  {result.cardDetection && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Card Detection ({result.cardDetection.suggestions.length} suggestions):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.cardDetection.suggestions.slice(0, 4).map((suggestion, i) => (
                          <div key={i} className="bg-blue-50 rounded p-2 text-xs">
                            <div className="font-medium">{suggestion.cardName}</div>
                            <div className="text-blue-700">
                              <span className="font-medium">
                                {suggestion.setId?.setName || suggestion.setDisplayName || suggestion.setName || 'Unknown Set'}
                              </span>
                              {(suggestion.setId?.year || suggestion.year) && (
                                <span className="text-blue-600 ml-1">({suggestion.setId?.year || suggestion.year})</span>
                              )}
                              {!(suggestion.setId?.setName || suggestion.setDisplayName || suggestion.setName) && (
                                <span className="text-red-500 text-xs ml-1">⚠️ No set data</span>
                              )}
                            </div>
                            <div className="text-blue-600">{suggestion.matchScore && !isNaN(suggestion.matchScore) ? Math.round(suggestion.matchScore) : 0}% match</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">OCR Processing Error</div>
              <div className="text-red-600 text-sm mt-1">{error.message}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use This Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose text-sm">
            <ol className="space-y-2">
              <li><strong>Upload Images:</strong> Drag and drop or click to upload Pokemon card images or PSA label photos</li>
              <li><strong>Automatic Processing:</strong> OCR will automatically detect text and suggest matching cards</li>
              <li><strong>Review Suggestions:</strong> Select the best matching card from the intelligent suggestions</li>
              <li><strong>Validate Quality:</strong> Use the text validation tool to check OCR accuracy</li>
              <li><strong>Integration:</strong> Selected cards can be automatically added to forms or collections</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <strong>Supported Card Types:</strong>
              <ul className="mt-1 space-y-1">
                <li>• PSA/BGS Graded card labels</li>
                <li>• English Pokemon trading cards</li>
                <li>• Japanese Pokemon cards (with script detection)</li>
                <li>• Generic card text recognition</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OcrIntegrationExample;