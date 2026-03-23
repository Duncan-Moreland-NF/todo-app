import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTodo from '../../src/components/AddTodo.jsx';

describe('AddTodo', () => {
  it('renders input with correct placeholder', () => {
    render(<AddTodo onAdd={() => {}} />);
    expect(
      screen.getByPlaceholderText('What needs doing?'),
    ).toBeInTheDocument();
  });

  it('Add button is disabled when input is empty', () => {
    render(<AddTodo onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('Add button is enabled when input has text', async () => {
    render(<AddTodo onAdd={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('What needs doing?'), 'Buy milk');
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled();
  });

  it('calls onAdd with trimmed title on submit', async () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    await userEvent.type(
      screen.getByPlaceholderText('What needs doing?'),
      '  Buy milk  ',
    );
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(onAdd).toHaveBeenCalledWith('Buy milk');
  });

  it('clears input after successful submission', async () => {
    render(<AddTodo onAdd={() => {}} />);
    const input = screen.getByPlaceholderText('What needs doing?');

    await userEvent.type(input, 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(input).toHaveValue('');
  });

  it('does not call onAdd when input is whitespace-only', async () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs doing?');
    // Type spaces then submit via Enter
    await userEvent.type(input, '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows validation hint for empty submission', async () => {
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs doing?');
    // Type a valid character to enable the button, then add spaces and press Enter
    await userEvent.type(input, 'a');
    await userEvent.clear(input);
    // Now type just spaces and press Enter — button will be disabled so Enter
    // won't submit. Instead, test by typing a character to get the button enabled,
    // clearing via backspace, and pressing Enter before React re-renders button state.
    // Simpler approach: type a space char that won't get trimmed, but button check
    // is on trim(). The simplest test is to directly call requestSubmit in an act():
    await userEvent.type(input, ' ');

    // fireEvent.submit works even when button is disabled
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.submit(input.closest('form'));

    expect(screen.getByText('Please enter a task')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
