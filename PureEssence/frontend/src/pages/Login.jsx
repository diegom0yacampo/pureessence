import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Login.module.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dni: '',
    address: '',
    identifier: '',
  });
  const { login, register, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLogin) {
      success = await login(formData.identifier, formData.password);
    } else {
      success = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.dni,
        formData.address
      );
    }
    if (success) navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={styles.cardSubtitle}>
            {isLogin ? 'Access your private collection' : 'Join the maison de parfum'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="vince_essence"
                />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="vince@example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>DNI</label>
                  <input
                    type="text"
                    name="dni"
                    required
                    value={formData.dni}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="12345678X"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Address (Optional)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Street, Number, City"
                />
              </div>
            </>
          )}

          {isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Username or Email</label>
              <input
                type="text"
                name="identifier"
                required
                value={formData.identifier}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your credentials"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          {authError && <p className={styles.error}>{authError}</p>}

          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className={styles.toggleWrap}>
          <button onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
