import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../src/components/TodoItem.jsx';

const baseTodo = {
  id: 1,
  title: 'Buy milk',
  completed: false,
  created_at: '2026-03-23T10:00:00.000Z',
};

describe('TodoItem', () => {
  it('renders title text', () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>,
    );
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('shows strikethrough when completed is true', () => {
    const completedTodo = { ...baseTodo, completed: true };
    const { container } = render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>,
    );
    const li = container.querySelector('li');
    expect(li.className).toContain('completed');
  });

  it('checkbox is checked when completed is true', () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('checkbox is unchecked when completed is false', () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={onToggle} onDelete={() => {}} />
      </ul>,
    );

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={() => {}} onDelete={onDelete} />
      </ul>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /delete: buy milk/i }),
    );

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('delete button has correct aria-label', () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={() => {}} onDelete={() => {}} />
      </ul>,
    );
    expect(
      screen.getByRole('button', { name: 'Delete: Buy milk' }),
    ).toBeInTheDocument();
  });
});
