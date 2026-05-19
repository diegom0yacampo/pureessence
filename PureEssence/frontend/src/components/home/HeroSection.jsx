import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Legacy hero section component (kept for reference)
export default function HeroSection() {
  return (
    <section style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #000)" }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        padding: "0 1.5rem",
      }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)", marginBottom: "1.5rem" }}
        >
          New Collection 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontFamily: "var(--font-heading)", color: "#fff", fontWeight: 300, lineHeight: 1.1, marginBottom: "2rem" }}
        >
          Essence of <br />
          the unique.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.125rem", maxWidth: "32rem", marginBottom: "3rem" }}
        >
          Your story in a perfume. Choose from our collection or create your own fragrance, bottle and label.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: "flex", gap: "1rem" }}
        >
          <Link to="/personalizar" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--color-gold)", color: "#000", padding: "0.875rem 2rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>
            Your creations <ArrowRight size={16} />
          </Link>
          <Link to="/coleccion" style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "0.875rem 2rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>
            Our creations
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
