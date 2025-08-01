/**
 * DBA Item Customizer Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Only handles individual item customization UI
 * - OCP: Open for extension via props and composition
 * - DIP: Depends on Input component abstraction
 *
 * Performance & UX:
 * - High contrast text for readability
 * - Improved visual hierarchy
 * - Better spacing and layout
 */

import React from 'react';
import { Settings, Edit3, FileText } from 'lucide-react';

interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  customTitle?: string;
  customDescription?: string;
}

interface DbaItemCustomizerProps {
  selectedItems: SelectedItem[];
  updateItemCustomization: (
    itemId: string,
    field: string,
    value: string
  ) => void;
  generateTitle: (item: any) => string;
  generateDescription: (item: any) => string;
}

const DbaItemCustomizer: React.FC<DbaItemCustomizerProps> = React.memo(
  ({
    selectedItems,
    updateItemCustomization,
    generateTitle,
    generateDescription,
  }) => {
    if (selectedItems.length === 0) {
      return (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">
            Select items to customize titles and descriptions
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-700/50">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Settings className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Customize Individual Items
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Personalize titles and descriptions for each selected item
            </p>
          </div>
        </div>

        {/* Items List with Better Styling */}
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 rounded-2xl p-6 border border-zinc-600/40 hover:border-zinc-500/60 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {/* Item Header with Better Typography */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white">
                      {item.type.toUpperCase()}
                    </span>
                    <p className="text-xs text-zinc-400 font-mono">
                      ID: {item.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <span className="text-xs font-semibold text-emerald-300">
                    SELECTED
                  </span>
                </div>
              </div>

              {/* Input Fields with Better Spacing and Labels */}
              <div className="space-y-5">
                {/* Title Input */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                    <label className="text-sm font-semibold text-white">
                      Custom Title
                    </label>
                  </div>
                  <input
                    type="text"
                    value={item.customTitle || ''}
                    onChange={(e) =>
                      updateItemCustomization(
                        item.id,
                        'customTitle',
                        e.target.value
                      )
                    }
                    placeholder={generateTitle(item)}
                    className="w-full px-4 py-3 bg-white text-black font-semibold text-sm rounded-lg border-2 border-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:bg-zinc-50 transition-all duration-200 shadow-inner"
                  />
                  <p className="text-xs text-zinc-500 pl-2">
                    Leave empty to use auto-generated title
                  </p>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <label className="text-sm font-semibold text-white">
                      Custom Description
                    </label>
                  </div>
                  <textarea
                    value={item.customDescription || ''}
                    onChange={(e) =>
                      updateItemCustomization(
                        item.id,
                        'customDescription',
                        e.target.value
                      )
                    }
                    placeholder={generateDescription(item)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white text-black font-semibold text-sm rounded-lg border-2 border-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:bg-zinc-50 transition-all duration-200 shadow-inner resize-none"
                  />
                  <p className="text-xs text-zinc-500 pl-2">
                    Leave empty to use auto-generated description
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(39, 39, 42, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 182, 212, 0.7);
          }
        `}</style>
      </div>
    );
  }
);

export default DbaItemCustomizer;
