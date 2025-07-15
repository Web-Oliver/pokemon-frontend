/**
 * Unit Tests for Select Component
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Select from './Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select Component', () => {
  it('renders with default props', () => {
    render(<Select options={mockOptions} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Select label="Choose Option" options={mockOptions} />);
    
    expect(screen.getByLabelText(/choose option/i)).toBeInTheDocument();
    expect(screen.getByText(/choose option/i)).toHaveClass('text-sm', 'font-medium');
  });

  it('renders placeholder option', () => {
    render(<Select options={mockOptions} placeholder="Select something..." />);
    
    expect(screen.getByText(/select something.../i)).toBeInTheDocument();
  });

  it('renders all options correctly', () => {
    render(<Select options={mockOptions} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles disabled options correctly', () => {
    render(<Select options={mockOptions} />);
    
    const option3 = screen.getByRole('option', { name: 'Option 3' });
    expect(option3).toBeDisabled();
  });

  it('renders error state correctly', () => {
    render(<Select options={mockOptions} error="Please select an option" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-300');
    expect(screen.getByText(/please select an option/i)).toHaveClass('text-red-600');
  });

  it('renders helper text when no error', () => {
    render(<Select options={mockOptions} helperText="Choose wisely" />);
    
    expect(screen.getByText(/choose wisely/i)).toHaveClass('text-gray-500');
  });

  it('prioritizes error over helper text', () => {
    render(
      <Select 
        options={mockOptions}
        error="Error message" 
        helperText="Helper text" 
      />
    );
    
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
  });

  it('renders full width when specified', () => {
    render(<Select options={mockOptions} fullWidth data-testid="select" />);
    
    const container = screen.getByTestId('select').closest('div');
    expect(container).toHaveClass('w-full');
  });

  it('handles value changes correctly', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'option2' })
    }));
  });

  it('applies custom className correctly', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-class');
  });

  it('passes through HTML select props', () => {
    render(
      <Select 
        options={mockOptions}
        required 
        data-testid="test-select" 
        name="test-name"
      />
    );
    
    const select = screen.getByTestId('test-select');
    expect(select).toHaveAttribute('required');
    expect(select).toHaveAttribute('name', 'test-name');
  });

  it('generates unique id when not provided', () => {
    render(<Select options={mockOptions} label="Test Label" />);
    
    const select = screen.getByLabelText(/test label/i);
    expect(select).toHaveAttribute('id');
    expect(select.getAttribute('id')).toMatch(/^select-/);
  });

  it('uses provided id', () => {
    render(<Select options={mockOptions} id="custom-id" label="Test Label" />);
    
    const select = screen.getByLabelText(/test label/i);
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(<Select options={mockOptions} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('renders chevron down icon', () => {
    render(<Select options={mockOptions} />);
    
    // Check for the presence of the chevron down icon by looking for svg
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('sets correct option values', () => {
    render(<Select options={mockOptions} value="option1" readOnly />);
    
    const option1 = screen.getByRole('option', { name: 'Option 1' }) as HTMLOptionElement;
    const option2 = screen.getByRole('option', { name: 'Option 2' }) as HTMLOptionElement;
    
    expect(option1.value).toBe('option1');
    expect(option2.value).toBe('option2');
  });
});