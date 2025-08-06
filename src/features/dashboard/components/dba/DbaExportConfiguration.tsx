/**
 * DBA Export Configuration Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for export configuration UI
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { Settings } from 'lucide-react';
import { PokemonInput } from '../design-system/PokemonInput';
import DbaExportActionsCosmic from './DbaExportActionsCosmic';
import ItemCustomizationCard from './itemDisplay/ItemCustomizationCard';

interface SelectedItem {
  id: string;
  type: 'psa' | 'raw' | 'sealed';
  customTitle?: string;
  customDescription?: string;
}

interface DbaExportConfigurationProps {
  selectedItems: SelectedItem[];
  customDescription: string;
  setCustomDescription: (value: string) => void;
  updateItemCustomization: (
    itemId: string,
    field: string,
    value: string
  ) => void;
  generateTitle: (item: any) => string;
  generateDescription: (item: any) => string;
  exportCollectionData: (items: SelectedItem[], mode: string) => void;
  downloadZip: () => void;
  isExporting: boolean;
  exportResult: any;
}

const DbaExportConfiguration: React.FC<DbaExportConfigurationProps> =
  React.memo(
    ({
      selectedItems,
      customDescription,
      setCustomDescription,
      updateItemCustomization,
      generateTitle,
      generateDescription,
      exportCollectionData,
      downloadZip,
      isExporting,
      exportResult,
    }) => {
      if (selectedItems.length === 0) {
        return null;
      }

      return (
        <div className="relative group overflow-hidden">
          {/* Holographic background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>

          <div className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-800/85 to-zinc-900/95 backdrop-blur-3xl rounded-3xl border border-emerald-400/20 shadow-[0_0_60px_rgba(16,185,129,0.2)] p-10">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out rounded-3xl"></div>

            <div className="relative z-10">
              {/* Cosmic header */}
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    DBA Export Settings
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Configure your DBA.dk export
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Custom Description Prefix (Optional)
                  </label>
                  <PokemonInput
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g., Sjældent samler kort..."
                    className="w-full"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    This text will be added before the auto-generated
                    description
                  </p>
                </div>

                {/* Individual Item Customization */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-100 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-cyan-400" />
                    Customize Individual Items
                  </h3>
                  <div className="space-y-4">
                    {selectedItems.map((item) => (
                      <ItemCustomizationCard
                        key={item.id}
                        item={item}
                        generateTitle={generateTitle}
                        generateDescription={generateDescription}
                        updateItemCustomization={updateItemCustomization}
                      />
                    ))}
                  </div>
                </div>

                {/* Export Actions */}
                <DbaExportActionsCosmic
                  onExportToDba={() =>
                    exportCollectionData(selectedItems, 'selected')
                  }
                  onDownloadZip={downloadZip}
                  isExporting={isExporting}
                  hasExportResult={!!exportResult}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

DbaExportConfiguration.displayName = 'DbaExportConfiguration';
export default DbaExportConfiguration;
