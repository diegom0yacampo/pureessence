import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/CartContext";
import ProductDetailModal from "@/components/ProductDetailModal";
import styles from "./Coleccion.module.css";
import { API_URL } from "@/lib/api";

export default function Coleccion() {
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => { if (!res.ok) throw new Error("Network error"); return res.json(); })
      .then(data => setDbProducts(data || []))
      .catch(err => console.error("Failed to load collection:", err));
  }, []);

  const handleAdd = (perfume) => {
    if (!perfume.stock || perfume.stock <= 0) { toast.error(`${perfume.name} está agotado`); return; }
    addToCart({ id: perfume.id, name: perfume.name, price: perfume.price, image_url: perfume.image_url, description: perfume.description, notes: perfume.notes, stock: perfume.stock, quantity: 1 });
    toast.success(`${perfume.name} added to cart`);
  };

  const displayProducts = dbProducts
    .filter(p => p.image_url && p.image_url.trim() !== "")
    .map(p => ({ id: p.id, name: p.name, description: p.description, price: parseFloat(p.price || 0), image_url: p.image_url, notes: p.notes || "", stock: p.stock ?? 0 }));

  return (
    <div className={styles.page}>
      {selectedProduct && (
        <ProductDetailModal item={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAdd} />
      )}

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={styles.heroInner}>
          <span className={styles.eyebrow}>Anthology No. 01</span>
          <h1 className={styles.title}>Monthly <br className="hidden md:block" /> Collection.</h1>
          <p className={styles.subtitle}>
            Eight master compositions. Formulated with the same philosophy of geometric purity and technical transparency.
          </p>
        </motion.div>
      </section>

      {/* Grid */}
      <section className={styles["grid-section"]}>
        <div className={styles.gridInner}>
          <div className={styles.grid}>
            {displayProducts.map((perfume, i) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={styles.card}
              >
                <div className={styles.cardImgWrap}>
                  <img src={perfume.image_url} alt={perfume.name} className={styles.cardImg} />
                  <div className={styles.cardHover}>
                    {perfume.stock > 0 ? (
                      <button onClick={() => handleAdd(perfume)} className={styles.addCartBtn}>Add to cart</button>
                    ) : (
                      <span className={styles.soldOutTag}>Agotado</span>
                    )}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardName}>{perfume.name}</h3>
                    <span className={styles.cardPrice}>{perfume.price}€</span>
                  </div>
                  <p className={styles.cardNotes}>{perfume.notes}</p>
                  <p className={styles.cardDesc}>{perfume.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardVolume}>
                      {perfume.stock > 0 ? "50ML / 1.7 FL.OZ" : <span className={styles.soldOutLabel}>Agotado</span>}
                    </span>
                    <button onClick={() => setSelectedProduct(perfume)} className={styles.detailsBtn}>Details</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Design your own.</h2>
          <p className={styles.ctaSubtitle}>Can't find your trace? Our atelier is open for custom olfactory identities.</p>
          <Link to="/personalizar" className={styles.ctaBtn}>
            Go to Laboratory <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
