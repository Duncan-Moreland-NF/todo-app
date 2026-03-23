import { useState, useRef } from 'react';
import styles from '../styles/AddTodo.module.css';

function AddTodo({ onAdd }) {
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState('');
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setHint('Please enter a task');
      return;
    }

    onAdd(trimmed);
    setTitle('');
    setHint('');
    inputRef.current?.focus();
  }

  function handleChange(e) {
    setTitle(e.target.value);
    if (hint) setHint('');
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={title}
          onChange={handleChange}
          placeholder="What needs doing?"
          aria-label="New todo"
        />
        <button
          className={styles.button}
          type="submit"
          disabled={!title.trim()}
        >
          Add
        </button>
      </form>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

export default AddTodo;
