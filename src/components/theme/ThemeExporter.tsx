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
} from '../../utils/themeExport';
import { cn } from '../../utils/themeUtils';

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
  size = 'md',
  showAdvanced = true,
  onThemeImported,
  className,
}) => {
  const visualTheme = useVisualTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();
  const accessibilityTheme = useAccessibilityTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Component state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');
  const [exportDescription, setExportDescription] = useState('');

  // Get custom presets and backups
  const customPresets = getCustomPresetNames();
  const themeBackups = getThemeBackups();

  // ================================
  // EXPORT HANDLERS
  // ================================

  const handleExportCurrent = useCallback(async () => {
    setIsExporting(true);
    try {
      createThemeBackup(theme.config);
      exportTheme(
        theme.config,
        customPresetName || 'Current Theme',
        exportDescription || 'Current theme configuration',
        theme.getCSSProperties()
      );
      setImportMessage({
        type: 'success',
        text: 'Theme exported successfully!',
      });
      setShowExportOptions(false);
      setCustomPresetName('');
      setExportDescription('');
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to export theme',
      });
    } finally {
      setIsExporting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme.config,
    theme.getCSSProperties,
    customPresetName,
    exportDescription,
  ]);

  const handleExportAllPresets = useCallback(async () => {
    setIsExporting(true);
    try {
      exportAllCustomPresets('My Custom Themes');
      setImportMessage({
        type: 'success',
        text: 'All custom presets exported successfully!',
      });
    } catch (error) {
      setImportMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to export presets',
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportPresetCollection = useCallback(async () => {
    setIsExporting(true);
    try {
      const themes = customPresets.map((name) => {
        const preset = JSON.parse(
          localStorage.getItem('pokemon-custom-presets') || '{}'
        )[name];
        return {
          config: preset,
          name,
          description: `Custom theme preset: ${name}`,
        };
      });

      exportThemeCollection(
        themes,
        customPresetName || 'Custom Theme Collection',
        exportDescription || 'Collection of custom themes'
      );

      setImportMessage({
        type: 'success',
        text: 'Theme collection exported successfully!',
      });
      setShowExportOptions(false);
      setCustomPresetName('');
      setExportDescription('');
    } catch (error) {
      setImportMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to export theme collection',
      });
    } finally {
      setIsExporting(false);
    }
  }, [customPresets, customPresetName, exportDescription]);

  // ================================
  // IMPORT HANDLERS
  // ================================

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      handleImportTheme(file);
    },

    [handleImportTheme]
  );

  const handleImportTheme = useCallback(
    async (file: File) => {
      setIsImporting(true);
      setImportMessage(null);

      try {
        // Validate file
        const validation = validateThemeFile(file);
        if (!validation.valid) {
          setImportMessage({
            type: 'error',
            text: validation.error || 'Invalid file',
          });
          return;
        }

        // Import theme
        const result = await importThemeFromFile(file);

        if (!result.success) {
          setImportMessage({
            type: 'error',
            text: result.error || 'Failed to import theme',
          });
          return;
        }

        // Handle single theme
        if (result.importedTheme) {
          // Apply the imported theme configuration
          const importedConfig = result.importedTheme;
          theme.setVisualTheme(importedConfig.visualTheme);
          theme.setColorScheme(importedConfig.colorScheme);
          theme.setDensity(importedConfig.density);
          theme.setAnimationIntensity(importedConfig.animationIntensity);
          theme.setPrimaryColor(importedConfig.primaryColor);
          theme.setGlassmorphismIntensity(
            importedConfig.glassmorphismIntensity
          );

          if (importedConfig.highContrast !== theme.config.highContrast) {
            theme.toggleHighContrast();
          }
          if (importedConfig.reducedMotion !== theme.config.reducedMotion) {
            theme.toggleReducedMotion();
          }
          if (
            importedConfig.particleEffectsEnabled !==
            theme.config.particleEffectsEnabled
          ) {
            theme.toggleParticleEffects();
          }
          if (importedConfig.customCSSProperties) {
            theme.setCustomProperties(importedConfig.customCSSProperties);
          }

          setImportMessage({
            type: 'success',
            text: `Theme "${result.metadata?.name}" imported and applied successfully!`,
          });
          onThemeImported?.(result.metadata?.name || 'Imported Theme');
          setShowImportOptions(false);
          return;
        }

        // Handle theme collection
        if (result.importedThemes && result.importedThemes.length > 0) {
          const collectionResult = await importAndSavePresetCollection(file);
          if (collectionResult.success) {
            setImportMessage({
              type: 'success',
              text: `Imported ${collectionResult.importedCount} themes successfully!${collectionResult.skippedCount ? ` (${collectionResult.skippedCount} skipped)` : ''}`,
            });
          } else {
            setImportMessage({
              type: 'error',
              text: collectionResult.error || 'Failed to import themes',
            });
          }
          setShowImportOptions(false);
          return;
        }

        setImportMessage({
          type: 'error',
          text: 'No valid theme data found in file',
        });
      } catch (error) {
        setImportMessage({
          type: 'error',
          text:
            error instanceof Error ? error.message : 'Failed to import theme',
        });
      } finally {
        setIsImporting(false);
      }
    },
    [theme, onThemeImported]
  );

  const _handleImportAsPreset = useCallback(
    async (file: File, presetName: string) => {
      setIsImporting(true);
      setImportMessage(null);

      try {
        const result = await importAndSavePreset(file, presetName);

        if (result.success) {
          setImportMessage({
            type: 'success',
            text: `Theme saved as preset "${result.presetName}" successfully!`,
          });
          setShowImportOptions(false);
        } else {
          setImportMessage({
            type: 'error',
            text: result.error || 'Failed to import theme as preset',
          });
        }
      } catch (error) {
        setImportMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Failed to import theme as preset',
        });
      } finally {
        setIsImporting(false);
      }
    },
    []
  );

  // ================================
  // BACKUP HANDLERS
  // ================================

  const handleCreateBackup = useCallback(() => {
    try {
      createThemeBackup(theme.config);
      setImportMessage({
        type: 'success',
        text: 'Theme backup created successfully!',
      });
    } catch (error) {
      setImportMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to create backup',
      });
    }
  }, [theme.config]);

  const handleRestoreBackup = useCallback(
    (backupIndex: number) => {
      try {
        const restoredConfig = restoreThemeFromBackup(backupIndex);
        if (restoredConfig) {
          // Apply restored configuration
          Object.entries(restoredConfig).forEach(([key, value]) => {
            if (key in theme) {
              const setter =
                theme[
                  `set${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof theme
                ];
              if (typeof setter === 'function') {
                (setter as any)(value);
              }
            }
          });

          setImportMessage({
            type: 'success',
            text: 'Theme restored from backup successfully!',
          });
          setShowBackups(false);
        }
      } catch (error) {
        setImportMessage({
          type: 'error',
          text:
            error instanceof Error ? error.message : 'Failed to restore backup',
        });
      }
    },
    [theme]
  );

  // ================================
  // PRESET MANAGEMENT
  // ================================

  const handleDeletePreset = useCallback((presetName: string) => {
    try {
      deleteCustomPreset(presetName);
      setImportMessage({
        type: 'success',
        text: `Preset "${presetName}" deleted successfully!`,
      });
    } catch (error) {
      setImportMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to delete preset',
      });
    }
  }, []);

  // ================================
  // STYLING
  // ================================

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4 space-y-3';
      case 'lg':
        return 'p-8 space-y-6';
      default:
        return 'p-6 space-y-4';
    }
  };

  const buttonBaseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    'border backdrop-blur-sm',
    size === 'sm'
      ? 'px-3 py-1.5 text-sm'
      : size === 'lg'
        ? 'px-6 py-3 text-base'
        : 'px-4 py-2 text-sm'
  );

  const primaryButtonClasses = cn(
    buttonBaseClasses,
    'bg-gradient-to-r text-white shadow-md hover:shadow-lg',
    theme.config.primaryColor === 'purple' &&
      'from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 focus:ring-purple-500/50',
    theme.config.primaryColor === 'blue' &&
      'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-blue-500/50',
    theme.config.primaryColor === 'emerald' &&
      'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500/50',
    theme.config.primaryColor === 'amber' &&
      'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:ring-amber-500/50',
    theme.config.primaryColor === 'rose' &&
      'from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 focus:ring-rose-500/50',
    theme.config.primaryColor === 'dark' &&
      'from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:ring-cyan-500/50'
  );

  const secondaryButtonClasses = cn(
    buttonBaseClasses,
    'border-zinc-700/50 bg-zinc-800/50 text-zinc-100 hover:bg-zinc-700/80 focus:ring-zinc-500/50'
  );

  const dangerButtonClasses = cn(
    buttonBaseClasses,
    'border-red-500/50 bg-red-600/20 text-red-400 hover:bg-red-600/40 focus:ring-red-500/50'
  );

  // ================================
  // RENDER
  // ================================

  return (
    <div
      className={cn(
        'bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl',
        'shadow-xl transition-all duration-300',
        getSizeClasses(),
        className
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
