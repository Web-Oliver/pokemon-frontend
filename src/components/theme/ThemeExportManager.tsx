/**
 * CLAUDE.md COMPLIANCE: Theme Export Manager Component
 * 
 * SRP: Single responsibility for theme export operations
 * OCP: Open for extension via props interface
 * DIP: Depends on theme utilities abstraction
 */

import { useState, useCallback } from 'react';
import { Download, Package, FileText } from 'lucide-react';
import { cn } from '../../utils/themeUtils';
import type { ThemeExportData } from './utils/themeExportUtils';
import { 
  generateThemeExportData, 
  downloadThemeAsFile,
  getThemeConfigSummary 
} from './utils/themeExportUtils';

interface ThemeExportManagerProps {
  /** Current theme configuration */
  visualTheme: any;
  layoutTheme: any;
  animationTheme: any;
  accessibilityTheme: any;
  /** Button styling classes */
  primaryButtonClasses: string;
  secondaryButtonClasses: string;
  /** Show/hide state */
  showExportOptions: boolean;
  onToggleExportOptions: () => void;
}

/**
 * ThemeExportManager Component
 * Handles theme export operations and preset management
 * 
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only export-related operations
 * - DRY: Reusable export logic
 * - SOLID: Clean interface with dependency injection
 */
export const ThemeExportManager: React.FC<ThemeExportManagerProps> = ({
  visualTheme,
  layoutTheme,
  animationTheme,
  accessibilityTheme,
  primaryButtonClasses,
  secondaryButtonClasses,
  showExportOptions,
  onToggleExportOptions,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDescription, setExportDescription] = useState('');
  const [customPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customThemePresets') || '[]');
    } catch {
      return [];
    }
  });

  const getCurrentThemeData = useCallback((): ThemeExportData => {
    // This would typically come from theme context
    // For now, using placeholder - should be injected via props
    const config = {
      accentPrimary: visualTheme.accentPrimary || '#06b6d4',
      accentSecondary: visualTheme.accentSecondary || '#a855f7',
      highContrast: accessibilityTheme.highContrast || false,
      reducedMotion: accessibilityTheme.reducedMotion || false,
    };

    return generateThemeExportData(
      config,
      visualTheme,
      layoutTheme,
      animationTheme,
      accessibilityTheme,
      exportDescription || undefined
    );
  }, [visualTheme, layoutTheme, animationTheme, accessibilityTheme, exportDescription]);

  const handleExportCurrent = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const themeData = getCurrentThemeData();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `theme-export-${timestamp}.json`;
      
      downloadThemeAsFile(themeData, filename);
      
      // Clear description after successful export
      setExportDescription('');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [getCurrentThemeData]);

  const handleExportAllPresets = useCallback(async () => {
    setIsExporting(true);
    
    try {
      if (customPresets.length === 0) {
        alert('No custom presets to export');
        return;
      }
      
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        presets: customPresets,
        count: customPresets.length,
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `theme-presets-collection-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Preset collection export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [customPresets]);

  const handleExportPresetCollection = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const currentTheme = getCurrentThemeData();
      const allPresets = [
        {
          id: 'current',
          name: 'Current Theme',
          data: currentTheme,
          createdAt: new Date().toISOString(),
        },
        ...customPresets,
      ];
      
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        presets: allPresets,
        count: allPresets.length,
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `complete-theme-collection-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Complete collection export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [getCurrentThemeData, customPresets]);

  const currentThemeData = getCurrentThemeData();
  const themeSummary = getThemeConfigSummary(currentThemeData.config, currentThemeData.visualTheme);

  return (
    <div className="space-y-4">
      {/* Export Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExportCurrent}
          disabled={isExporting}
          className={primaryButtonClasses}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Current'}
        </button>
        
        {customPresets.length > 0 && (
          <>
            <button
              onClick={handleExportAllPresets}
              disabled={isExporting}
              className={secondaryButtonClasses}
            >
              <Package className="w-4 h-4 mr-2" />
              Export Presets ({customPresets.length})
            </button>
            
            <button
              onClick={handleExportPresetCollection}
              disabled={isExporting}
              className={secondaryButtonClasses}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export All
            </button>
          </>
        )}
        
        <button
          onClick={onToggleExportOptions}
          className={secondaryButtonClasses}
        >
          {showExportOptions ? 'Hide Options' : 'Show Options'}
        </button>
      </div>

      {/* Export Options */}
      {showExportOptions && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Export Description (Optional)
            </label>
            <textarea
              value={exportDescription}
              onChange={(e) => setExportDescription(e.target.value)}
              placeholder="Add a description for this theme export..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg',
                'text-white placeholder-zinc-400 resize-none',
                'focus:outline-none focus:border-blue-500 focus:bg-zinc-600',
                'transition-colors duration-200'
              )}
            />
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="text-sm text-zinc-300">
              <p className="font-medium mb-2">Current Theme Summary:</p>
              <p className="text-zinc-400">{themeSummary}</p>
            </div>
          </div>

          {customPresets.length > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/50">
              <div className="text-sm text-zinc-300">
                <p className="font-medium mb-2">Available Export Options:</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• <strong>Export Current:</strong> Save only the active theme</li>
                  <li>• <strong>Export Presets:</strong> Save all {customPresets.length} custom presets</li>
                  <li>• <strong>Export All:</strong> Save current theme + all presets</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeExportManager;