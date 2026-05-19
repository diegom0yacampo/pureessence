import React from "react";
import { motion } from "framer-motion";

// Legacy PerfumersNote section component (kept for reference)
export default function PerfumersNote() {
  return (
    <section style={{ background: "var(--color-obsidian)", padding: "8rem 1.5rem" }}>
      <div style={{ maxWidth: "48rem", margin: "0 auto", textAlign: "center" }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: "0.625rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)" }}
        >
          From the Perfumer
        </motion.span>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ margin: "2rem 0", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontFamily: "var(--font-heading)", color: "#fff", fontWeight: 300, lineHeight: 1.4, fontStyle: "italic" }}
        >
          "Every great fragrance begins with a single emotion — the rest is alchemy."
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          — The Pure Essence Atelier
        </motion.p>
      </div>
    </section>
  );
}
