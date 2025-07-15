/**
 * Unit Tests for Input Component
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/username/i)).toHaveClass('text-sm', 'font-medium');
  });

  it('renders error state correctly', () => {
    render(<Input error="This field is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
    expect(screen.getByText(/this field is required/i)).toHaveClass('text-red-600');
  });

  it('renders helper text when no error', () => {
    render(<Input helperText="Enter your username" />);
    
    expect(screen.getByText(/enter your username/i)).toHaveClass('text-gray-500');
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        error="Error message" 
        helperText="Helper text" 
      />
    );
    
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
  });

  it('renders full width when specified', () => {
    render(<Input fullWidth data-testid="input" />);
    
    const container = screen.getByTestId('input').closest('div');
    expect(container).toHaveClass('w-full');
  });

  it('renders with start icon', () => {
    const StartIcon = () => <span data-testid="start-icon">📧</span>;
    render(<Input startIcon={<StartIcon />} />);
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pl-10');
  });

  it('renders with end icon', () => {
    const EndIcon = () => <span data-testid="end-icon">👁️</span>;
    render(<Input endIcon={<EndIcon />} />);
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pr-10');
  });

  it('renders with both start and end icons', () => {
    const StartIcon = () => <span data-testid="start-icon">📧</span>;
    const EndIcon = () => <span data-testid="end-icon">👁️</span>;
    render(<Input startIcon={<StartIcon />} endIcon={<EndIcon />} />);
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pl-10', 'pr-10');
  });

  it('handles value changes correctly', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'test value' })
    }));
  });

  it('applies custom className correctly', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('passes through HTML input props', () => {
    render(
      <Input 
        type="email" 
        required 
        data-testid="email-input" 
        maxLength={50}
      />
    );
    
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('generates unique id when not provided', () => {
    render(<Input label="Test Label" />);
    
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('id');
    expect(input.getAttribute('id')).toMatch(/^input-/);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test Label" />);
    
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});