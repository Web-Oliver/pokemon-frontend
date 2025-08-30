/**
 * UPLOAD STEP - SOLID & DRY
 * Single Responsibility: Handle image uploads only
 * DRY: Reusable upload interface
 */

import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { StepComponentProps } from '@/types/OcrWorkflowTypes';
import { useOcrMatching, IcrUploadResponse } from '@/domains/icr/hooks/useOcrMatching';

// SOLID: Interface Segregation - Separate upload data from validation
type UploadData = IcrUploadResponse & {
  files: File[];
};

// DRY: Reusable validation configuration
interface ValidationConfig {
  maxFiles: number;
  maxFileSize: number; // in bytes
  allowedTypes: string[];
}

const UPLOAD_VALIDATION: ValidationConfig = {
  maxFiles: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

export const UploadStep: React.FC<StepComponentProps> = ({ 
  onComplete, 
  onError, 
  isActive 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // REAL API INTEGRATION with status tracking
  const { uploadMutation, scansQuery } = useOcrMatching();
  
  // Import ImageUrlService for proper URL handling
  const [imageUrlService, setImageUrlService] = useState<any>(null);
  
  useEffect(() => {
    const loadImageUrlService = async () => {
      const { ImageUrlService } = await import('@/shared/services/ImageUrlService');
      setImageUrlService(new ImageUrlService());
    };
    loadImageUrlService();
  }, []);
  
  // Load existing scans with 'uploaded' status to show pending work
  const { data: pendingScans, isLoading: scansLoading } = scansQuery({ 
    status: 'uploaded', 
    limit: 150 
  });
  
  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // SOLID: Single Responsibility - File validation
  const validateFiles = useCallback((files: File[]) => {
    const valid: File[] = [];
    const errors: string[] = [];
    
    if (files.length === 0) {
      errors.push('Please select at least one image file.');
      return { valid, errors };
    }
    
    if (files.length > UPLOAD_VALIDATION.maxFiles) {
      errors.push(`Maximum ${UPLOAD_VALIDATION.maxFiles} files allowed.`);
      return { valid, errors };
    }
    
    files.forEach(file => {
      if (!UPLOAD_VALIDATION.allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type.`);
        return;
      }
      
      if (file.size > UPLOAD_VALIDATION.maxFileSize) {
        errors.push(`${file.name}: File too large (max 10MB).`);
        return;
      }
      
      valid.push(file);
    });
    
    return { valid, errors };
  }, []);

  // FILE SELECTION - DRY: Reusable file handling with validation
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const { valid, errors } = validateFiles(files);
    
    errors.forEach(error => toast.error(error));
    
    if (valid.length > 0) {
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...valid];
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);
        return newFiles;
      });
      toast.success(`Added ${valid.length} valid files`);
    }
    
    event.target.value = '';
  }, [validateFiles]);

  // DRAG & DROP - DRY: Reusable drag handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      onError('Some files were skipped. Only image files are allowed.');
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  }, [onError]);

  // REAL API UPLOAD - Single Responsibility with comprehensive error handling
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image file');
      onError('No files selected');
      return;
    }

    const toastId = toast.loading(`Uploading ${selectedFiles.length} files...`);

    try {
      // REAL API CALL - NO MOCKING
      const result = await uploadMutation.mutateAsync(selectedFiles);
      
      if (result.successful > 0) {
        toast.success(`Successfully uploaded ${result.successful} files`, { id: toastId });
        
        if (result.failed > 0) {
          toast.error(`${result.failed} uploads failed`);
        }
        if (result.duplicateCount > 0) {
          (toast as any).warning(`${result.duplicateCount} duplicates skipped`);
        }
        
        const uploadData: UploadData = {
          files: selectedFiles,
          ...result
        };

        // Clear selected files
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        
        onComplete(uploadData);
      } else {
        toast.error('All uploads failed', { id: toastId });
        onError('Upload failed for all files');
      }
      
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
      onError(error instanceof Error ? error.message : 'Network error');
    }
  }, [selectedFiles, uploadMutation, onComplete, onError, previewUrls]);

  // REMOVE FILE - DRY: Reusable removal
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">📤 Upload Card Images</h2>
        <p className="text-gray-400">Upload PSA graded Pokemon cards for label extraction</p>
      </div>
      
      {/* EXISTING SCANS STATUS */}
      {!scansLoading && pendingScans && pendingScans.scans.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">
            🏷️ PSA Cards Awaiting Label Extraction ({pendingScans.scans.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {pendingScans.scans.slice(0, 12).map((scan) => (
              <div key={scan.id} className="bg-gray-700 rounded-lg p-2">
                <img 
                  src={imageUrlService ? imageUrlService.getFullImageUrl(scan.fullImageUrl) : scan.fullImageUrl} 
                  alt={scan.originalFileName}
                  className="w-full h-20 object-cover rounded mb-2"
                />
                <p className="text-xs text-white truncate">{scan.originalFileName}</p>
                <span className="text-xs px-2 py-1 rounded bg-yellow-600 text-yellow-100">
                  Uploaded
                </span>
              </div>
            ))}
          </div>
          
          {pendingScans.scans.length > 12 && (
            <p className="text-yellow-200 text-sm">
              +{pendingScans.scans.length - 12} more awaiting extraction
            </p>
          )}
          
          <div className="mt-4 p-3 bg-yellow-800/20 rounded">
            <p className="text-yellow-200 text-sm">
              💡 These files are ready for label extraction. Complete the Extract step to process them.
            </p>
          </div>
        </div>
      )}

      {/* UPLOAD ZONE */}
      <div 
        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-12 text-center transition-colors duration-200 cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Drag & Drop Images Here
        </h3>
        <p className="text-gray-400 mb-4">or click to browse files</p>
        <p className="text-sm text-gray-500">
          Supports: JPG, PNG, WebP (Max 50MB per file)
        </p>
        
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* SELECTED FILES */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Selected Files ({selectedFiles.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {/* UPLOAD PROGRESS */}
                  {uploadMutation.isPending && (
                    <div className="mt-2">
                      <div className="bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploading...
                      </p>
                    </div>
                  )}
                </div>
                
                {!uploadMutation.isPending && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-3 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploadMutation.isPending}
          className={`
            px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200
            ${selectedFiles.length > 0 && !uploadMutation.isPending
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {uploadMutation.isPending ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Uploading {selectedFiles.length} files...
            </span>
          ) : (
            `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>

      {/* INSTRUCTIONS */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-2">📋 Upload Tips:</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Ensure images are clear and well-lit</li>
          <li>• PSA labels should be fully visible</li>
          <li>• Multiple angles of the same card are helpful</li>
          <li>• Avoid blurry or heavily shadowed images</li>
        </ul>
      </div>
    </div>
  );
};