import styles from './styles/App.module.css';
import Header from './components/Header.jsx';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <p>Todo app — coming soon</p>
      </main>
    </div>
  );
}

export default App;
