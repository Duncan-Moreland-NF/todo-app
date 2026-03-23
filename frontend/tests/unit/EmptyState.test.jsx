import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../src/components/EmptyState.jsx';

describe('EmptyState', () => {
  it('renders the heading "Nothing here yet"', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('renders the subtext', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('Add your first task above to get started'),
    ).toBeInTheDocument();
  });

  it('renders an icon element', () => {
    render(<EmptyState />);
    expect(screen.getByRole('img', { name: /clipboard/i })).toBeInTheDocument();
  });
});
