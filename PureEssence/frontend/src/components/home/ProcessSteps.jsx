import React from "react";
import { motion } from "framer-motion";
import styles from "./ProcessSteps.module.css";

const materials = [
  { tag: "Time",     title: "The 15-year Sandalwood",  description: "We do not rush maturity. Our resins wait a decade before being cold-distilled.", origin: "Karnataka, India" },
  { tag: "Geometry", title: "Glass Architecture",      description: "The bottle is not a container; it is a light and temperature regulator designed to protect the formula from oxidation.", origin: "Blown Glass, Zaragoza" },
  { tag: "Craft",    title: "Manual Labeling",         description: "Each piece is sealed and signed by hand. The imperfection of the human hand is our seal of authenticity.", origin: "CustomLab Studio Atelier" },
];

export default function ProcessSteps() {
  return (
    <section className={styles.section}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>Radical Transparency</span>
          <h2 className={styles.title}>Raw Matter.</h2>
        </motion.div>

        <div className={styles.grid}>
          {materials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.2 }}
              className={styles.item}
            >
              <div className={styles.itemInner}>
                <span className={styles.tag}>{item.tag}</span>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
                <div className={styles.origin}>
                  <span className={styles.originLabel}>Origen:</span>
                  <span className={styles.originValue}>{item.origin}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className={styles.deco} />
    </section>
  );
}
