/**
 * Theme Exporter Component
 * Phase 3.1.2: Theme Export/Import System
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles theme export/import UI only
 * - Open/Closed: Extensible for new export/import features
 * - DRY: Reuses existing component patterns and utilities
 * - Interface Segregation: Focused interface for theme management
 *
 * Integrates with:
 * - ThemeContext.tsx for theme configuration access
 * - themeExport.ts for export/import utilities
 * - Existing UI components for consistent styling
 */

import React, { useState, useCallback, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useVisualTheme, useLayoutTheme, useAnimationTheme, useAccessibilityTheme } from '../../contexts/theme';
import {
  exportTheme,
  exportThemeCollection,
  exportAllCustomPresets,
  importThemeFromFile,
  importAndSavePreset,
  importAndSavePresetCollection,
  getCustomPresetNames,
  deleteCustomPreset,
  validateThemeFile,
  getThemeConfigSummary,
  createThemeBackup,
  getThemeBackups,
  restoreThemeFromBackup,
} from '../../../utils/themeExport';
import { cn } from '../../../utils/unifiedUtilities';

// ================================
// COMPONENT INTERFACES
// ================================

export interface ThemeExporterProps {
  /** Component size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show advanced features */
  showAdvanced?: boolean;
  /** Callback when theme is imported */
  onThemeImported?: (themeName: string) => void;
  /** Custom CSS classes */
  className?: string;
}

// ================================
// MAIN COMPONENT
// ================================

export const ThemeExporter: React.FC<ThemeExporterProps> = ({
  size = 'comfortable',
  showAdvanced = false,
  onThemeImported,
  className,
}) => {
  const visualTheme = useCentralizedTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationConfig();
  const accessibilityTheme = useAccessibilityTheme();

  // Local UI state
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showBackups, setShowBackups] = useState(false);

  // Get current theme data for backup operations
  const getCurrentThemeData = useCallback(() => {
    const config = {
      accentPrimary: visualTheme.accentPrimary || '#06b6d4',
      accentSecondary: visualTheme.accentSecondary || '#a855f7',
      highContrast: accessibilityTheme.config?.highContrast || false,
      reducedMotion: accessibilityTheme.config?.reducedMotion || false,
    };

    return generateThemeExportData(
      config,
      visualTheme,
      layoutTheme,
      animationTheme,
      accessibilityTheme
    );
  }, [visualTheme, layoutTheme, animationTheme, accessibilityTheme]);

  // Handle theme restoration from backup
  const handleRestoreBackup = useCallback((backup: ThemeBackup) => {
    if (onThemeImported) {
      onThemeImported(backup.data);
    }
  }, [onThemeImported]);

  // Styling utilities (keeping existing button classes)
  const getSizeClasses = (size: 'compact' | 'comfortable' | 'expanded') => {
    const sizeMap = {
      compact: 'text-sm px-3 py-1.5',
      comfortable: 'text-sm px-4 py-2',
      expanded: 'text-base px-6 py-3',
    };
    return sizeMap[size];
  };

  const buttonBaseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    getSizeClasses(size)
  );

  const primaryButtonClasses = cn(
    buttonBaseClasses,
    'bg-gradient-to-r from-blue-500 to-purple-600',
    'hover:from-blue-600 hover:to-purple-700',
    'text-white shadow-lg hover:shadow-xl',
    'focus:ring-blue-500 focus:ring-offset-zinc-900'
  );

  const secondaryButtonClasses = cn(
    buttonBaseClasses,
    'bg-zinc-700 hover:bg-zinc-600 text-zinc-100',
    'border border-zinc-600 hover:border-zinc-500'
  );

  const dangerButtonClasses = cn(
    buttonBaseClasses,
    'bg-red-600 hover:bg-red-700 text-white'
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Export Section */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2 text-blue-400" />
          Export Theme
        </h3>
        
        <ThemeExportManager
          visualTheme={visualTheme}
          layoutTheme={layoutTheme}
          animationTheme={animationTheme}
          accessibilityTheme={accessibilityTheme}
          primaryButtonClasses={primaryButtonClasses}
          secondaryButtonClasses={secondaryButtonClasses}
          showExportOptions={showExportOptions}
          onToggleExportOptions={() => setShowExportOptions(!showExportOptions)}
        />
      </div>

      {/* Import Section */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-green-400" />
          Import Theme
        </h3>
        
        <ThemeImporter
          onThemeImported={onThemeImported}
          primaryButtonClasses={primaryButtonClasses}
          secondaryButtonClasses={secondaryButtonClasses}
          showImportOptions={showImportOptions}
          onToggleImportOptions={() => setShowImportOptions(!showImportOptions)}
        />
      </div>

      {/* Backup Section */}
      {showAdvanced && (
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Archive className="w-5 h-5 mr-2 text-yellow-400" />
            Theme Backups
          </h3>
          
          <ThemeBackupManager
            currentThemeData={getCurrentThemeData()}
            onRestoreBackup={handleRestoreBackup}
            primaryButtonClasses={primaryButtonClasses}
            secondaryButtonClasses={secondaryButtonClasses}
            dangerButtonClasses={dangerButtonClasses}
            showBackups={showBackups}
            onToggleBackups={() => setShowBackups(!showBackups)}
          />
        </div>
      )}
    </div>
  );
}
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Theme Manager</h3>
          <p className="text-sm text-zinc-400">
            Export and import theme configurations
          </p>
        </div>
        <div className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
          {getThemeConfigSummary(theme.config)}
        </div>
      </div>

      {/* Message Display */}
      {importMessage && (
        <div
          className={cn(
            'p-3 rounded-lg border mb-4',
            importMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}
        >
          {importMessage.text}
        </div>
      )}

      {/* Export Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-zinc-200">Export Themes</h4>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className={secondaryButtonClasses}
          >
            {showExportOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {showExportOptions && (
          <div className="space-y-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
            {/* Export Current Theme */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-zinc-300">
                Export Current Theme
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Theme name (optional)"
                  value={customPresetName}
                  onChange={(e) => setCustomPresetName(e.target.value)}
                  className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={exportDescription}
                  onChange={(e) => setExportDescription(e.target.value)}
                  className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-sm"
                />
              </div>
              <button
                onClick={handleExportCurrent}
                disabled={isExporting}
                className={primaryButtonClasses}
              >
                {isExporting ? 'Exporting...' : 'Export Current Theme'}
              </button>
            </div>

            {/* Export All Presets */}
            {customPresets.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-700/30">
                <h5 className="text-sm font-medium text-zinc-300">
                  Export Custom Presets
                </h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportAllPresets}
                    disabled={isExporting}
                    className={secondaryButtonClasses}
                  >
                    Export All Presets ({customPresets.length})
                  </button>
                  <button
                    onClick={handleExportPresetCollection}
                    disabled={isExporting || !customPresetName}
                    className={primaryButtonClasses}
                  >
                    Export as Collection
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  Custom presets: {customPresets.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Section */}
      <div className="space-y-4 pt-6 border-t border-zinc-700/30">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-zinc-200">Import Themes</h4>
          <button
            onClick={() => setShowImportOptions(!showImportOptions)}
            className={secondaryButtonClasses}
          >
            {showImportOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {showImportOptions && (
          <div className="space-y-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-zinc-300">
                Import Theme File
              </h5>
              <p className="text-xs text-zinc-500">
                Import a single theme or theme collection JSON file
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className={primaryButtonClasses}
                >
                  {isImporting ? 'Importing...' : 'Choose Theme File'}
                </button>

                <button
                  onClick={handleCreateBackup}
                  className={secondaryButtonClasses}
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backup Management */}
      {showAdvanced && themeBackups.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-zinc-700/30">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-zinc-200">Theme Backups</h4>
            <button
              onClick={() => setShowBackups(!showBackups)}
              className={secondaryButtonClasses}
            >
              {showBackups
                ? 'Hide Backups'
                : `Show Backups (${themeBackups.length})`}
            </button>
          </div>

          {showBackups && (
            <div className="space-y-2 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
              {themeBackups.map((backup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {backup.metadata.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(
                        backup.metadata.exportDate
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {getThemeConfigSummary(backup.configuration)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreBackup(index)}
                      className={cn(
                        buttonBaseClasses,
                        'px-3 py-1 text-xs border-emerald-500/50 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40'
                      )}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Preset Management */}
      {showAdvanced && customPresets.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-zinc-700/30">
          <h4 className="text-md font-medium text-zinc-200">Custom Presets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customPresets.map((presetName) => (
              <div
                key={presetName}
                className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30"
              >
                <span className="text-sm text-zinc-200 truncate">
                  {presetName}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => theme.loadCustomPreset(presetName)}
                    className={cn(
                      buttonBaseClasses,
                      'px-3 py-1 text-xs border-cyan-500/50 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40'
                    )}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeletePreset(presetName)}
                    className={cn(
                      buttonBaseClasses,
                      'px-3 py-1 text-xs',
                      dangerButtonClasses
                    )}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-zinc-700/30">
        <details className="group">
          <summary className="text-sm font-medium text-zinc-300 cursor-pointer hover:text-zinc-200 transition-colors">
            Instructions & Tips
          </summary>
          <div className="mt-3 space-y-2 text-xs text-zinc-400">
            <p>
              <strong>Export:</strong> Save your current theme or all custom
              presets as JSON files
            </p>
            <p>
              <strong>Import:</strong> Load theme files to apply immediately or
              save as presets
            </p>
            <p>
              <strong>Backups:</strong> Automatic backups are created before
              major changes
            </p>
            <p>
              <strong>File Format:</strong> Only JSON files (.json) are
              supported
            </p>
            <p>
              <strong>Compatibility:</strong> Themes are version-checked for
              compatibility
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ThemeExporter;
