import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../src/components/LoadingSpinner.jsx';

describe('LoadingSpinner', () => {
  it('has role="status"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label "Loading todos"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Loading todos',
    );
  });
});
