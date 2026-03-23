import styles from '../styles/ErrorBanner.module.css';

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.message}>
        {message || 'Something went wrong. Please try again.'}
      </span>
      <button
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

export default ErrorBanner;
