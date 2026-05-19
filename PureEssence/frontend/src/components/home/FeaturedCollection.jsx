import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./FeaturedCollection.module.css";

const featuredProducts = [
  { id: 1, name: "Deep water",  description: "Marine salts and sun-drenched woods. The essence of the deep blue.", price: "185€", image: "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/deepWater.jpeg",  coords: "39.4699° N, 0.3763° W" },
  { id: 2, name: "Paradoxe",    description: "Sandalwood and dried amber. The memory of a lost temple.",            price: "210€", image: "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/paradoxe.jpeg",   coords: "34.0522° N, 118.2437° W" },
];

export default function FeaturedCollection() {
  const navigate = useNavigate();
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
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 0.995 }}
              onClick={() => navigate('/coleccion')}
              className={styles.card}
            >
              <img src={product.image} alt={product.name} className={styles.cardImg} />
              <div className={styles.cardOverlay}>
                <span className={styles.cardCoords}>{product.coords}</span>
                <h3 className={styles.cardName}>{product.name}</h3>
                <p className={styles.cardDesc}>{product.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>{product.price}</span>
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
