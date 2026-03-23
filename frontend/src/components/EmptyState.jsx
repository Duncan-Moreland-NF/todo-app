import styles from '../styles/EmptyState.module.css';

function EmptyState() {
  return (
    <div className={styles.container}>
      <span className={styles.icon} role="img" aria-label="Clipboard">
        📋
      </span>
      <h2 className={styles.heading}>Nothing here yet</h2>
      <p className={styles.subtext}>Add your first task above to get started</p>
    </div>
  );
}

export default EmptyState;
