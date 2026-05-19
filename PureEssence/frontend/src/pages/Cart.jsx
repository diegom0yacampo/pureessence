import React, { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { Trash2, Minus, Plus, ShoppingBag, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutModal from '@/components/CheckoutModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import styles from './Cart.module.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [detailItem, setDetailItem]     = useState(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setShowCheckout(true);
    }
  };

  if (cart.length === 0 && !showCheckout) {
    return (
      <div className={styles.emptyPage}>
        <ShoppingBag size={96} className={styles.emptyIcon} />
        <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
        <p className={styles.emptySubtitle}>Begin your olfactory journey</p>
        <Link to="/coleccion" className={styles.emptyBtn}>Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            cart={cart}
            cartTotal={cartTotal}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => clearCart()}
          />
        )}
      </AnimatePresence>

      {detailItem && (
        <ProductDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Your Bag</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsList}>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.itemCard}
                >
                  <button onClick={() => setDetailItem(item)} className={styles.itemImgBtn}>
                    <img
                      src={item.image_url || 'https://placehold.co/200x300?text=Perfume'}
                      alt={item.name}
                      className={styles.itemImg}
                    />
                    <div className={styles.itemImgOverlay}>
                      <Eye size={24} />
                    </div>
                  </button>

                  <div className={styles.itemBody}>
                    <h2 className={styles.itemName}>{item.name}</h2>
                    {item.customDetails && (
                      <p className={styles.itemCustom}>
                        Customized: {item.customDetails.fragrance} · {item.customDetails.bottle}
                      </p>
                    )}
                    {!item.customDetails && item.notes && (
                      <p className={styles.itemNotes}>{item.notes}</p>
                    )}
                    <p className={styles.itemPrice}>{item.price} €</p>

                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl}>
                        <button onClick={() => updateQuantity(index, -1)} className={styles.qtyBtn}>
                          <Minus size={16} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} className={styles.qtyBtn}>
                          <Plus size={16} />
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(index)} className={styles.removeBtn}>
                        <Trash2 size={16} /> Remove
                      </button>

                      <button onClick={() => setDetailItem(item)} className={styles.detailBtn}>
                        <Eye size={16} /> Detail
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemTotal}>
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Summary</h3>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span className={styles.summaryFree}>Complimentary</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutBtn}>
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Purchase'}
            </button>

            <p className={styles.summaryNote}>Tax calculated at checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
