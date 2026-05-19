import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, ChevronUp, MapPin, Calendar, Package } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import styles from "./IntranetOrders.module.css";
import { API_URL } from "@/lib/api";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_META = {
  pending:    { label: "Pendiente",  badgeClass: "statusPending",    activeBtnClass: "statusBtnActivePending"    },
  processing: { label: "En proceso", badgeClass: "statusProcessing", activeBtnClass: "statusBtnActiveProcessing" },
  shipped:    { label: "Enviado",    badgeClass: "statusShipped",    activeBtnClass: "statusBtnActiveShipped"    },
  delivered:  { label: "Entregado",  badgeClass: "statusDelivered",  activeBtnClass: "statusBtnActiveDelivered"  },
  cancelled:  { label: "Cancelado",  badgeClass: "statusCancelled",  activeBtnClass: "statusBtnActiveCancelled"  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, badgeClass: "" };
  return (
    <span className={`${styles.badge} ${styles[meta.badgeClass] || ""}`}>
      {meta.label}
    </span>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded]         = useState(false);
  const [items, setItems]               = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const fetchItems = async () => {
    if (items) return;
    setLoadingItems(true);
    try {
      const { data } = await axios.get(`${API_URL}/orders/${order.id}`);
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) fetchItems();
    setExpanded(v => !v);
  };

  const handleStatus = async (newStatus) => {
    setChangingStatus(true);
    try {
      await axios.patch(`${API_URL}/orders/${order.id}/status`, { status: newStatus });
      onStatusChange(order.id, newStatus);
      toast.success(`Estado actualizado a "${STATUS_META[newStatus]?.label || newStatus}"`);
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setChangingStatus(false);
    }
  };

  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const customerName = [order.nombre, order.apellido].filter(Boolean).join(" ") || `Cliente #${order.customer_id}`;

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader} onClick={handleExpand}>
        <div className={styles.orderCustomer}>
          <div className={styles.orderIconWrap}>
            <ShoppingBag size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className={styles.orderName}>{customerName}</p>
            <p className={styles.orderId}>#{String(order.id).padStart(6, "0")}</p>
          </div>
        </div>

        <div className={styles.orderMetaHidden}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
            {order.ciudad || order.address || "—"}
          </span>
        </div>

        <div className={styles.orderMeta}>
          <Calendar size={12} style={{ flexShrink: 0 }} />
          <span>{date}</span>
        </div>

        <div className={styles.orderMeta}>
          <Package size={12} style={{ flexShrink: 0 }} />
          <span>{order.item_count || 0} art.</span>
        </div>

        <p className={styles.orderTotal}>{parseFloat(order.total || 0).toFixed(2)} €</p>

        <StatusBadge status={order.status} />

        {expanded ? <ChevronUp size={16} style={{ color: '#9ca3af', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.expandedDetail}>
              <div className={styles.detailGrid}>
                <div className={styles.detailBox}>
                  <p className={styles.detailBoxLabel}>Datos de envío</p>
                  <p className={styles.detailName}>{customerName}</p>
                  {order.address && <p className={styles.detailAddress}>{order.address}</p>}
                </div>

                <div className={styles.detailBox}>
                  <p className={styles.detailBoxLabel}>Cambiar estado</p>
                  <div className={styles.statusButtons}>
                    {STATUS_OPTIONS.map(s => {
                      const meta = STATUS_META[s];
                      const isActive = order.status === s;
                      return (
                        <button
                          key={s}
                          disabled={isActive || changingStatus}
                          onClick={() => handleStatus(s)}
                          className={`${styles.statusBtn} ${isActive ? styles[meta.activeBtnClass] : ""}`}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.itemsBox}>
                <p className={styles.itemsBoxLabel}>Productos</p>
                {loadingItems ? (
                  <p className={styles.loadingText}>Cargando...</p>
                ) : items && items.length > 0 ? (
                  <>
                    {items.map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <div className={styles.itemImg}>
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} className={styles.itemImgEl} />
                            : <div className={styles.itemImgPlaceholder}>IMG</div>
                          }
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemName}>{item.name || "Producto personalizado"}</p>
                          <p className={styles.itemQty}>×{item.quantity} · {parseFloat(item.unit_price).toFixed(2)} €/ud</p>
                        </div>
                        <p className={styles.itemSubtotal}>{parseFloat(item.subtotal).toFixed(2)} €</p>
                      </div>
                    ))}
                    <div className={styles.itemsTotal}>
                      <span className={styles.itemsTotalLabel}>{parseFloat(order.total).toFixed(2)} € total</span>
                    </div>
                  </>
                ) : (
                  <p className={styles.loadingText}>Sin líneas de producto</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntranetOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("${API_URL}/orders");
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Pedidos</h2>
          <p className={styles.subtitle}>
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} registrado{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className={styles.chips}>
          {Object.entries(counts).map(([s, count]) => count > 0 && (
            <span key={s} className={`${styles.badge} ${styles[STATUS_META[s].badgeClass]}`}>
              {STATUS_META[s].label} · {count}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.filterWrap}>
        {[["all", "Todos"], ...STATUS_OPTIONS.map(s => [s, STATUS_META[s].label])].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`${styles.filterBtn} ${filter === val ? styles.filterBtnActive : ""}`}
          >
            {label} {val !== "all" && counts[val] > 0 ? `(${counts[val]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonItem} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={40} className={styles.emptyIcon} />
          <p className={styles.emptyText}>No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filtered.map(order => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
