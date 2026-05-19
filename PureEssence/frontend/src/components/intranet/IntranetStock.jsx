import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Check, AlertTriangle, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import styles from './IntranetStock.module.css';
import { API_URL } from '@/lib/api';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', family: '', image_url: '' };

export default function IntranetStock() {
  const [activeType, setActiveType] = useState('perfumes');
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchData(); }, [activeType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ep = activeType === 'perfumes' ? `${API_URL}/products` : activeType === 'ingredients' ? `${API_URL}/admin/ingredients` : `${API_URL}/admin/bottles`;
      const { data: result } = await axios.get(ep);
      setData(result.sort((a, b) => a.id - b.id));
    } catch { console.error("Error fetching stock"); }
    finally { setLoading(false); }
  };

  const updateStock = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      const ep = activeType === 'perfumes' ? `${API_URL}/products/${id}/stock` : activeType === 'ingredients' ? `${API_URL}/ingredients/${id}/stock` : `${API_URL}/bottles/${id}/stock`;
      await axios.patch(ep, { stock: newStock });
      setData(data.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast.success("Stock actualizado");
    } catch { toast.error("Error al actualizar stock"); }
  };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const ep = activeType === 'perfumes' ? `${API_URL}/products/${id}` : activeType === 'ingredients' ? `${API_URL}/ingredients/${id}` : `${API_URL}/bottles/${id}`;
      await axios.delete(ep);
      setData(data.filter(p => p.id !== id));
      toast.success(`"${name}" eliminado`);
    } catch { toast.error("Error al eliminar"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const ep = activeType === 'perfumes' ? `${API_URL}/products` : activeType === 'ingredients' ? `${API_URL}/ingredients` : `${API_URL}/bottles`;
      const payload = { name: form.name, description: form.description, price: parseFloat(form.price) || 0, stock: parseInt(form.stock, 10) || 0, ...(activeType === 'ingredients' && { family: form.family }), ...(form.image_url && { image_url: form.image_url }) };
      const { data: created } = await axios.post(ep, payload);
      setData(prev => [...prev, created].sort((a, b) => a.id - b.id));
      toast.success(`"${form.name}" añadido`);
      setShowModal(false); setForm(EMPTY_FORM);
    } catch { toast.error("Error al añadir"); }
    finally { setSaving(false); }
  };

  const filteredData = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const TABS = [{ id: 'perfumes', label: 'Perfumes Precreados' }, { id: 'ingredients', label: 'Ingredientes' }, { id: 'bottles', label: 'Frascos Vacíos' }];

  if (loading) return <div className={styles.loading}>CARGANDO INVENTARIO...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Gestión de Stock</h2>
          <p className={styles.subtitle}>Control de inventario y disponibilidad</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} className={styles.addBtn}>
            <Plus size={16} /> Añadir
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveType(tab.id)} className={`${styles.tab} ${activeType === tab.id ? styles.tabActive : ''}`}>
            {tab.label}
            {activeType === tab.id && <motion.div layoutId="activeTab" className={styles.tabBar} />}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Nombre</th>
              <th className={`${styles.th} ${styles.thCenter}`}>Estado</th>
              <th className={`${styles.th} ${styles.thRight}`}>Stock</th>
              <th className={`${styles.th} ${styles.thCenter}`}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(p => (
              <tr key={p.id} className={styles.tr}>
                <td className={styles.td}><span className={styles.idCell}>#{p.id}</span></td>
                <td className={styles.td}>
                  <p className={styles.nameCell}>{p.name}</p>
                  <p className={styles.descCell}>{p.description || p.family}</p>
                </td>
                <td className={`${styles.td} ${styles.statusCell}`}>
                  {p.stock === 0
                    ? <span className={styles.badgeSoldOut}><AlertTriangle size={12} /> Agotado</span>
                    : <span className={styles.badgeAvailable}><Check size={12} /> Disponible</span>}
                </td>
                <td className={styles.td}>
                  <div className={styles.stockControls}>
                    <button onClick={() => updateStock(p.id, p.stock - 1)} className={styles.stockBtn}><Minus size={16} /></button>
                    <input type="number" min="0" value={p.stock}
                      onChange={e => { const v = parseInt(e.target.value,10); if (!isNaN(v)&&v>=0) setData(data.map(x=>x.id===p.id?{...x,stock:v}:x)); }}
                      onBlur={e => { const v = parseInt(e.target.value,10); if (!isNaN(v)&&v>=0) updateStock(p.id,v); }}
                      onKeyDown={e => { if(e.key==='Enter') e.target.blur(); }}
                      className={`${styles.stockInput} ${p.stock <= 5 ? styles.stockInputLow : ''}`}
                    />
                    <button onClick={() => updateStock(p.id, p.stock + 1)} className={styles.stockBtn}><Plus size={16} /></button>
                  </div>
                </td>
                <td className={styles.td}>
                  <button onClick={() => deleteItem(p.id, p.name)} className={styles.deleteBtn} title="Eliminar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <div className={styles.empty}>No se encontraron registros</div>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Añadir {activeType === 'perfumes' ? 'Perfume' : activeType === 'ingredients' ? 'Ingrediente' : 'Frasco'}</h3>
                <button onClick={() => setShowModal(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className={styles.form}>
                <div><label className={styles.formLabel}>Nombre *</label><input required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className={styles.formInput} /></div>
                <div><label className={styles.formLabel}>Descripción</label><textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} className={styles.formTextarea} /></div>
                {activeType === 'ingredients' && <div><label className={styles.formLabel}>Familia olfativa</label><input value={form.family} onChange={e => setForm(f=>({...f,family:e.target.value}))} placeholder="Citrus, Floral, Woody..." className={styles.formInput} /></div>}
                <div className={styles.formGrid}>
                  <div><label className={styles.formLabel}>Precio (€) *</label><input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} className={styles.formInput} /></div>
                  <div><label className={styles.formLabel}>Stock *</label><input required type="number" min="0" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} className={styles.formInput} /></div>
                </div>
                <div><label className={styles.formLabel}>URL Imagen</label><input value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://..." className={styles.formInput} /></div>
                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancelar</button>
                  <button type="submit" disabled={saving} className={styles.saveBtn}>{saving ? 'Guardando...' : 'Añadir'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
