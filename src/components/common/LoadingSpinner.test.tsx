/**
 * Unit Tests for LoadingSpinner Component
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByLabelText(/loading/i);
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8', 'h-8'); // medium size
    expect(spinner).toHaveClass('text-blue-600'); // blue color
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size='sm' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size='lg' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('w-12', 'h-12');

    rerender(<LoadingSpinner size='xl' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('w-16', 'h-16');
  });

  it('renders different colors correctly', () => {
    const { rerender } = render(<LoadingSpinner color='gray' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('text-gray-600');

    rerender(<LoadingSpinner color='green' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('text-green-600');

    rerender(<LoadingSpinner color='red' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('text-red-600');

    rerender(<LoadingSpinner color='yellow' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('text-yellow-600');

    rerender(<LoadingSpinner color='purple' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('text-purple-600');
  });

  it('renders with text', () => {
    render(<LoadingSpinner text='Loading data...' />);

    expect(screen.getByText(/loading data.../i)).toBeInTheDocument();
    expect(screen.getByText(/loading data.../i)).toHaveClass('text-gray-600');
  });

  it('renders text with correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size='sm' text='Loading...' />);
    expect(screen.getByText(/loading.../i)).toHaveClass('text-sm');

    rerender(<LoadingSpinner size='lg' text='Loading...' />);
    expect(screen.getByText(/loading.../i)).toHaveClass('text-lg');

    rerender(<LoadingSpinner size='xl' text='Loading...' />);
    expect(screen.getByText(/loading.../i)).toHaveClass('text-xl');
  });

  it('renders in full screen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />);

    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass('fixed', 'inset-0', 'z-50');
    expect(outerContainer).toHaveClass('bg-white', 'bg-opacity-75');
  });

  it('renders in regular mode (not full screen)', () => {
    const { container } = render(<LoadingSpinner />);

    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center');
    expect(outerContainer).not.toHaveClass('fixed', 'inset-0');
  });

  it('applies custom className correctly', () => {
    render(<LoadingSpinner className='custom-spinner' />);
    expect(screen.getByLabelText(/loading/i)).toHaveClass('custom-spinner');
  });

  it('renders SVG with correct structure', () => {
    render(<LoadingSpinner />);

    const svg = screen.getByLabelText(/loading/i);
    expect(svg.tagName).toBe('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');

    // Check for circle and path elements
    const circle = svg.querySelector('circle');
    const path = svg.querySelector('path');

    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    expect(circle).toHaveClass('opacity-25');
    expect(path).toHaveClass('opacity-75');
  });

  it('renders with combined props correctly', () => {
    render(
      <LoadingSpinner size='lg' color='green' text='Processing...' className='custom-class' />
    );

    const spinner = screen.getByLabelText(/loading/i);
    expect(spinner).toHaveClass('w-12', 'h-12', 'text-green-600', 'custom-class');

    const text = screen.getByText(/processing.../i);
    expect(text).toHaveClass('text-lg');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByLabelText(/loading/i);
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
