/**
 * Label - Reusable premium label component
 * Eliminates duplicate label styling across form components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized label styling and animations
 * - Consistent focus-within color transitions
 * - Reusable across Input, Select, and other form elements
 */

import React from 'react';

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-bold text-zinc-300 mb-2 tracking-wide group-focus-within:text-cyan-400 transition-colors duration-300 ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
