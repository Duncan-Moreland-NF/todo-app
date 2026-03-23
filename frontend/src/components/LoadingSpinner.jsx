import styles from '../styles/LoadingSpinner.module.css';

function LoadingSpinner() {
  return (
    <div className={styles.container} role="status" aria-label="Loading todos">
      <div className={styles.spinner} />
    </div>
  );
}

export default LoadingSpinner;
