/**
 * Image Utilities - Following SOLID and DRY principles
 * Single Responsibility: Each function has one clear purpose
 * Open/Closed: Extensible without modification
 * Dependency Inversion: Uses abstractions, not concretions
 */

// Simple UUID generation without external dependencies
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
  aspectInfo?: any;
}

/**
 * Creates a preview object for existing images
 * SRP: Only handles existing image preview creation
 */
export const createExistingImagePreview = (url: string, index: number): ImagePreview => ({
  id: `existing-${index}-${generateId()}`,
  url: url.startsWith('http') ? url : `http://localhost:3000${url}`,
  isExisting: true,
});

/**
 * Processes uploaded files and creates previews
 * SRP: Only handles file processing and validation
 */
export const processImageFiles = async (
  files: FileList,
  existingPreviews: ImagePreview[],
  maxFiles: number,
  maxFileSize: number,
  acceptedTypes: string[]
): Promise<{
  newFiles: File[];
  newPreviews: ImagePreview[];
  errorMessage: string | null;
}> => {
  const fileArray = Array.from(files);
  const newFiles: File[] = [];
  const newPreviews: ImagePreview[] = [];
  let errorMessage: string | null = null;

  // Check total file count
  if (existingPreviews.length + fileArray.length > maxFiles) {
    errorMessage = `Maximum ${maxFiles} files allowed`;
    return { newFiles, newPreviews, errorMessage };
  }

  for (const file of fileArray) {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      errorMessage = `File type ${file.type} not supported`;
      break;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errorMessage = `File ${file.name} exceeds ${maxFileSize}MB limit`;
      break;
    }

    // Create preview
    const preview: ImagePreview = {
      id: `new-${generateId()}`,
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    };

    newFiles.push(file);
    newPreviews.push(preview);
  }

  return { newFiles, newPreviews, errorMessage };
};

/**
 * Cleans up object URLs to prevent memory leaks
 * SRP: Only handles URL cleanup
 */
export const cleanupObjectURL = (preview: ImagePreview) => {
  if (!preview.isExisting && preview.url.startsWith('blob:')) {
    URL.revokeObjectURL(preview.url);
  }
};