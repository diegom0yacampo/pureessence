import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./FeaturedCollection.module.css";
import { API_URL } from "@/lib/api";

export default function FeaturedCollection() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => { if (!res.ok) throw new Error("Network error"); return res.json(); })
      .then(data => setProducts(Array.isArray(data) ? data.filter(p => p.image_url).slice(0, 2) : []))
      .catch(err => console.error("Failed to load featured products:", err));
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>The Anthology</span>
            <h2 className={styles.title}>Signature Creations.</h2>
          </div>
          <Link to="/coleccion" className={styles.exploreLink}>
            Explore All <ArrowRight size={20} />
          </Link>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 0.995 }}
              onClick={() => navigate('/coleccion')}
              className={styles.card}
            >
              <img src={product.image_url} alt={product.name} className={styles.cardImg} />
              <div className={styles.cardOverlay}>
                <h3 className={styles.cardName}>{product.name}</h3>
                <p className={styles.cardDesc}>{product.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>{parseFloat(product.price).toFixed(0)}€</span>
                  <button className={styles.buyBtn}>Buy</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
