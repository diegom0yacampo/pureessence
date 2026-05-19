import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, RefreshCw, AlertCircle, X } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import axios from "axios";
import styles from "./Personalizar.module.css";
import { API_URL } from "@/lib/api";

// ─── Aroma image map ─────────────────────────────────────────────────────────

const AROMA_IMG_BASE = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/Fotos-aromas";

const AROMA_IMG = {
  "Bergamot":      `${AROMA_IMG_BASE}/bergamot.png`,
  "Lemon":         `${AROMA_IMG_BASE}/lemon.png`,
  "Bitter Orange": `${AROMA_IMG_BASE}/orange.png`,
  "Grapefruit":    `${AROMA_IMG_BASE}/grapefruit.png`,
  "Mandarin":      `${AROMA_IMG_BASE}/mandarin.png`,
  "Yuzu":          `${AROMA_IMG_BASE}/yuzu.png`,
  "Lime":          `${AROMA_IMG_BASE}/lime.png`,
  "Rose":          `${AROMA_IMG_BASE}/rose.png`,
  "Jasmine":       `${AROMA_IMG_BASE}/jasmine.png`,
  "Tuberose":      `${AROMA_IMG_BASE}/tuberose.png`,
  "Iris":          `${AROMA_IMG_BASE}/iris.png`,
  "Ylang Ylang":   `${AROMA_IMG_BASE}/ylang.png`,
  "Magnolia":      `${AROMA_IMG_BASE}/magnolia.png`,
  "Peony":         `${AROMA_IMG_BASE}/peony.png`,
  "Sandalwood":    `${AROMA_IMG_BASE}/sandalwood (2).png`,
  "Cedar":         `${AROMA_IMG_BASE}/cedar.png`,
  "Vetiver":       `${AROMA_IMG_BASE}/vetiver.png`,
  "Oud":           `${AROMA_IMG_BASE}/oud (2).png`,
  "Guaiac Wood":   `${AROMA_IMG_BASE}/Guaiac.png`,
  "Birch":         `${AROMA_IMG_BASE}/birch.png`,
  "Cinnamon":      `${AROMA_IMG_BASE}/cinnamon.png`,
  "Cardamom":      `${AROMA_IMG_BASE}/Cardamom.png`,
  "Black Pepper":  `${AROMA_IMG_BASE}/blackpepper.png`,
  "Ginger":        `${AROMA_IMG_BASE}/ginger.png`,
  "Nutmeg":        `${AROMA_IMG_BASE}/nutmeg.png`,
  "Saffron":       `${AROMA_IMG_BASE}/safrrom.png`,
  "Vanilla":       `${AROMA_IMG_BASE}/vanilla.png`,
  "Incense":       `${AROMA_IMG_BASE}/incense.png`,
  "Myrrh":         `${AROMA_IMG_BASE}/myrth.png`,
  "Benzoin":       `${AROMA_IMG_BASE}/benzoin.png`,
  "Tonka Bean":    `${AROMA_IMG_BASE}/tonkbean.png`,
  "Mint":          `${AROMA_IMG_BASE}/mint.png`,
  "Eucalyptus":    `${AROMA_IMG_BASE}/eucalyptus.png`,
  "Lavender":      `${AROMA_IMG_BASE}/lavender.png`,
  "Basil":         `${AROMA_IMG_BASE}/basil.png`,
  "Coffee":        `${AROMA_IMG_BASE}/coffee.png`,
  "Cocoa":         `${AROMA_IMG_BASE}/cocoa.png`,
  "Caramel":       `${AROMA_IMG_BASE}/caramel.png`,
  "Honey":         `${AROMA_IMG_BASE}/honey.png`,
  "White Musk":    `${AROMA_IMG_BASE}/withemusk.png`,
  "Cashmeran":     `${AROMA_IMG_BASE}/cashmeran.png`,
  "Ambroxan":      `${AROMA_IMG_BASE}/ambroxan.png`,
  "Amber":         `${AROMA_IMG_BASE}/amber.png`,
};

// ─── Constants ────────────────────────────────────────────────────────────────

const FAMILY_META = {
  Citrus:   { color: "#f59e0b", emoji: "🍋" },
  Floral:   { color: "#ec4899", emoji: "🌸" },
  Woody:    { color: "#a16207", emoji: "🌲" },
  Spicy:    { color: "#ef4444", emoji: "🌶" },
  Oriental: { color: "#8b5cf6", emoji: "✨" },
  Fresh:    { color: "#06b6d4", emoji: "💨" },
  Gourmand: { color: "#d97706", emoji: "🍫" },
  Musky:    { color: "#94a3b8", emoji: "🌙" },
};

const FAMILY_DESC = {
  Citrus:   "Brillante y efervescente como un amanecer mediterráneo sobre el mar. Notas vivas de cítricos recién cortados que despiertan los sentidos con una frescura solar e irresistible vitalidad.",
  Floral:   "Suave y romántico como un jardín en plena floración primaveral. Pétalos sedosos que danzan en el aire cálido, creando una estela delicada que permanece grabada en la memoria.",
  Woody:    "Profundo y terroso como un bosque ancestral tras la lluvia de otoño. Notas resinosas y cálidas que evocan la madera noble envejecida, tejiendo misterio y permanencia atemporal.",
  Spicy:    "Ardiente y exótico como los mercados de oriente con especias recién molidas. Una calidez envolvente que seduce los sentidos dejando una huella intensa e inolvidable en la piel.",
  Oriental: "Opulento y sensual como noches perfumadas bajo las estrellas del Medio Oriente. Resinas y bálsamos preciosos en una sinfonía de lujo, misterio y longevidad inigualable.",
  Fresh:    "Limpio y revitalizante como una brisa marina al amanecer mediterráneo. Notas herbáceas y acuosas que transmiten pureza y vitalidad absoluta, etérea y contemporánea.",
  Gourmand: "Dulce y adictivo como una elegante pastelería parisina un domingo por la mañana. Notas cremosas que envuelven en una nube de placer sensorial cálida y nostálgica.",
  Musky:    "Suave y envolvente como piel cálida al caer la tarde dorada. Notas sensuales de gran longevidad que crean un aura íntima e irresistible, como una segunda piel perfumada.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getName  = (item) => item?.name  || item?.nombre || "";
const getFamily = (item) => item?.family || item?.familia_olfativa || "";
const getPrice  = (item) => parseFloat(item?.price || item?.precio || 0);

async function fetchBottleImageBase64(src) {
  try {
    const url = src.startsWith("http") ? src : `${window.location.origin}${src}`;
    const res  = await fetch(url);
    const blob = await res.blob();
    return new Promise(resolve => {
      const r = new FileReader();
      r.onloadend = () => resolve({ data: r.result.split(",")[1], mimeType: blob.type || "image/jpeg" });
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function generatePerfumeImage(prompt, bottleImageSrc) {
  const bottleImage = bottleImageSrc ? await fetchBottleImageBase64(bottleImageSrc) : null;
  const res  = await fetch("${API_URL}/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, bottleImage }),
  });
  const data = await res.json();
  if (!res.ok)    throw new Error(data?.error ?? `Error ${res.status}`);
  if (!data.image) throw new Error("No image returned from server.");
  return `data:${data.mimeType ?? "image/jpeg"};base64,${data.image}`;
}

// ─── Infinite Drum Wheel ──────────────────────────────────────────────────────

function DrumWheel({ items, onHighlight, onConfirm, selectedIds = [], itemH, visible, renderItem }) {
  const n      = items.length;
  const center = Math.floor(visible / 2);
  const [idx, setIdx] = useState(0);
  const startY        = useRef(null);
  const startIdx      = useRef(0);

  const getItem = useCallback((i) => {
    if (n === 0) return null;
    return items[((i % n) + n) % n];
  }, [items, n]);

  const go = useCallback((newIdx) => {
    if (n === 0) return;
    const norm = ((newIdx % n) + n) % n;
    setIdx(norm);
    onHighlight?.(items[((norm % n) + n) % n]);
  }, [items, n, onHighlight]);

  useEffect(() => {
    if (n > 0) { setIdx(0); onHighlight?.(items[0]); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (n === 0) return null;

  const handleClick = (slotIdx) => {
    const norm = ((slotIdx % n) + n) % n;
    if (norm === idx) onConfirm?.(getItem(norm));
    else go(slotIdx);
  };

  const BUFFER = center + 2;
  const slots  = Array.from({ length: visible + BUFFER * 2 }, (_, j) => idx - center - BUFFER + j);

  return (
    <div
      className={styles.drumWrap}
      style={{ height: itemH * visible }}
      onWheel={e => { e.preventDefault(); go(idx + (e.deltaY > 0 ? 1 : -1)); }}
      onMouseDown={e => { startY.current = e.clientY; startIdx.current = idx; }}
      onMouseMove={e => {
        if (startY.current === null) return;
        go(startIdx.current + Math.round((startY.current - e.clientY) / itemH));
      }}
      onMouseUp={() => { startY.current = null; }}
      onMouseLeave={() => { startY.current = null; }}
      onTouchStart={e => { startY.current = e.touches[0].clientY; startIdx.current = idx; }}
      onTouchMove={e => {
        go(startIdx.current + Math.round((startY.current - e.touches[0].clientY) / itemH));
      }}
    >
      {/* Gradient fades */}
      <div className={styles.drumGradTop}
        style={{ height: itemH * center, background: "linear-gradient(to bottom, #18181b, transparent)" }} />
      <div className={styles.drumGradBottom}
        style={{ height: itemH * center, background: "linear-gradient(to top, #18181b, transparent)" }} />

      {/* Center highlight stripe */}
      <div className={styles.drumHighlight} style={{ top: itemH * center, height: itemH }} />

      {/* Animated container */}
      <motion.div
        className={styles.drumContainer}
        animate={{ y: -idx * itemH + center * itemH }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
      >
        {slots.map(slotIdx => {
          const item    = getItem(slotIdx);
          const dist    = Math.abs(slotIdx - idx);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.22 : 0.08;
          const scale   = dist === 0 ? 1 : dist === 1 ? 0.92 : 0.80;
          return (
            <div
              key={slotIdx}
              onClick={() => handleClick(slotIdx)}
              style={{
                position: "absolute",
                top: slotIdx * itemH,
                left: 0, right: 0,
                height: itemH,
                opacity,
                transform: `scale(${scale})`,
                transition: "opacity 0.16s, transform 0.16s",
              }}
              className={styles.drumItem}
            >
              {renderItem(item, slotIdx === idx, selectedIds.includes(item.id))}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Floating Aroma Pill ──────────────────────────────────────────────────────

const SIDE_POSITIONS = {
  1: [{ side: "left",  top: "50%" }],
  2: [{ side: "left",  top: "35%" }, { side: "right", top: "55%" }],
  3: [{ side: "left",  top: "25%" }, { side: "right", top: "50%" }, { side: "left", top: "72%" }],
};

function FloatingPill({ name, color, index, total }) {
  const imgSrc = AROMA_IMG[name];
  const pos    = (SIDE_POSITIONS[total] || SIDE_POSITIONS[1])[index];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.floatingPill}
      style={{ [pos.side]: "6%", top: pos.top, transform: "translateY(-50%)" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 }}
      >
        {imgSrc && (
          <img src={imgSrc} alt={name} style={{ width: "15rem", height: "15rem", objectFit: "contain" }} />
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Personalizar() {
  const [bottle,           setBottle]           = useState(null);
  const [selectedAromas,   setSelectedAromas]   = useState([]);
  const [highlightedAroma, setHighlightedAroma] = useState(null);
  const [aromaFamily,      setAromaFamily]      = useState(null);
  const [labelShape,       setLabelShape]       = useState("circular");
  const [labelColor,       setLabelColor]       = useState("white");
  const [textColor,        setTextColor]        = useState("black");
  const [dedication,       setDedication]       = useState("");
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [generatedImage,   setGeneratedImage]   = useState(null);
  const [genError,         setGenError]         = useState(null);
  const { addToCart } = useCart();

  const [dbBottles,     setDbBottles]     = useState([]);
  const [dbIngredients, setDbIngredients] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, iRes] = await Promise.all([
          axios.get("${API_URL}/bottles"),
          axios.get("${API_URL}/ingredients"),
        ]);
        setDbBottles(bRes.data || []);
        setDbIngredients(iRes.data || []);
      } catch (err) {
        console.error("Failed to load data from API:", err);
      }
    })();
  }, []);

  const toggleAroma = (aroma) => {
    if (selectedAromas.find(a => a.id === aroma.id)) {
      setSelectedAromas(prev => prev.filter(a => a.id !== aroma.id));
    } else if (!(aroma.stock > 0)) {
      toast.error(`${getName(aroma)} está agotado`);
    } else if (selectedAromas.length < 3) {
      setSelectedAromas(prev => [...prev, aroma]);
      toast.success(`${getName(aroma)} añadido`);
    } else {
      toast.error("Máximo 3 aromas. Elimina uno para añadir otro.");
    }
  };

  const handleBuild = async () => {
    if (!bottle)                     { toast.error("Selecciona un bote."); return; }
    if (selectedAromas.length === 0) { toast.error("Selecciona al menos un aroma."); return; }
    setIsGenerating(true);
    setGenError(null);
    setGeneratedImage(null);
    try {
      const aromaNames = selectedAromas.map(a => getName(a)).join(" and ");
      const shapeNames = { circular: "circular", cuadrada: "square", rectangular: "rectangular" };
      const colorNames = { white: "white", black: "black", gold: "golden", blue: "navy blue" };
      const labelText  = dedication ? dedication : "Pure Essence";
      const prompt =
        `Take this exact perfume bottle from the reference image and add a ${shapeNames[labelShape]} label to it. ` +
        `The label must be ${colorNames[labelColor]} colored with ${colorNames[textColor]} lettering. ` +
        `The label text must say exactly "${labelText}". ` +
        `Keep the bottle shape, material and glass texture identical to the reference. ` +
        `Always use the exact same background and lighting for every image: pure black studio background, single soft spotlight from the upper left, subtle reflection on a dark glossy surface below the bottle. ` +
        `Render as a luxury product photo with ultra-realistic glass. No other elements, no decorations, no text outside the label.`;
      const src = await generatePerfumeImage(prompt, bottle.image_url);
      setGeneratedImage(src);
    } catch (err) {
      setGenError(err.message ?? "Unknown error");
      toast.error("No se pudo generar la vista previa.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    const price = getPrice(bottle) + selectedAromas.reduce((s, a) => s + getPrice(a), 0);
    addToCart({
      id: Date.now(),
      name: "Custom Essence",
      price: price || 89,
      image_url: generatedImage || bottle?.image_url,
      quantity: 1,
      customDetails: {
        bottle:    getName(bottle),
        fragrance: selectedAromas.map(a => getName(a)).join(" · "),
        label:     `${labelShape} / ${labelColor}`,
      },
    });
    toast.success("Añadido a tu colección.");
    setSelectedAromas([]);
    setGeneratedImage(null);
    setGenError(null);
    setDedication("");
  };

  const filteredAromas = useMemo(
    () => aromaFamily ? dbIngredients.filter(i => getFamily(i) === aromaFamily) : dbIngredients,
    [aromaFamily, dbIngredients]
  );

  const AROMA_ITEM_H   = 64;
  const AROMA_VISIBLE  = 9;
  const BOTTLE_ITEM_H  = 88;
  const BOTTLE_VISIBLE = 7;
  const canBuild = !isGenerating && bottle && (bottle?.stock > 0) && selectedAromas.length > 0;

  return (
    <div className={styles.page}>

      {/* ── 3-column main area ── */}
      <div className={styles.mainGrid}>

        {/* LEFT — Aroma wheel */}
        <div className={styles.leftCol}>

          {/* Family filter */}
          <div className={styles.familyFilterWrap}>
            <span className={styles.familyLabel}>Familia</span>
            <div className={styles.familyGrid}>
              {Object.entries(FAMILY_META).map(([family, meta]) => {
                const isActive = aromaFamily === family;
                return (
                  <button
                    key={family}
                    onClick={() => { setAromaFamily(isActive ? null : family); setHighlightedAroma(null); }}
                    title={family}
                    className={`${styles.familyBtn} ${isActive ? styles.familyBtnActive : ""}`}
                  >
                    <span className={styles.familyEmoji}>{meta.emoji}</span>
                    <span className={styles.familyName} style={{ color: isActive ? meta.color : "rgba(255,255,255,0.3)" }}>
                      {family.slice(0, 4)}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {aromaFamily && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className={styles.activeFamilyOuter}
                >
                  <div className={styles.activeFamilyInner}>
                    <span className={styles.activeFamilyLabel} style={{ color: FAMILY_META[aromaFamily]?.color }}>
                      {FAMILY_META[aromaFamily]?.emoji} {aromaFamily}
                    </span>
                    <button onClick={() => setAromaFamily(null)} className={styles.activeFamilyClear}>todo</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drum wheel */}
          <div className={styles.wheelWrap}>
            <DrumWheel
              items={filteredAromas}
              onHighlight={setHighlightedAroma}
              onConfirm={toggleAroma}
              selectedIds={selectedAromas.map(a => a.id)}
              itemH={AROMA_ITEM_H}
              visible={AROMA_VISIBLE}
              renderItem={(item, isCenter, isChosen) => {
                const color      = FAMILY_META[getFamily(item)]?.color || "#D4AF37";
                const outOfStock = !(item.stock > 0);
                return (
                  <div className={styles.aromaItemInner}>
                    <div className={styles.aromaItemLeft}>
                      <div className={styles.aromaDot}
                        style={{ background: outOfStock ? "rgba(255,255,255,0.15)" : color }} />
                      <span className={
                        outOfStock
                          ? (isCenter ? styles.aromaNameOosCenter : styles.aromaNameOosOther)
                          : (isCenter ? styles.aromaNameCenter    : styles.aromaNameOther)
                      }>
                        {getName(item)}
                      </span>
                    </div>
                    {isCenter && outOfStock && (
                      <span className={styles.aromaOosBadge}>Agotado</span>
                    )}
                    {isChosen && !outOfStock && <div className={styles.aromaChosenDot} />}
                  </div>
                );
              }}
            />
          </div>

          {/* Aroma action */}
          <div className={styles.aromaAction}>
            <AnimatePresence mode="wait">
              {highlightedAroma && (
                <motion.div
                  key={highlightedAroma.id}
                  initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={styles.aromaActionInner}
                >
                  <div>
                    <p className={styles.aromaActionFamily}>{getFamily(highlightedAroma)}</p>
                    <p className={styles.aromaActionName}>{getName(highlightedAroma)}</p>
                  </div>
                  {!(highlightedAroma.stock > 0) && !selectedAromas.find(a => a.id === highlightedAroma.id) ? (
                    <span className={styles.aromaOutOfStockBadge}>Agotado</span>
                  ) : (
                    <button
                      onClick={() => toggleAroma(highlightedAroma)}
                      className={`${styles.aromaAddBtn} ${selectedAromas.find(a => a.id === highlightedAroma.id) ? styles.aromaAddBtnRemove : styles.aromaAddBtnAdd}`}
                    >
                      {selectedAromas.find(a => a.id === highlightedAroma.id) ? "quitar" : "añadir"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER — Bottle preview / AI result */}
        <div className={styles.centerCol}>

          {/* Ambient glow */}
          <div className={styles.ambientGlow}>
            <div className={styles.glowCircle}
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)" }} />
          </div>

          <AnimatePresence mode="wait">

            {/* AI result */}
            {(generatedImage || isGenerating || genError) ? (
              <motion.div
                key="ai-result"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={styles.aiResultWrap}
              >
                {isGenerating && (
                  <div className={styles.generatingWrap}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                      <Sparkles size={40} style={{ color: 'var(--color-gold)' }} />
                    </motion.div>
                    <p className={styles.generatingText}>Generando tu visión…</p>
                  </div>
                )}
                {genError && !isGenerating && (
                  <div className={styles.errorWrap}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <p className={styles.errorTitle}>Error</p>
                      <p className={styles.errorMsg}>{genError}</p>
                      <button onClick={() => setGenError(null)} className={styles.errorBack}>
                        Volver al bote
                      </button>
                    </div>
                  </div>
                )}
                {generatedImage && !isGenerating && (
                  <div className={styles.generatedImgWrap}>
                    <img src={generatedImage} alt="Tu perfume" className={styles.generatedImg} />
                    <div className={styles.generatedOverlay}>
                      <div>
                        <p className={styles.generatedMetaLabel}>Generado por Gemini AI</p>
                        <p className={styles.generatedName}>{getName(bottle)}</p>
                        <p className={styles.generatedAromas}>{selectedAromas.map(a => getName(a)).join(" · ")}</p>
                      </div>
                      <div className={styles.generatedActions}>
                        <div className={styles.generatedPriceWrap}>
                          <p className={styles.generatedPriceLabel}>Precio total</p>
                          <p className={styles.generatedPrice}>
                            {(getPrice(bottle) + selectedAromas.reduce((s, a) => s + getPrice(a), 0) || 89).toFixed(2)} €
                          </p>
                        </div>
                        <div className={styles.generatedBtns}>
                          <button onClick={handleBuild} className={styles.regenBtn}>
                            <RefreshCw size={12} /> Regenerar
                          </button>
                          <button onClick={handleConfirm} className={styles.addToCartBtn}>
                            Añadir al carrito
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (

              /* Bottle preview */
              <motion.div
                key="bottle-preview"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={styles.bottlePreviewWrap}
              >
                <AnimatePresence>
                  {selectedAromas.map((aroma, i) => (
                    <FloatingPill
                      key={aroma.id}
                      name={getName(aroma)}
                      color={FAMILY_META[getFamily(aroma)]?.color || "#D4AF37"}
                      index={i}
                      total={selectedAromas.length}
                    />
                  ))}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={bottle?.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={styles.bottleContent}
                  >
                    {bottle && !(bottle.stock > 0) ? (
                      <div className={styles.bottleOosWrap}>
                        <div className={styles.bottleOosBox}>
                          {bottle.image_url && (
                            <img src={bottle.image_url} alt={getName(bottle)} className={styles.bottleOosImg} />
                          )}
                          <span className={styles.bottleOosBadge}>Agotado</span>
                        </div>
                        <div className={styles.bottleOosNameWrap}>
                          <p className={styles.bottleOosName}>{getName(bottle)}</p>
                          <p className={styles.bottleOosNote}>Sin existencias · Elige otro frasco</p>
                        </div>
                      </div>
                    ) : bottle?.image_url ? (
                      <>
                        <img
                          src={bottle.image_url}
                          alt={getName(bottle)}
                          className={styles.bottleImg}
                          style={{ filter: "drop-shadow(0 0 40px rgba(212,175,55,0.15)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
                        />
                        <div style={{ textAlign: 'center' }}>
                          <p className={styles.bottleLabelMono}>Selected vessel</p>
                          <p className={styles.bottleLabelName}>{getName(bottle)}</p>
                        </div>
                      </>
                    ) : (
                      <div className={styles.bottleEmpty}>
                        <span className={styles.bottleEmptyText}>Sin bote</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Bottle wheel */}
        <div className={styles.rightCol}>
          <div className={styles.bottleColHeader}>
            <p className={styles.bottleColLabel}>Colonia</p>
          </div>
          <div className={styles.bottleWheelWrap}>
            <DrumWheel
              items={dbBottles}
              onHighlight={setBottle}
              itemH={BOTTLE_ITEM_H}
              visible={BOTTLE_VISIBLE}
              renderItem={(item, isCenter) => {
                const outOfStock = !(item.stock > 0);
                return (
                  <div className={`${styles.bottleItemWrap} ${isCenter ? styles.bottleItemCenter : styles.bottleItemOther}`}>
                    <div className={`${styles.bottleItemImgWrap} ${outOfStock ? styles.bottleItemOos : ""}`}>
                      <img src={item.image_url} alt={getName(item)} className={styles.bottleItemImg} />
                    </div>
                    <div className={styles.bottleItemInfo}>
                      <p className={isCenter ? (outOfStock ? styles.bottleItemNameCenterOos : styles.bottleItemNameCenter) : styles.bottleItemNameOther}>
                        {getName(item)}
                      </p>
                      {isCenter && outOfStock && (
                        <p className={styles.bottleItemOosBadge}>Agotado</p>
                      )}
                    </div>
                    {isCenter && !outOfStock && <div className={styles.bottleGoldDot} />}
                  </div>
                );
              }}
            />
          </div>
          <div className={styles.bottleColFooter}>
            <AnimatePresence mode="wait">
              <motion.p key={bottle?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={bottle && !(bottle.stock > 0) ? styles.bottleColFooterNameOos : styles.bottleColFooterNameOk}>
                {bottle && !(bottle.stock > 0) ? `${getName(bottle)} — Agotado` : (getName(bottle) || "—")}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottomBar}>

        {/* LEFT: selected aromas */}
        <div className={styles.aromasSection}>
          <p className={styles.aromasLabel}>Aromas</p>
          <div className={styles.aromasPills}>
            <AnimatePresence>
              {selectedAromas.length === 0 ? (
                <span className={styles.noAromasText}>ninguno</span>
              ) : (
                selectedAromas.map(aroma => {
                  const color = FAMILY_META[getFamily(aroma)]?.color || "#D4AF37";
                  return (
                    <motion.button
                      key={aroma.id}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => toggleAroma(aroma)}
                      title={`Quitar ${getName(aroma)}`}
                      className={styles.aromaPill}
                      style={{ borderColor: `${color}55`, background: `${color}15`, color, border: `1px solid ${color}55` }}
                    >
                      {getName(aroma)}
                      <X size={12} />
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER: label controls */}
        <div className={styles.labelControls}>

          {/* Shape */}
          <div className={styles.controlGroup}>
            <p className={styles.controlLabel}>Forma</p>
            <div className={styles.shapeButtons}>
              {[
                { id: "circular",    label: "Circular",    shape: <circle cx="18" cy="18" r="13" /> },
                { id: "cuadrada",    label: "Cuadrada",    shape: <rect x="5" y="5" width="26" height="26" rx="2" /> },
                { id: "rectangular", label: "Rectangular", shape: <rect x="3" y="9" width="30" height="18" rx="2" /> },
              ].map(s => {
                const active = labelShape === s.id;
                return (
                  <button key={s.id} onClick={() => setLabelShape(s.id)} title={s.label}
                    className={`${styles.shapeBtn} ${active ? styles.shapeBtnActive : styles.shapeBtnInactive}`}
                  >
                    <svg viewBox="0 0 36 36" style={{ width: '1.25rem', height: '1.25rem' }} fill="none"
                      stroke={active ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {s.shape}
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label color */}
          <div className={styles.controlGroup}>
            <p className={styles.controlLabel}>Etiqueta</p>
            <div className={styles.colorButtons}>
              {[
                { id: "white", hex: "#ffffff", label: "Blanco" },
                { id: "black", hex: "#111111", label: "Negro"  },
                { id: "gold",  hex: "#D4AF37", label: "Dorado" },
                { id: "blue",  hex: "#1d4ed8", label: "Azul"   },
              ].map(c => (
                <button key={c.id} onClick={() => setLabelColor(c.id)} title={c.label}
                  className={`${styles.colorBtn} ${labelColor === c.id ? styles.colorBtnActive : styles.colorBtnInactive}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Text color */}
          <div className={styles.controlGroup}>
            <p className={styles.controlLabel}>Texto</p>
            <div className={styles.colorButtons}>
              {[
                { id: "black", hex: "#111111", label: "Negro"  },
                { id: "white", hex: "#ffffff", label: "Blanco" },
                { id: "gold",  hex: "#D4AF37", label: "Dorado" },
                { id: "blue",  hex: "#1d4ed8", label: "Azul"   },
              ].map(c => (
                <button key={c.id} onClick={() => setTextColor(c.id)} title={c.label}
                  className={`${styles.colorBtn} ${textColor === c.id ? styles.colorBtnActive : styles.colorBtnInactive}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Dedication */}
          <div className={styles.dedicationGroup}>
            <p className={styles.controlLabel}>Grabado</p>
            <div className={styles.dedicationInputWrap}>
              <input
                type="text"
                value={dedication}
                onChange={e => setDedication(e.target.value.slice(0, 50))}
                placeholder="Tu texto..."
                className={styles.dedicationInput}
              />
              <span className={styles.dedicationCount}>{dedication.length}/50</span>
            </div>
          </div>
        </div>

        {/* RIGHT: price + build/reset */}
        <div className={styles.rightActions}>
          {(bottle || selectedAromas.length > 0) && (
            <div className={styles.priceSection}>
              <p className={styles.priceLabel}>Precio</p>
              <p className={styles.priceValue}>
                {(getPrice(bottle) + selectedAromas.reduce((s, a) => s + getPrice(a), 0) || 89).toFixed(2)} €
              </p>
            </div>
          )}
          <button
            onClick={handleBuild}
            disabled={!canBuild}
            className={canBuild ? styles.buildBtn : styles.buildBtnDisabled}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                  <Sparkles size={14} />
                </motion.div>
                Generando...
              </>
            ) : (
              <><Sparkles size={14} /> Construir</>
            )}
          </button>
          <button
            onClick={() => { setGeneratedImage(null); setGenError(null); setSelectedAromas([]); setDedication(""); }}
            className={styles.resetBtn}
          >
            <RefreshCw size={14} /> Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
