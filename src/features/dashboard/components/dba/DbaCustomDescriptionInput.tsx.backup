/**
 * DBA Custom Description Input Component
 * Layer 3: Components (CLAUDE.md Architecture)
 */

import React from 'react';
import { PokemonInput } from '../design-system/PokemonInput';

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
      <PokemonInput
        label="Custom Description Prefix (Optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="default"
        size="md"
        placeholder="e.g., Sjældent samler kort..."
        fullWidth={true}
        helper="This text will be added before the auto-generated description"
      />
    </div>
  );
};

export default DbaCustomDescriptionInput;
