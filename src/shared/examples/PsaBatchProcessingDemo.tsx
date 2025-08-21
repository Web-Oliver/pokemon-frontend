/**
 * PSA Batch Processing Demo
 * 
 * Demonstrates the image stitching functionality for PSA label batch processing
 * Shows cost optimization and efficiency improvements
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/primitives/Card';
import { EnhancedImageUploader } from '../../components/EnhancedImageUploader';
import { ImageStitchingService } from '../services/ImageStitchingService';
import { useOcrDetection } from '../hooks/useOcrDetection';
import { CardType, EnhancedOcrResult } from '../types/ocr';
import { 
  Grid, 
  Zap, 
  DollarSign, 
  Clock, 
  Image as ImageIcon,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProcessingStats {
  individualCost: number;
  batchCost: number;
  savings: number;
  savingsPercentage: number;
  processingTime: number;
  compressionRatio: number;
  gridSize: string;
}

export const PsaBatchProcessingDemo: React.FC = () => {
  const [stitchingEnabled, setStitchingEnabled] = useState(true);
  const [processedImages, setProcessedImages] = useState<File[]>([]);
  const [ocrResults, setOcrResults] = useState<EnhancedOcrResult[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [stitchPreview, setStitchPreview] = useState<string | null>(null);

  const {
    processBatch,
    isProcessing,
    error,
    lastBatchResults
  } = useOcrDetection({
    cardType: CardType.PSA_LABEL,
    enableBatch: true
  });

  // Handle batch processing
  const handleBatchProcess = useCallback(async (files: File[]) => {
    if (files.length < 2) return;

    console.log(`[PSA Demo] Processing ${files.length} PSA labels`);
    setProcessedImages(files);

    try {
      const startTime = Date.now();

      // Calculate costs
      const individualCost = files.length * 0.0015; // $0.0015 per image
      const batchCost = 0.0015; // Single API call
      const savings = individualCost - batchCost;
      const savingsPercentage = (savings / individualCost) * 100;

      // Test image stitching first
      if (stitchingEnabled) {
        try {
          const stitchResult = await ImageStitchingService.stitchPsaLabels(files, {
            maxWidth: 2048,
            maxHeight: 2048,
            cropToLabel: true,
            orientation: 'grid'
          });

          // Create preview URL
          const previewUrl = URL.createObjectURL(stitchResult.stitchedFile);
          setStitchPreview(previewUrl);

          // Calculate stats
          const processingTime = Date.now() - startTime;
          const stats: ProcessingStats = {
            individualCost,
            batchCost,
            savings,
            savingsPercentage,
            processingTime,
            compressionRatio: stitchResult.compressionRatio,
            gridSize: `${stitchResult.gridDimensions.rows}×${stitchResult.gridDimensions.cols}`
          };
          setProcessingStats(stats);

          console.log(`[PSA Demo] Stitching complete:`, {
            gridSize: stats.gridSize,
            compressionRatio: stats.compressionRatio,
            savings: `$${savings.toFixed(4)} (${savingsPercentage.toFixed(1)}%)`
          });

        } catch (error) {
          console.error('[PSA Demo] Stitching failed:', error);
        }
      }

      // Process with OCR
      const results = await processBatch(files, {
        cardType: CardType.PSA_LABEL,
        enableImageStitching: stitchingEnabled,
        enableBatchProcessing: true
      });

      setOcrResults(results);

    } catch (error) {
      console.error('[PSA Demo] Batch processing failed:', error);
    }
  }, [processBatch, stitchingEnabled]);

  // Clear results
  const handleClear = useCallback(() => {
    setProcessedImages([]);
    setOcrResults([]);
    setProcessingStats(null);
    if (stitchPreview) {
      URL.revokeObjectURL(stitchPreview);
      setStitchPreview(null);
    }
  }, [stitchPreview]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PSA Label Batch Processing Demo
        </h1>
        <p className="text-gray-600">
          Experience up to 90% cost reduction with intelligent image stitching
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Grid className="h-5 w-5 text-blue-600" />
              <span>Batch Processing Controls</span>
            </span>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={stitchingEnabled}
                onChange={(e) => setStitchingEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable Image Stitching</span>
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Smart Stitching</div>
              <div className="text-xs text-gray-600">
                {stitchingEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Cost Optimization</div>
              <div className="text-xs text-gray-600">
                {stitchingEnabled ? 'Up to 90% savings' : 'Standard pricing'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Processing Speed</div>
              <div className="text-xs text-gray-600">
                {stitchingEnabled ? '2-3x faster' : 'Standard speed'}
              </div>
            </div>
          </div>

          <EnhancedImageUploader
            onImagesChange={() => {}} // Handled by onOcrComplete
            onOcrComplete={handleBatchProcess}
            enableOcr={false} // We'll handle OCR manually
            enableBatchOcr={true}
            maxFiles={10}
            multiple={true}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
          />
        </CardContent>
      </Card>

      {/* Processing Stats */}
      {processingStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <span>Cost & Performance Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  ${processingStats.individualCost.toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">Individual Processing</div>
                <div className="text-xs text-gray-500">
                  {processedImages.length} × $0.0015
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${processingStats.batchCost.toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">Batch Processing</div>
                <div className="text-xs text-gray-500">
                  1 API call
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${processingStats.savings.toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">Total Savings</div>
                <div className="text-xs text-gray-500">
                  {processingStats.savingsPercentage.toFixed(1)}% reduction
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {processingStats.gridSize}
                </div>
                <div className="text-sm text-gray-600">Grid Layout</div>
                <div className="text-xs text-gray-500">
                  {processingStats.compressionRatio.toFixed(1)}x compression
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stitched Image Preview */}
      {stitchPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-orange-600" />
              <span>Stitched Image Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4">
              <img
                src={stitchPreview}
                alt="Stitched PSA Labels"
                className="max-w-full h-auto mx-auto rounded"
                style={{ maxHeight: '400px' }}
              />
              <div className="text-center mt-2 text-sm text-gray-600">
                Optimized grid layout of {processedImages.length} PSA labels
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Results */}
      {ocrResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>OCR Results ({ocrResults.length} labels)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ocrResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">Label #{index + 1}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2 mb-2">
                    <div className="text-xs font-medium mb-1">Extracted Text:</div>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">
                      {result.text.substring(0, 200)}
                      {result.text.length > 200 ? '...' : ''}
                    </div>
                  </div>

                  {result.cardDetection?.suggestions && result.cardDetection.suggestions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1">
                        Top Match:
                      </div>
                      <div className="bg-blue-50 rounded p-2 text-xs">
                        <div className="font-medium">
                          {result.cardDetection.suggestions[0].cardName}
                        </div>
                        <div className="text-blue-700">
                          {result.cardDetection.suggestions[0].setId?.setName || 'Unknown Set'} ({result.cardDetection.suggestions[0].setId?.year || 'Unknown Year'})
                        </div>
                        <div className="text-blue-600">
                          {result.cardDetection.suggestions[0].matchScore && !isNaN(result.cardDetection.suggestions[0].matchScore) ? Math.round(result.cardDetection.suggestions[0].matchScore) : 0}% match
                        </div>
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
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Processing Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Batch Processing Failed</div>
              <div className="text-red-600 text-sm mt-1">{error.message}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Button */}
      {(processedImages.length > 0 || ocrResults.length > 0) && (
        <div className="text-center">
          <button
            onClick={handleClear}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How PSA Batch Processing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Traditional Method (Expensive)</h4>
                <ol className="space-y-1 text-sm">
                  <li>1. Upload 10 PSA label images</li>
                  <li>2. Process each image individually</li>
                  <li>3. Make 10 separate API calls</li>
                  <li>4. Cost: 10 × $0.0015 = $0.015</li>
                  <li>5. Processing time: 10-15 seconds</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Optimized Method (90% Savings)</h4>
                <ol className="space-y-1 text-sm">
                  <li>1. Upload 10 PSA label images</li>
                  <li>2. Stitch images into optimized grid</li>
                  <li>3. Make 1 single API call</li>
                  <li>4. Cost: 1 × $0.0015 = $0.0015</li>
                  <li>5. Processing time: 2-3 seconds</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <strong>Key Benefits:</strong>
              <ul className="mt-2 space-y-1">
                <li>• <strong>90% cost reduction</strong> for batch processing</li>
                <li>• <strong>2-3x faster</strong> processing time</li>
                <li>• <strong>Intelligent grid layout</strong> optimizes OCR accuracy</li>
                <li>• <strong>Automatic fallback</strong> if stitching fails</li>
                <li>• <strong>Smart detection</strong> identifies PSA labels automatically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsaBatchProcessingDemo;