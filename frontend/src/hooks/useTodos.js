import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/todos.js';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dismissTimerRef = useRef(null);

  // Auto-dismiss error after 5 seconds
  const setErrorWithAutoDismiss = useCallback((msg) => {
    setError(msg);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setError(null);
      dismissTimerRef.current = null;
    }, 5000);
  }, []);

  // Fetch todos on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api.fetchTodos();
        if (!cancelled) {
          setTodos(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErrorWithAutoDismiss('Failed to load todos');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setErrorWithAutoDismiss]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const addTodo = useCallback(
    async (title) => {
      try {
        const newTodo = await api.createTodo(title);
        setTodos((prev) => [newTodo, ...prev]);
      } catch {
        setErrorWithAutoDismiss('Failed to add todo');
      }
    },
    [setErrorWithAutoDismiss],
  );

  const toggleTodo = useCallback(
    async (id, completed) => {
      try {
        const updated = await api.updateTodo(id, completed);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? updated : t)),
        );
      } catch {
        setErrorWithAutoDismiss('Failed to update todo');
      }
    },
    [setErrorWithAutoDismiss],
  );

  const deleteTodo = useCallback(
    async (id) => {
      try {
        await api.deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setErrorWithAutoDismiss('Failed to delete todo');
      }
    },
    [setErrorWithAutoDismiss],
  );

  const dismissError = useCallback(() => {
    setError(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  return { todos, loading, error, addTodo, toggleTodo, deleteTodo, dismissError };
}
