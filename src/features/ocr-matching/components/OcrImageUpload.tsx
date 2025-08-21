import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { Upload, Camera, FileText, Loader2 } from 'lucide-react';

interface OcrImageUploadProps {
  selectedImage: File | null;
  isProcessing: boolean;
  onImageSelect: (file: File) => void;
  onProcessImage: () => void;
  onUseDemo: () => void;
}

export const OcrImageUpload: React.FC<OcrImageUploadProps> = ({
  selectedImage,
  isProcessing,
  onImageSelect,
  onProcessImage,
  onUseDemo,
}) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
      <div className="relative z-20">
        <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Upload Pokemon Card Image
        </h3>
        <p className="text-cyan-100/90 mb-6">
          Upload an image of your Pokemon card for OCR processing and automatic card matching.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/50 rounded-xl p-8 bg-zinc-900/50 backdrop-blur-sm hover:border-cyan-400/70 transition-colors">
            <Upload className="w-12 h-12 text-cyan-400 mb-4" />
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-white mb-2 block">
                {selectedImage ? selectedImage.name : 'Choose an image file'}
              </span>
              <span className="text-cyan-100/70 text-sm">
                PNG, JPG, or JPEG up to 10MB
              </span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex gap-4">
            <PokemonButton
              variant="primary"
              onClick={onProcessImage}
              disabled={!selectedImage || isProcessing}
              className="flex items-center gap-2 flex-1"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {isProcessing ? 'Processing...' : 'Process Image'}
            </PokemonButton>

            <PokemonButton
              variant="outline"
              onClick={onUseDemo}
              className="flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Use Demo
            </PokemonButton>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};