/**
 * DBA Custom Description Input Component
 * Layer 3: Components (CLAUDE.md Architecture)
 */

import React from 'react';
import Input from '../common/Input';

interface DbaCustomDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const DbaCustomDescriptionInput: React.FC<DbaCustomDescriptionInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        Custom Description Prefix (Optional)
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Sjældent samler kort..."
        className="w-full"
      />
      <p className="text-xs text-zinc-400 mt-1">
        This text will be added before the auto-generated description
      </p>
    </div>
  );
};

export default DbaCustomDescriptionInput;
