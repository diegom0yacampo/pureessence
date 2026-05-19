import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Sparkles } from "lucide-react";
import styles from "./ProductDetailModal.module.css";

export default function ProductDetailModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  const isCustom = !!item.customDetails;
  const notes  = item.notes ? item.notes.split(" · ").filter(Boolean) : [];
  const aromas = isCustom && item.customDetails.fragrance
    ? item.customDetails.fragrance.split(" · ").filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.backdrop}
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className={styles.modal}
        >
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={16} />
          </button>

          <div className={styles.layout}>
            {/* Image */}
            <div className={styles.imageWrap}>
              <img
                src={item.image_url || "https://placehold.co/500x500?text=Perfume"}
                alt={item.name}
                className={styles.image}
              />
            </div>

            {/* Info */}
            <div className={styles.info}>
              <div className={styles.body}>
                {isCustom ? (
                  <div className={styles.badge}>
                    <Sparkles size={12} /> Tu creación
                  </div>
                ) : notes.length > 0 && (
                  <span className={styles.notesEyebrow}>{notes[0]}</span>
                )}

                <div className={styles.titleWrap}>
                  <h2 className={styles.title}>{item.name}</h2>
                  <hr className={styles.rule} />
                </div>

                {item.description && (
                  <p className={styles.description}>{item.description}</p>
                )}

                {!isCustom && notes.length > 0 && (
                  <div className={styles.chips}>
                    {notes.map((n, i) => (
                      <span key={i} className={styles.chip}>{n}</span>
                    ))}
                  </div>
                )}

                {isCustom && aromas.length > 0 && (
                  <div className={styles.chips}>
                    {aromas.map((a, i) => (
                      <span key={i} className={`${styles.chip} ${styles.chipGold}`}>{a}</span>
                    ))}
                  </div>
                )}

                {isCustom && (item.customDetails.bottle || item.customDetails.label) && (
                  <div className={styles.customDetail}>
                    {item.customDetails.bottle && (
                      <p><span className={styles.customLabel}>Frasco</span>{item.customDetails.bottle}</p>
                    )}
                    {item.customDetails.label && (
                      <p><span className={styles.customLabel}>Etiqueta</span>{item.customDetails.label}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <div className={styles.priceBlock}>
                  <p className={styles.unit}>50 ml</p>
                  <span className={styles.price}>{item.price}€</span>
                  {!isCustom && !(item.stock > 0) && (
                    <p className={styles.outOfStock}>Sin stock</p>
                  )}
                </div>
                {onAddToCart && (
                  <button
                    disabled={!isCustom && !(item.stock > 0)}
                    onClick={() => { onAddToCart(item); onClose(); }}
                    className={styles.addBtn}
                  >
                    <ShoppingBag size={16} />
                    {!isCustom && !(item.stock > 0) ? "Agotado" : "Añadir al carrito"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
