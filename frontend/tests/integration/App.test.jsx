import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';

// Mock the API module
vi.mock('../../src/api/todos.js', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const api = await import('../../src/api/todos.js');

const mockTodos = [
  { id: 2, title: 'Walk dog', completed: false, created_at: '2026-03-23T11:00:00.000Z' },
  { id: 1, title: 'Buy milk', completed: false, created_at: '2026-03-23T10:00:00.000Z' },
];

describe('App integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state then todos', async () => {
    api.fetchTodos.mockResolvedValue(mockTodos);
    render(<App />);

    // Loading spinner should appear initially
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Then todos should load
    await waitFor(() => {
      expect(screen.getByText('Walk dog')).toBeInTheDocument();
    });
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows empty state when no todos exist', async () => {
    api.fetchTodos.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    });
  });

  it('adding a todo updates the list', async () => {
    api.fetchTodos.mockResolvedValue([]);
    api.createTodo.mockResolvedValue({
      id: 1,
      title: 'New task',
      completed: false,
      created_at: '2026-03-23T12:00:00.000Z',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What needs doing?');
    await userEvent.type(input, 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument();
    });
    expect(screen.queryByText('Nothing here yet')).not.toBeInTheDocument();
  });

  it('toggling a todo updates the item', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Buy milk', completed: false, created_at: '2026-03-23T10:00:00.000Z' },
    ]);
    api.updateTodo.mockResolvedValue({
      id: 1,
      title: 'Buy milk',
      completed: true,
      created_at: '2026-03-23T10:00:00.000Z',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  it('deleting a todo removes the item', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Buy milk', completed: false, created_at: '2026-03-23T10:00:00.000Z' },
    ]);
    api.deleteTodo.mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: /delete: buy milk/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
    // Should show empty state after deleting the last todo
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('error banner shows on API failure', async () => {
    api.fetchTodos.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
