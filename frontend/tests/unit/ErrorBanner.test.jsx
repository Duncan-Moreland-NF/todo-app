import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBanner from '../../src/components/ErrorBanner.jsx';

describe('ErrorBanner', () => {
  it('renders the default error message', () => {
    render(<ErrorBanner onDismiss={() => {}} />);
    expect(
      screen.getByText('Something went wrong. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders a custom error message', () => {
    render(<ErrorBanner message="Custom error" onDismiss={() => {}} />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has role="alert"', () => {
    render(<ErrorBanner onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
