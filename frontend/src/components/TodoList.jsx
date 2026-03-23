import TodoItem from './TodoItem.jsx';
import styles from '../styles/TodoList.module.css';

function TodoList({ todos, onToggle, onDelete }) {
  return (
    <ul className={styles.list}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TodoList;
