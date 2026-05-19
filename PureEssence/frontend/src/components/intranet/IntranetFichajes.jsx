import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Timer, CalendarDays, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import styles from './IntranetFichajes.module.css';
import { API_URL } from '@/lib/api';

function parseSessions(records) {
  const asc = [...records].reverse();
  const sessions = [];
  let pendingEntry = null;

  for (const rec of asc) {
    if (rec.tipo === 'Entrada') {
      pendingEntry = rec;
    } else if (rec.tipo === 'Salida' && pendingEntry) {
      const entryDate = new Date(pendingEntry.fecha_hora);
      const exitDate  = new Date(rec.fecha_hora);
      const diffMs    = exitDate - entryDate;
      sessions.push({
        date: entryDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
        entrada: entryDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        salida:  exitDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        durationMs: diffMs,
        durationLabel: formatDuration(diffMs),
        isActive: false,
      });
      pendingEntry = null;
    }
  }

  if (pendingEntry) {
    const entryDate = new Date(pendingEntry.fecha_hora);
    sessions.push({
      date: entryDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
      entrada: entryDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      salida: null,
      durationMs: null,
      durationLabel: null,
      isActive: true,
    });
  }

  return sessions.reverse();
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function totalHoursLabel(sessions) {
  const totalMs = sessions.reduce((acc, s) => acc + (s.durationMs || 0), 0);
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function IntranetFichajes() {
  const [isClockedIn, setIsClockedIn]       = useState(false);
  const [loadingClock, setLoadingClock]     = useState(false);
  const [records, setRecords]               = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoadingHistory(true);
      const [statusRes, historyRes] = await Promise.all([
        axios.get('${API_URL}/clock/status'),
        axios.get('${API_URL}/clock/history'),
      ]);
      setIsClockedIn(statusRes.data.isClockedIn);
      setRecords(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClock = async () => {
    setLoadingClock(true);
    const type = isClockedIn ? 'Salida' : 'Entrada';
    try {
      await axios.post('${API_URL}/clock', { type });
      setIsClockedIn(!isClockedIn);
      toast.success(`Registro de ${type} completado.`);
      await fetchAll();
    } catch {
      toast.error('Error al registrar jornada.');
    } finally {
      setLoadingClock(false);
    }
  };

  const sessions           = parseSessions(records);
  const completedSessions  = sessions.filter(s => !s.isActive);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.wrap}>
      <div>
        <h2 className={styles.title}>Mis Fichajes</h2>
        <p className={styles.subtitle}>Registro de jornadas y horas trabajadas</p>
      </div>

      {/* Status + clock button */}
      <div className={`${styles.statusCard} ${isClockedIn ? styles.statusCardActive : ''}`}>
        <div className={styles.statusLeft}>
          <div className={`${styles.statusIcon} ${isClockedIn ? styles.statusIconActive : ''}`}>
            <Clock size={24} />
          </div>
          <div>
            <div className={styles.statusDot}>
              <div className={`${styles.dot} ${isClockedIn ? styles.dotActive : ''}`} />
              <span className={styles.dotLabel}>{isClockedIn ? 'En jornada' : 'Fuera de jornada'}</span>
            </div>
            <p className={styles.statusDesc}>
              {isClockedIn ? 'Actualmente registrado como presente' : 'No has fichado entrada todavía'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClock}
          disabled={loadingClock}
          className={`${styles.clockBtn} ${isClockedIn ? styles.clockBtnOut : ''}`}
        >
          {isClockedIn ? <LogOut size={16} /> : <LogIn size={16} />}
          {loadingClock ? 'Procesando...' : isClockedIn ? 'Fichar Salida' : 'Fichar Entrada'}
        </button>
      </div>

      {/* Summary stats */}
      {completedSessions.length > 0 && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <CalendarDays size={20} style={{ color: 'var(--color-gold)' }} />
            <p className={styles.statValue}>{completedSessions.length}</p>
            <p className={styles.statLabel}>Jornadas registradas</p>
          </div>
          <div className={styles.statCard}>
            <Timer size={20} style={{ color: 'var(--color-gold)' }} />
            <p className={styles.statValue}>{totalHoursLabel(completedSessions)}</p>
            <p className={styles.statLabel}>Total horas trabajadas</p>
          </div>
          <div className={styles.statCard}>
            <TrendingUp size={20} style={{ color: 'var(--color-gold)' }} />
            <p className={styles.statValue}>
              {formatDuration(completedSessions.reduce((a, s) => a + s.durationMs, 0) / completedSessions.length)}
            </p>
            <p className={styles.statLabel}>Media por jornada</p>
          </div>
        </div>
      )}

      {/* History */}
      <div className={styles.historyWrap}>
        <div className={styles.historyHead}>
          <p className={styles.historyLabel}>Historial de jornadas</p>
        </div>

        {loadingHistory ? (
          <p className={styles.loading}>Cargando historial...</p>
        ) : sessions.length === 0 ? (
          <p className={styles.centerMsg}>Sin registros de fichaje todavía</p>
        ) : (
          <table className={styles.historyTable}>
            <thead className={styles.historyThead}>
              <tr>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}>Entrada</th>
                <th className={styles.th}>Salida</th>
                <th className={`${styles.th} ${styles.thRight}`}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} className={`${styles.tr} ${s.isActive ? styles.trActive : ''}`}>
                  <td className={styles.td}>
                    <span className={styles.dateLabel}>{s.date}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.timeEntry}>
                      <div className={styles.dotGreen} />
                      <span className={styles.timeLabel}>{s.entrada}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    {s.salida ? (
                      <div className={styles.timeEntry}>
                        <div className={styles.dotRed} />
                        <span className={styles.timeLabel}>{s.salida}</span>
                      </div>
                    ) : (
                      <span className={styles.badgeActive}>
                        <div className={styles.dotActivePulse} /> En curso
                      </span>
                    )}
                  </td>
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    {s.durationLabel
                      ? <span className={styles.duration}>{s.durationLabel}</span>
                      : <span className={styles.durationEmpty}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
