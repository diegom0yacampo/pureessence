import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, User, Mail, Briefcase, Trash2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import styles from './IntranetUsers.module.css';
import { API_URL } from '@/lib/api';

export default function IntranetUsers() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';

  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [deletingId, setDeletingId]     = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/admin/users`);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setDeletingId(null);
      toast.success("Usuario eliminado");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar el usuario");
    }
  };

  const changeRole = async (u, newDisplayRole) => {
    setChangingRoleId(u.id);
    try {
      if (newDisplayRole === 'Admin') {
        await axios.patch(`${API_URL}/admin/users/${u.id}/role`, { role: 'Admin' });
        setUsers(users.map(x => x.id === u.id ? { ...x, role: 'Admin', es_empleado: true } : x));
      } else if (newDisplayRole === 'Empleado') {
        await axios.patch(`${API_URL}/admin/users/${u.id}/role`, { role: 'User' });
        await axios.patch(`${API_URL}/admin/users/${u.id}/status`, { active: true });
        setUsers(users.map(x => x.id === u.id ? { ...x, role: 'User', es_empleado: true } : x));
      } else {
        await axios.patch(`${API_URL}/admin/users/${u.id}/role`, { role: 'User' });
        await axios.patch(`${API_URL}/admin/users/${u.id}/status`, { active: false });
        setUsers(users.map(x => x.id === u.id ? { ...x, role: 'User', es_empleado: false } : x));
      }
      toast.success(`Rol cambiado a ${newDisplayRole}`);
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Error al cambiar el rol");
    } finally {
      setChangingRoleId(null);
    }
  };

  const getDisplayRole = (u) => {
    if (u.role === 'Admin') return 'Admin';
    if (u.es_empleado) return 'Empleado';
    return 'Usuario';
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'employees') return u.es_empleado || u.role === 'Admin';
    if (filter === 'clients')   return !u.es_empleado && u.role !== 'Admin';
    return true;
  });

  if (loading) return <div className={styles.loading}>CARGANDO USUARIOS...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Directorio de Usuarios</h2>
          <p className={styles.subtitle}>Gestión de personal y clientes registrados</p>
        </div>

        <div className={styles.filterWrap}>
          {[['all', 'Todos'], ['clients', 'Usuarios'], ['employees', 'Trabajadores']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`${styles.filterBtn} ${filter === val ? styles.filterBtnActive : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredUsers.map((u) => {
          const displayRole = getDisplayRole(u);
          const isSelf = u.id === currentUser?.id;

          return (
            <div key={u.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTopLeft}>
                  <div className={styles.iconWrap}>
                    {u.role === 'Admin' ? <Shield size={16} /> : (u.es_empleado ? <Briefcase size={16} /> : <User size={16} />)}
                  </div>
                  <span className={u.role === 'Admin' ? styles.roleAdmin : (u.es_empleado ? styles.roleEmp : styles.roleClient)}>
                    {u.role === 'Admin' ? 'Admin' : (u.es_empleado ? 'Empleado' : 'Cliente')}
                  </span>
                </div>

                {isAdmin && !isSelf && (
                  deletingId === u.id ? (
                    <div className={styles.deleteConfirm}>
                      <button onClick={() => deleteUser(u.id)} className={styles.confirmOk}>OK</button>
                      <button onClick={() => setDeletingId(null)} className={styles.confirmNo}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingId(u.id)} className={styles.deleteBtn} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  )
                )}
              </div>

              <h3 className={styles.userName}>{u.username}</h3>
              <div className={styles.emailRow}>
                <Mail size={12} style={{ flexShrink: 0 }} />
                <span className={styles.emailText}>{u.email}</span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.idLabel}>#{u.id}</span>

                {isAdmin && !isSelf ? (
                  <div className={styles.roleSelectWrap}>
                    <select
                      value={displayRole}
                      disabled={changingRoleId === u.id}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className={styles.roleSelect}
                    >
                      <option value="Usuario">Usuario</option>
                      <option value="Empleado">Empleado</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <ChevronDown size={10} className={styles.roleSelectChevron} />
                  </div>
                ) : (
                  u.es_empleado && <span className={styles.verified}>Verificado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No se han encontrado registros en esta categoría</p>
        </div>
      )}
    </motion.div>
  );
}
