import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

const homeImage = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/Fotos-Generales/home_hero.jpeg";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgGradient} />
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ width: "100%", height: "100%" }}
        >
          <img src={homeImage} alt="Essence of the Unique" className={styles.bgImg} />
        </motion.div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.eyebrow}
        >
          New Collection 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.title}
        >
          Essence of <br />
          the unique.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={styles.subtitle}
        >
          Your story in a perfume. Choose from our collection or
          create your own fragrance, bottle and label.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={styles.ctas}
        >
          <Link to="/personalizar" className={styles.ctaPrimary}>
            Your creations
            <ArrowRight size={16} />
          </Link>
          <Link to="/coleccion" className={styles.ctaSecondary}>
            Our creations
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
