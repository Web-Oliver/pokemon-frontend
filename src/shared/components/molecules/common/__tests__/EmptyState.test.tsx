import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Items Found"
        description="Try adjusting your search criteria"
      />
    );

    expect(screen.getByText('No Items Found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search criteria')
    ).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState title="Empty State" />);

    expect(screen.getByText('Empty State')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState title="Test" className="custom-class" />);

    const element = screen.getByText('Test').closest('div');
    expect(element).toHaveClass('custom-class');
  });
});
