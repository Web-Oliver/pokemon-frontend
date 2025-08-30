/**
 * EXTRACT STEP - SOLID & DRY
 * Single Responsibility: Extract PSA labels from uploaded images
 * DRY: Reusable extraction interface
 */

import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { StepComponentProps } from '@/types/OcrWorkflowTypes';
import { useOcrMatching, IcrExtractLabelsResponse } from '@/domains/icr/hooks/useOcrMatching';

// Use real API response type
type ExtractData = IcrExtractLabelsResponse;

export const ExtractStep: React.FC<StepComponentProps> = ({ 
  data, 
  onComplete, 
  onError, 
  isActive 
}) => {
  const [extractedData, setExtractedData] = useState<ExtractData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get uploaded files from previous step (real API response)
  const uploadData = data as { files: File[]; scanIds: string[] } | undefined;
  
  // REAL API INTEGRATION with status tracking
  const { extractMutation, scansQuery } = useOcrMatching();
  
  // Import ImageUrlService for proper URL handling
  const [imageUrlService, setImageUrlService] = useState<any>(null);
  
  useEffect(() => {
    const loadImageUrlService = async () => {
      const { ImageUrlService } = await import('@/shared/services/ImageUrlService');
      setImageUrlService(new ImageUrlService());
    };
    loadImageUrlService();
  }, []);
  
  // Load scans with ALL different statuses for complete workflow visibility
  const { data: uploadedScans } = scansQuery({ status: 'uploaded' });
  const { data: extractedScans } = scansQuery({ status: 'extracted' });
  const { data: stitchedScans } = scansQuery({ status: 'stitched' });
  const { data: ocrCompletedScans } = scansQuery({ status: 'ocr_completed' });
  const { data: matchedScans } = scansQuery({ status: 'matched' });
  const { data: failedScans } = scansQuery({ status: 'failed' });

  // MANUAL EXTRACTION ONLY - NO AUTO-START
  // Removed automatic extraction trigger to keep workflow fully manual

  // REAL API EXTRACTION with comprehensive error handling
  const handleExtraction = useCallback(async () => {
    const scanIds = uploadedScans?.scans.map(s => s.id) || [];
    
    if (scanIds.length === 0) {
      toast.error('No uploaded scans found');
      onError('No scans available for extraction. Please upload images first.');
      return;
    }

    const toastId = toast.loading(`Extracting labels from ${scanIds.length} images...`);

    try {
      // REAL API CALL - NO MOCKING
      const result = await extractMutation.mutateAsync(scanIds);
      
      // DEBUG: Log the actual response structure
      console.log('🔍 ExtractStep API Response:', JSON.stringify(result, null, 2));
      
      setExtractedData(result);

      if (result.successful === 0 && result.skippedCount === 0) {
        toast.error('Failed to extract any PSA labels', { id: toastId });
        onError('No labels could be extracted. Please check image quality and PSA label visibility.');
      } else {
        // Handle different scenarios
        if (result.successful > 0) {
          toast.success(`Successfully extracted ${result.successful} labels`, { id: toastId });
        } else if (result.skippedCount > 0) {
          toast(`All ${result.skippedCount} scans were already processed`, { 
            id: toastId,
            icon: 'ℹ️',
            style: {
              background: '#3b82f6',
              color: 'white',
            },
          });
        }
        
        if (result.failed > 0) {
          toast(`${result.failed} extractions failed`, {
            icon: '⚠️',
            style: {
              background: '#f59e0b',
              color: 'white',
            },
          });
        }
        
        onComplete(result);
      }

    } catch (error) {
      toast.error('Extraction failed', { id: toastId });
      onError(error instanceof Error ? error.message : 'Label extraction failed');
    }
  }, [uploadData, uploadedScans, extractMutation, onComplete, onError]);

  // RETRY FAILED - DRY: Reusable retry logic
  const retryFailed = useCallback(async () => {
    if (!extractedData) return;
    
    // In real implementation, retry only failed files
    handleExtraction();
  }, [extractedData, handleExtraction]);

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🏷️ Extract PSA Labels</h2>
        <p className="text-gray-400">AI-powered extraction of PSA grading labels from images</p>
      </div>

      {/* COMPLETE PROCESSING STATUS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        
        {/* UPLOADED - AWAITING EXTRACTION */}
        <div className={`rounded-lg p-4 ${uploadedScans?.scans.length ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${uploadedScans?.scans.length ? 'text-yellow-300' : 'text-gray-500'}`}>
            ⏳ Uploaded ({uploadedScans?.scans.length || 0})
          </h3>
          {uploadedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {uploadedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {uploadedScans.scans.length > 4 && <p className="text-yellow-200 text-sm">+{uploadedScans.scans.length - 4} more</p>}
              <button onClick={handleExtraction} disabled={extractMutation.isPending} 
                className={`w-full mt-2 px-3 py-2 rounded text-sm font-semibold ${extractMutation.isPending ? 'bg-gray-600 text-gray-400' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
                {extractMutation.isPending ? '🤖 Processing...' : '🏷️ Extract Now'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No images awaiting extraction</p>
          )}
        </div>

        {/* EXTRACTED - LABELS READY */}
        <div className={`rounded-lg p-4 ${extractedScans?.scans.length ? 'bg-green-900/20 border border-green-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${extractedScans?.scans.length ? 'text-green-300' : 'text-gray-500'}`}>
            ✅ Extracted ({extractedScans?.scans.length || 0})
          </h3>
          {extractedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {extractedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) || imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.labelImageUrl || scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {extractedScans.scans.length > 4 && <p className="text-green-200 text-sm">+{extractedScans.scans.length - 4} more</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No labels extracted yet</p>
          )}
        </div>

        {/* STITCHED - READY FOR OCR */}
        <div className={`rounded-lg p-4 ${stitchedScans?.scans.length ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${stitchedScans?.scans.length ? 'text-blue-300' : 'text-gray-500'}`}>
            🧩 Stitched ({stitchedScans?.scans.length || 0})
          </h3>
          {stitchedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {stitchedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) || imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.labelImageUrl || scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {stitchedScans.scans.length > 4 && <p className="text-blue-200 text-sm">+{stitchedScans.scans.length - 4} more</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No images stitched yet</p>
          )}
        </div>

        {/* OCR COMPLETED - TEXT EXTRACTED */}
        <div className={`rounded-lg p-4 ${ocrCompletedScans?.scans.length ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${ocrCompletedScans?.scans.length ? 'text-purple-300' : 'text-gray-500'}`}>
            📝 OCR Done ({ocrCompletedScans?.scans.length || 0})
          </h3>
          {ocrCompletedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {ocrCompletedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) || imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.labelImageUrl || scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {ocrCompletedScans.scans.length > 4 && <p className="text-purple-200 text-sm">+{ocrCompletedScans.scans.length - 4} more</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No OCR completed yet</p>
          )}
        </div>

        {/* MATCHED - CARDS IDENTIFIED */}
        <div className={`rounded-lg p-4 ${matchedScans?.scans.length ? 'bg-cyan-900/20 border border-cyan-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${matchedScans?.scans.length ? 'text-cyan-300' : 'text-gray-500'}`}>
            🎯 Matched ({matchedScans?.scans.length || 0})
          </h3>
          {matchedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {matchedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getLabelImageUrl(scan.labelImageUrl) || imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.labelImageUrl || scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {matchedScans.scans.length > 4 && <p className="text-cyan-200 text-sm">+{matchedScans.scans.length - 4} more</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No cards matched yet</p>
          )}
        </div>

        {/* FAILED - PROCESSING ERRORS */}
        <div className={`rounded-lg p-4 ${failedScans?.scans.length ? 'bg-red-900/20 border border-red-700/30' : 'bg-gray-800/20 border border-gray-700/30'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${failedScans?.scans.length ? 'text-red-300' : 'text-gray-500'}`}>
            ❌ Failed ({failedScans?.scans.length || 0})
          </h3>
          {failedScans?.scans.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {failedScans.scans.slice(0, 4).map((scan) => (
                  <div key={scan.id} className="bg-gray-700 rounded p-1">
                    <img src={imageUrlService ? imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.fullImageUrl} alt={scan.originalFileName} className="w-full h-8 object-cover rounded" />
                    <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                  </div>
                ))}
              </div>
              {failedScans.scans.length > 4 && <p className="text-red-200 text-sm">+{failedScans.scans.length - 4} more</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No failed processing</p>
          )}
        </div>

      </div>

      {/* PROCESSING STATE */}
      {extractMutation.isPending && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-blue-300 mb-2">
              AI Processing Images...
            </h3>
            <p className="text-blue-200 mb-4">
              Analyzing {uploadedScans?.scans.length || 0} images for PSA labels
            </p>
            
            {/* PROGRESS BAR */}
            <div className="bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-sm text-gray-400">Processing...</p>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {extractedData && (
        <div className="space-y-6">
          {/* SUMMARY */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl text-green-400 font-bold">
                {extractedData.extractedLabels?.length || 0}
              </div>
              <div className="text-green-300 text-sm">Labels Extracted</div>
            </div>
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl text-red-400 font-bold">
                {extractedData.failed?.length || 0}
              </div>
              <div className="text-red-300 text-sm">Failed</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl text-blue-400 font-bold">
                {extractedData.extractedLabels?.length 
                  ? Math.round((extractedData.extractedLabels.reduce((sum, label) => sum + label.confidence, 0) / extractedData.extractedLabels.length) * 100)
                  : 0}%
              </div>
              <div className="text-blue-300 text-sm">Avg Confidence</div>
            </div>
          </div>

          {/* EXTRACTED LABELS */}
          {extractedData.extractedLabels && extractedData.extractedLabels.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                ✅ Successfully Extracted Labels
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extractedData.extractedLabels.map((label, index) => (
                  <div 
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedImage(label.labelImage)}
                  >
                    <img 
                      src={label.labelImage} 
                      alt={`Extracted label from ${label.originalFile}`}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                    <p className="text-sm font-medium text-white truncate">
                      {label.originalFile}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${label.confidence > 0.9 
                          ? 'bg-green-600 text-green-100' 
                          : label.confidence > 0.75 
                            ? 'bg-yellow-600 text-yellow-100'
                            : 'bg-red-600 text-red-100'
                        }
                      `}>
                        {Math.round(label.confidence * 100)}% confidence
                      </span>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        🔍 View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAILED EXTRACTIONS */}
          {extractedData.failed && extractedData.failed.length > 0 && (
            <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-red-300">
                  ❌ Failed Extractions ({extractedData.failed.length})
                </h3>
                <button
                  onClick={retryFailed}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  🔄 Retry Failed
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {extractedData.failed.map((filename, index) => (
                  <div key={index} className="bg-red-800/20 rounded p-2">
                    <p className="text-sm text-red-300 truncate">{filename}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-red-200">
                <strong>Common reasons for failure:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• PSA label not clearly visible</li>
                  <li>• Image too blurry or low resolution</li>
                  <li>• Label partially obscured or damaged</li>
                  <li>• Non-PSA graded card</li>
                </ul>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="text-center">
            <button
              onClick={handleExtraction}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mr-4"
            >
              🔄 Re-process All
            </button>
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src={selectedImage} 
              alt="Extracted label preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
        <h4 className="text-yellow-300 font-semibold mb-2">💡 Extraction Process:</h4>
        <ul className="text-yellow-200 text-sm space-y-1">
          <li>• AI identifies PSA labels in uploaded images</li>
          <li>• Extracts label regions with confidence scores</li>
          <li>• Failed extractions can be retried or skipped</li>
          <li>• Only successfully extracted labels proceed to stitching</li>
        </ul>
      </div>
    </div>
  );
};