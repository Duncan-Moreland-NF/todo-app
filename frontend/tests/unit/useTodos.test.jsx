import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTodos } from '../../src/hooks/useTodos.js';

vi.mock('../../src/api/todos.js', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const api = await import('../../src/api/todos.js');

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches todos on mount', async () => {
    const mockTodos = [{ id: 1, title: 'Test', completed: false }];
    api.fetchTodos.mockResolvedValue(mockTodos);

    const { result } = renderHook(() => useTodos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.todos).toEqual(mockTodos);
    expect(api.fetchTodos).toHaveBeenCalledOnce();
  });

  it('sets loading to true then false after fetch', async () => {
    api.fetchTodos.mockResolvedValue([]);

    const { result } = renderHook(() => useTodos());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('sets error on failed fetch', async () => {
    api.fetchTodos.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load todos');
    });
    expect(result.current.loading).toBe(false);
  });

  it('addTodo adds new todo to start of list', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Existing', completed: false },
    ]);
    api.createTodo.mockResolvedValue({
      id: 2,
      title: 'New',
      completed: false,
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTodo('New');
    });

    expect(result.current.todos[0].title).toBe('New');
    expect(result.current.todos).toHaveLength(2);
  });

  it('toggleTodo updates the correct todo', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Test', completed: false },
    ]);
    api.updateTodo.mockResolvedValue({
      id: 1,
      title: 'Test',
      completed: true,
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleTodo(1, true);
    });

    expect(result.current.todos[0].completed).toBe(true);
  });

  it('deleteTodo removes the correct todo', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Test', completed: false },
      { id: 2, title: 'Keep', completed: false },
    ]);
    api.deleteTodo.mockResolvedValue();

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTodo(1);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe(2);
  });

  it('dismissError clears error state', async () => {
    api.fetchTodos.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.dismissError();
    });

    expect(result.current.error).toBeNull();
  });

  it('sets error when addTodo fails', async () => {
    api.fetchTodos.mockResolvedValue([]);
    api.createTodo.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTodo('Test');
    });

    expect(result.current.error).toBe('Failed to add todo');
  });

  it('sets error when toggleTodo fails', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Test', completed: false },
    ]);
    api.updateTodo.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleTodo(1, true);
    });

    expect(result.current.error).toBe('Failed to update todo');
  });

  it('sets error when deleteTodo fails', async () => {
    api.fetchTodos.mockResolvedValue([
      { id: 1, title: 'Test', completed: false },
    ]);
    api.deleteTodo.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTodo(1);
    });

    expect(result.current.error).toBe('Failed to delete todo');
  });
});
