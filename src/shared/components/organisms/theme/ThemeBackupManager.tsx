/**
 * CLAUDE.md COMPLIANCE: Theme Backup Manager Component
 * 
 * SRP: Single responsibility for theme backup operations
 * OCP: Open for extension via props interface
 * DIP: Depends on theme utilities abstraction
 */

import { useState, useCallback } from 'react';
import { Trash2, Download, Upload } from 'lucide-react';
import { cn } from '../../../utils/unifiedUtilities';
import type { ThemeBackup, ThemeExportData } from './utils/themeExportUtils';
import { 
  createThemeBackup, 
  downloadThemeAsFile, 
  getThemeConfigSummary 
} from './utils/themeExportUtils';

interface ThemeBackupManagerProps {
  /** Current theme data for creating backups */
  currentThemeData: ThemeExportData;
  /** Callback when backup is restored */
  onRestoreBackup: (backup: ThemeBackup) => void;
  /** Button styling classes */
  primaryButtonClasses: string;
  secondaryButtonClasses: string;
  dangerButtonClasses: string;
  /** Show/hide state */
  showBackups: boolean;
  onToggleBackups: () => void;
}

/**
 * ThemeBackupManager Component
 * Handles theme backup creation, restoration, and management
 * 
 * CLAUDE.md COMPLIANCE:
 * - SRP: Handles only backup-related operations
 * - DRY: Reusable backup management logic
 * - SOLID: Clean interface with dependency injection
 */
export const ThemeBackupManager: React.FC<ThemeBackupManagerProps> = ({
  currentThemeData,
  onRestoreBackup,
  primaryButtonClasses,
  secondaryButtonClasses,
  dangerButtonClasses,
  showBackups,
  onToggleBackups,
}) => {
  const [themeBackups, setThemeBackups] = useState<ThemeBackup[]>([]);

  const handleCreateBackup = useCallback(async () => {
    try {
      const backupName = `Backup ${new Date().toLocaleString()}`;
      const backup = createThemeBackup(currentThemeData, backupName);
      
      setThemeBackups(prev => [backup, ...prev]);
      
      // Optionally persist to localStorage
      const existingBackups = JSON.parse(
        localStorage.getItem('themeBackups') || '[]'
      );
      existingBackups.unshift(backup);
      localStorage.setItem('themeBackups', JSON.stringify(existingBackups));
      
    } catch (error) {
      console.error('Failed to create theme backup:', error);
    }
  }, [currentThemeData]);

  const handleRestoreBackup = useCallback((backup: ThemeBackup) => {
    if (window.confirm(`Restore backup "${backup.name}"? This will overwrite your current theme.`)) {
      onRestoreBackup(backup);
    }
  }, [onRestoreBackup]);

  const handleDeleteBackup = useCallback((backupId: string) => {
    if (window.confirm('Delete this backup? This action cannot be undone.')) {
      setThemeBackups(prev => prev.filter(backup => backup.id !== backupId));
      
      // Update localStorage
      const updatedBackups = themeBackups.filter(backup => backup.id !== backupId);
      localStorage.setItem('themeBackups', JSON.stringify(updatedBackups));
    }
  }, [themeBackups]);

  const handleDownloadBackup = useCallback((backup: ThemeBackup) => {
    const filename = `theme-backup-${backup.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    downloadThemeAsFile(backup.data, filename);
  }, []);

  // Load backups from localStorage on mount
  useState(() => {
    try {
      const savedBackups = JSON.parse(localStorage.getItem('themeBackups') || '[]');
      setThemeBackups(savedBackups);
    } catch (error) {
      console.warn('Failed to load theme backups from storage:', error);
    }
  });

  return (
    <div className="space-y-4">
      {/* Backup Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleCreateBackup}
          className={primaryButtonClasses}
        >
          Create Backup
        </button>
        
        <button
          onClick={onToggleBackups}
          className={secondaryButtonClasses}
        >
          {showBackups ? 'Hide Backups' : `Show Backups (${themeBackups.length})`}
        </button>
      </div>

      {/* Backup List */}
      {showBackups && (
        <div className="space-y-2">
          {themeBackups.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p>No theme backups created yet</p>
              <p className="text-sm mt-1">Create backups to save your current theme settings</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {themeBackups.map((backup) => (
                <div
                  key={backup.id}
                  className={cn(
                    'bg-zinc-800/50 rounded-lg p-3 border border-zinc-600/30',
                    'flex items-center justify-between'
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">
                      {backup.name}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {new Date(backup.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {getThemeConfigSummary(backup.data.config, backup.data.visualTheme)}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleDownloadBackup(backup)}
                      className={cn(
                        'p-1.5 rounded text-zinc-400 hover:text-white',
                        'hover:bg-zinc-700 transition-colors'
                      )}
                      title="Download backup"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      className={cn(
                        'p-1.5 rounded text-zinc-400 hover:text-blue-400',
                        'hover:bg-blue-900/30 transition-colors'
                      )}
                      title="Restore backup"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className={cn(
                        'p-1.5 rounded text-zinc-400 hover:text-red-400',
                        'hover:bg-red-900/30 transition-colors'
                      )}
                      title="Delete backup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeBackupManager;