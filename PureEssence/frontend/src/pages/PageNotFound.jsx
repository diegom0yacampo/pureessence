import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <div className={styles.divider} />
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.text}>
          La página{' '}
          <span className={styles.pageName}>"{pageName || 'desconocida'}"</span>{' '}
          no existe en esta aplicación.
        </p>
        <Link to="/" className={styles.btn}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
