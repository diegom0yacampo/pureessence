import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, MapPin, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import axios from 'axios';
import styles from './CheckoutModal.module.css';
import { API_URL } from '@/lib/api';

const COUNTRIES = ['España', 'Francia', 'Italia', 'Portugal', 'Alemania', 'Reino Unido', 'Estados Unidos', 'Otro'];

function Field({ label, value, onChange, error, type = 'text', placeholder = '', maxLength, mono = false }) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${styles.input} ${error ? styles.inputError : ''} ${mono ? styles.inputMono : ''}`}
      />
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}

function luhnCheck(num) {
  const digits = num.replace(/\s/g, '').split('').reverse().map(Number);
  if (digits.length < 13) return false;
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
}

export default function CheckoutModal({ cart, cartTotal, onClose, onSuccess }) {
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [shipping, setShipping] = useState({
    nombre: '', apellido: '', calle: '', ciudad: '', codigo_postal: '', pais: 'España',
  });

  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const validateShipping = () => {
    const errs = {};
    if (!shipping.nombre.trim())    errs.nombre = 'Requerido';
    if (!shipping.apellido.trim())  errs.apellido = 'Requerido';
    if (!shipping.calle.trim())     errs.calle = 'Requerido';
    if (!shipping.ciudad.trim())    errs.ciudad = 'Requerido';
    if (!/^\d{4,10}$/.test(shipping.codigo_postal.trim())) errs.codigo_postal = 'Código postal inválido';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    if (!payment.cardName.trim()) errs.cardName = 'Requerido';
    if (!luhnCheck(payment.cardNumber)) errs.cardNumber = 'Número de tarjeta inválido';
    const [mm, yy] = (payment.expiry || '').split('/');
    const now = new Date();
    const expYear  = 2000 + parseInt(yy || '0');
    const expMonth = parseInt(mm || '0');
    if (!mm || !yy || expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1))
      errs.expiry = 'Fecha inválida o caducada';
    if (!/^\d{3,4}$/.test(payment.cvv)) errs.cvv = 'CVV inválido';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validatePayment()) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/orders`, {
        nombre:         shipping.nombre,
        apellido:       shipping.apellido,
        calle:          shipping.calle,
        ciudad:         shipping.ciudad,
        codigo_postal:  shipping.codigo_postal,
        pais:           shipping.pais,
        items: cart.map(item => ({
          productId:  item.id,
          quantity:   item.quantity,
          unitPrice:  item.price,
          isCustom:   !!item.customDetails,
        })),
      });
      setStep(3);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={styles.backdrop}
        onClick={step !== 3 ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        className={styles.modal}
      >
        {/* Header */}
        {step !== 3 && (
          <div className={styles.header}>
            <div>
              <h2 className={styles.headerTitle}>
                {step === 1 ? 'Datos de Envío' : 'Datos de Pago'}
              </h2>
              <div className={styles.steps}>
                {[1, 2].map(s => (
                  <div key={s} className={`${styles.stepBar} ${s <= step ? styles.stepBarActive : styles.stepBarInactive}`} />
                ))}
                <span className={styles.stepCount}>{step}/2</span>
              </div>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className={styles.body}>
          <AnimatePresence mode="wait">

            {/* ── STEP 1: ENVÍO ── */}
            {step === 1 && (
              <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepSection}>
                <div className={styles.sectionLead}>
                  <MapPin size={20} style={{ color: 'var(--color-gold)' }} />
                  <span className={styles.sectionLeadText}>Dirección de entrega</span>
                </div>

                <div className={styles.fieldGrid}>
                  <Field label="Nombre"   value={shipping.nombre}   onChange={v => setShipping(s => ({ ...s, nombre: v }))}   error={fieldErrors.nombre} />
                  <Field label="Apellido" value={shipping.apellido} onChange={v => setShipping(s => ({ ...s, apellido: v }))} error={fieldErrors.apellido} />
                </div>
                <Field label="Calle y número" value={shipping.calle} onChange={v => setShipping(s => ({ ...s, calle: v }))} error={fieldErrors.calle} placeholder="Calle Mayor, 24" />
                <div className={styles.fieldGrid}>
                  <Field label="Ciudad" value={shipping.ciudad} onChange={v => setShipping(s => ({ ...s, ciudad: v }))} error={fieldErrors.ciudad} />
                  <Field label="Código Postal" value={shipping.codigo_postal} onChange={v => setShipping(s => ({ ...s, codigo_postal: v.replace(/\D/g, '').slice(0, 10) }))} error={fieldErrors.codigo_postal} placeholder="28001" />
                </div>
                <div className={styles.fieldWrap}>
                  <label className={styles.fieldLabel}>País</label>
                  <select value={shipping.pais} onChange={e => setShipping(s => ({ ...s, pais: e.target.value }))} className={styles.select}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Order summary */}
                <div className={styles.summary}>
                  <p className={styles.summaryLabel}>Resumen</p>
                  {cart.map((item, i) => (
                    <div key={i} className={styles.summaryRow}>
                      <span>{item.name} <span className={styles.summaryQty}>×{item.quantity}</span></span>
                      <span className={styles.summaryMono}>{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <span className={styles.summaryTotalAmount}>{cartTotal.toFixed(2)} €</span>
                  </div>
                </div>

                <button onClick={handleNextStep} className={styles.btnFull}>
                  Continuar al pago <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: PAGO ── */}
            {step === 2 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepSection}>
                <div className={styles.sectionLead}>
                  <CreditCard size={20} style={{ color: 'var(--color-gold)' }} />
                  <span className={styles.sectionLeadText}>Datos de tarjeta</span>
                  <button
                    type="button"
                    onClick={() => setPayment({ cardNumber: '4242 4242 4242 4242', expiry: '12/27', cvv: '123', cardName: 'PURE ESSENCE TEST' })}
                    className={styles.testCardBtn}
                  >
                    Usar tarjeta de prueba
                  </button>
                </div>

                {/* Card preview */}
                <div className={styles.cardPreview}>
                  <div className={styles.cardPreviewDeco}>
                    <div className={styles.cardDecoCircle1} />
                    <div className={styles.cardDecoCircle2} />
                  </div>
                  <p className={styles.cardPreviewBrand}>Pure Essence</p>
                  <p className={styles.cardPreviewNumber}>{payment.cardNumber || '•••• •••• •••• ••••'}</p>
                  <div className={styles.cardPreviewFooter}>
                    <div>
                      <p className={styles.cardPreviewSubLabel}>Titular</p>
                      <p className={styles.cardPreviewValue}>{payment.cardName || '—'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className={styles.cardPreviewSubLabel}>Caduca</p>
                      <p className={styles.cardPreviewValue}>{payment.expiry || 'MM/AA'}</p>
                    </div>
                  </div>
                </div>

                <Field
                  label="Nombre en la tarjeta"
                  value={payment.cardName}
                  onChange={v => setPayment(p => ({ ...p, cardName: v.toUpperCase() }))}
                  error={fieldErrors.cardName}
                  placeholder="NOMBRE APELLIDO"
                />
                <div className={styles.fieldWrap}>
                  <label className={styles.fieldLabel}>Número de tarjeta</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payment.cardNumber}
                    onChange={e => setPayment(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`${styles.input} ${styles.inputMono} ${fieldErrors.cardNumber ? styles.inputError : ''}`}
                  />
                  {fieldErrors.cardNumber && <p className={styles.fieldError}>{fieldErrors.cardNumber}</p>}
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>Fecha de caducidad</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={payment.expiry}
                      onChange={e => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/AA"
                      maxLength={5}
                      className={`${styles.input} ${styles.inputMono} ${fieldErrors.expiry ? styles.inputError : ''}`}
                    />
                    {fieldErrors.expiry && <p className={styles.fieldError}>{fieldErrors.expiry}</p>}
                  </div>
                  <div className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={payment.cvv}
                      onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="•••"
                      maxLength={4}
                      className={`${styles.input} ${styles.inputMono} ${fieldErrors.cvv ? styles.inputError : ''}`}
                    />
                    {fieldErrors.cvv && <p className={styles.fieldError}>{fieldErrors.cvv}</p>}
                  </div>
                </div>

                {error && (
                  <div className={styles.errorBlock}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                <div className={styles.secureNote}>
                  <Lock size={12} /> Pago seguro cifrado con SSL
                </div>

                <div className={styles.btnRow}>
                  <button onClick={() => { setStep(1); setFieldErrors({}); setError(''); }} className={styles.btnSecondary}>
                    Atrás
                  </button>
                  <button onClick={handleSubmit} disabled={loading} className={styles.btnPrimary}>
                    {loading ? (
                      <><div className={styles.spinner} /> Procesando...</>
                    ) : (
                      <><CreditCard size={16} /> Confirmar pago · {cartTotal.toFixed(2)} €</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: ÉXITO ── */}
            {step === 3 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.successWrap}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className={styles.successIcon}
                >
                  <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
                </motion.div>
                <div>
                  <h3 className={styles.successTitle}>¡Pedido Confirmado!</h3>
                  <p className={styles.successText}>
                    Gracias, <strong>{shipping.nombre}</strong>. Tu pedido ha sido registrado y está siendo procesado.
                  </p>
                  <p className={styles.successAddress}>
                    Envío a: {shipping.calle}, {shipping.ciudad}
                  </p>
                </div>
                <button onClick={onClose} className={styles.btnSuccessClose}>
                  Volver a la tienda
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
