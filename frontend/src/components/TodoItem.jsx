import styles from '../styles/TodoItem.module.css';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`${styles.item} ${todo.completed ? styles.completed : ''}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <span className={styles.title}>{todo.title}</span>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete: ${todo.title}`}
      >
        ✕
      </button>
    </li>
  );
}

export default TodoItem;
