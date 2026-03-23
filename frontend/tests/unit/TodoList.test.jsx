import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from '../../src/components/TodoList.jsx';

const mockTodos = [
  { id: 1, title: 'Buy milk', completed: false, created_at: '2026-03-23T10:00:00.000Z' },
  { id: 2, title: 'Walk dog', completed: true, created_at: '2026-03-23T11:00:00.000Z' },
  { id: 3, title: 'Read book', completed: false, created_at: '2026-03-23T12:00:00.000Z' },
];

describe('TodoList', () => {
  it('renders correct number of TodoItem components', () => {
    render(
      <TodoList todos={mockTodos} onToggle={() => {}} onDelete={() => {}} />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders a ul element', () => {
    render(
      <TodoList todos={mockTodos} onToggle={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders each todo title', () => {
    render(
      <TodoList todos={mockTodos} onToggle={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Walk dog')).toBeInTheDocument();
    expect(screen.getByText('Read book')).toBeInTheDocument();
  });
});
