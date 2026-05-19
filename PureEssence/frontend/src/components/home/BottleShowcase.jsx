import React from "react";
import { motion } from "framer-motion";
import styles from "./BottleShowcase.module.css";

const customBottleImg = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/assets/custom_bottle.png";

export default function BottleShowcase() {
  return (
    <section className={styles.section}>
      <div className="section-container">
        <div className={styles.grid}>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className={styles.imageWrap}
          >
            <img src={customBottleImg} alt="Laboratorio en penumbra" className={styles.image} />
            <div className={styles.imageLot}>Lote No. 0042</div>
          </motion.div>

          {/* Text */}
          <div className={styles.textWrap}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className={styles.eyebrow}>The Perfumer's Note</span>
              <h2 className={styles.title}>
                Commercial perfumery has died at the{" "}
                <span className={styles.italic}>altar of marketing.</span>
              </h2>
              <div className={styles.body}>
                <p className={styles.p}>
                  We work with time, not trends. We ignore testing panels and satisfaction surveys.
                  Scent is far too intimate to be democratic.
                </p>
                <p className={`${styles.p} ${styles.pAccent}`}>
                  A perfume must be an extension of the scars and memories of each person.
                  We do not sell fragrances. We capture absences.
                </p>
                <div>
                  <span className={styles.signature}>— The Nose</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
