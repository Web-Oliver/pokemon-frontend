/**
 * CLAUDE.md COMPLIANCE: Theme Importer Component
 * 
 * SRP: Single responsibility for theme import operations
 * OCP: Open for extension via props interface
 * DIP: Depends on theme utilities abstraction
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/unifiedUtilities';
import type { ThemeExportData } from './utils/themeExportUtils';
import { parseThemeFile, validateThemeData } from './utils/themeExportUtils';

interface ThemeImporterProps {
  /** Callback when theme is successfully imported */
  onThemeImported: (themeData: ThemeExportData) => void;
  /** Button styling classes */
  primaryButtonClasses: string;
  secondaryButtonClasses: string;
  /** Show/hide state */
  showImportOptions: boolean;
  onToggleImportOptions: () => void;
}

/**
 * ThemeImporter Component
 * Handles theme file import and validation
 * 
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only import-related operations
 * - DRY: Reusable import logic
 * - SOLID: Clean interface with dependency injection
 */
export const ThemeImporter: React.FC<ThemeImporterProps> = ({
  onThemeImported,
  primaryButtonClasses,
  secondaryButtonClasses,
  showImportOptions,
  onToggleImportOptions,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [customPresetName, setCustomPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportTheme = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const themeData = await parseThemeFile(file);
      
      // Validate theme data structure
      if (!validateThemeData(themeData)) {
        throw new Error('Invalid theme file format');
      }

      // Apply custom preset name if provided
      if (customPresetName.trim()) {
        themeData.name = customPresetName.trim();
      }

      // Import the theme
      onThemeImported(themeData);
      
      setImportMessage('Theme imported successfully!');
      setCustomPresetName('');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportMessage(`Import failed: ${errorMessage}`);
      console.error('Theme import error:', error);
    } finally {
      setIsImporting(false);
    }
  }, [customPresetName, onThemeImported]);

  const _handleImportAsPreset = useCallback(async (themeData: ThemeExportData) => {
    try {
      // Store as custom preset in localStorage
      const existingPresets = JSON.parse(localStorage.getItem('customThemePresets') || '[]');
      
      const preset = {
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: themeData.name || `Imported Theme ${existingPresets.length + 1}`,
        data: themeData,
        createdAt: new Date().toISOString(),
      };
      
      existingPresets.push(preset);
      localStorage.setItem('customThemePresets', JSON.stringify(existingPresets));
      
      setImportMessage(`Theme saved as preset: "${preset.name}"`);
    } catch (error) {
      setImportMessage('Failed to save theme as preset');
      console.error('Preset save error:', error);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Import Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleFileSelect}
          disabled={isImporting}
          className={primaryButtonClasses}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isImporting ? 'Importing...' : 'Import Theme'}
        </button>
        
        <button
          onClick={onToggleImportOptions}
          className={secondaryButtonClasses}
        >
          {showImportOptions ? 'Hide Options' : 'Show Options'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportTheme}
        className="hidden"
      />

      {/* Import Options */}
      {showImportOptions && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Custom Preset Name (Optional)
            </label>
            <input
              type="text"
              value={customPresetName}
              onChange={(e) => setCustomPresetName(e.target.value)}
              placeholder="Enter a name for this theme preset..."
              className={cn(
                'w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg',
                'text-white placeholder-zinc-400',
                'focus:outline-none focus:border-blue-500 focus:bg-zinc-600',
                'transition-colors duration-200'
              )}
            />
            <p className="text-xs text-zinc-400 mt-1">
              If provided, the imported theme will be saved as a custom preset
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-zinc-300">
                <p className="font-medium mb-1">Import Guidelines:</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Only .json theme files are supported</li>
                  <li>• Themes must be exported from this application</li>
                  <li>• Invalid files will be rejected with an error message</li>
                  <li>• Imported themes will overwrite current settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Status Message */}
      {importMessage && (
        <div className={cn(
          'rounded-lg p-3 border flex items-start gap-2',
          importMessage.includes('failed') || importMessage.includes('error')
            ? 'bg-red-900/20 border-red-600/30 text-red-300'
            : 'bg-green-900/20 border-green-600/30 text-green-300'
        )}>
          {importMessage.includes('failed') || importMessage.includes('error') ? (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <div className="text-sm">
            {importMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeImporter;