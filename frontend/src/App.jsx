import styles from './styles/App.module.css';
import Header from './components/Header.jsx';
import AddTodo from './components/AddTodo.jsx';
import TodoList from './components/TodoList.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import { useTodos } from './hooks/useTodos.js';

function App() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo, dismissError } =
    useTodos();

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <AddTodo onAdd={addTodo} />
        {error && <ErrorBanner message={error} onDismiss={dismissError} />}
        {loading ? (
          <LoadingSpinner />
        ) : todos.length === 0 ? (
          <EmptyState />
        ) : (
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      </main>
    </div>
  );
}

export default App;
