import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LABEL_SHAPES } from "@/lib/perfumeData";
import { Check, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/api";

const LABEL_COLOR_NAMES = { white: "white", black: "black", gold: "golden" };
const TEXT_COLOR_NAMES = { white: "white", black: "black", gold: "golden", blue: "navy blue" };

function buildPrompt({ bottleData, ingredient1, ingredient2, shape, labelColor, textColor, dedication }) {
  const fragrances = [ingredient1?.name, ingredient2?.name].filter(Boolean).join(" and ");
  const shapeName = shape?.name ?? "circular";
  const labelCol = LABEL_COLOR_NAMES[labelColor] ?? labelColor;
  const textCol = TEXT_COLOR_NAMES[textColor] ?? textColor;
  const dedicationPart = dedication ? `, engraved with the text "${dedication}"` : "";
  const fragrancePart = fragrances ? ` The fragrance contains notes of ${fragrances}.` : "";

  return (
    `Take this exact perfume bottle from the reference image and add a ${shapeName} label to it. ` +
    `The label must be ${labelCol} colored with ${textCol} lettering${dedicationPart}. ` +
    `Keep the bottle shape, material and glass texture identical to the reference. ` +
    `${fragrancePart} ` +
    `Render as a luxury product photo: dark studio background, dramatic side lighting, ` +
    `ultra-realistic glass, high-end fragrance advertisement style.`
  );
}

async function fetchBottleImageBase64(imageSrc) {
  try {
    const url = imageSrc.startsWith("http") ? imageSrc : `${window.location.origin}${imageSrc}`;
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result.split(",")[1];
        resolve({ data: b64, mimeType: blob.type || "image/jpeg" });
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function generatePerfumeImage(prompt, bottleImageSrc) {
  const bottleImage = bottleImageSrc ? await fetchBottleImageBase64(bottleImageSrc) : null;

  const res = await fetch(`${API_URL}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, bottleImage }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
  if (!data.image) throw new Error("El servidor no devolvió ninguna imagen.");
  return `data:${data.mimeType ?? "image/jpeg"};base64,${data.image}`;
}

export default function OrderSummary({
  bottle, ingredients, labelShape,
  labelColor, textColor, dedication,
  onConfirm, isSubmitting, totalPrice,
  dbBottles = [], dbIngredients = []
}) {
  const selectedDbBottle = dbBottles.find(b => b.id === bottle);
  const bottleName = selectedDbBottle?.name || selectedDbBottle?.nombre;
  const bottleData = selectedDbBottle ? {
    name: bottleName,
    description: selectedDbBottle.description || selectedDbBottle.descripcion,
    image: selectedDbBottle.image_url || "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cilindro.png"
  } : null;

  const getDbIngredient = (id) => {
    const dbIng = dbIngredients.find(i => i.id === id);
    if (!dbIng) return null;
    return { name: dbIng.name || dbIng.nombre, family: dbIng.family || dbIng.familia_olfativa };
  };

  const ingredient1 = getDbIngredient(ingredients[0]);
  const ingredient2 = getDbIngredient(ingredients[1]);
  const shape = LABEL_SHAPES.find(s => s.id === labelShape);

  const isComplete = bottle && ingredients.length >= 1 && labelShape;

  const [aiImage, setAiImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setAiImage(null);
    try {
      const prompt = buildPrompt({ bottleData, ingredient1, ingredient2, shape, labelColor, textColor, dedication });
      const src = await generatePerfumeImage(prompt, bottleData?.image);
      setAiImage(src);
    } catch (err) {
      setGenError(err.message ?? "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold mb-2">Summary</p>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-alabaster tracking-tight mb-2">
          Your Creation
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Summary rows + confirm */}
        <div className="space-y-6">
          <div className="space-y-4">
            <SummaryRow label="Bottle" value={bottleData?.name} done={!!bottle} />
            <SummaryRow
              label="Ingredients"
              value={[ingredient1?.name, ingredient2?.name].filter(Boolean).join(" · ") || null}
              done={ingredients.length > 0}
            />
            <SummaryRow label="Label" value={shape?.name} done={!!labelShape} />
            <SummaryRow label="Dedication" value={dedication || "—"} done={!!dedication} />
            <SummaryRow
              label="Total Configuration"
              value={totalPrice ? `${totalPrice.toFixed(2)}€` : "Calculating..."}
              done={!!totalPrice}
              isGold
            />
          </div>

          <button
            onClick={onConfirm}
            disabled={!isComplete || isSubmitting}
            className={`w-full py-5 mt-8 font-mono text-xs uppercase tracking-widest transition-all rounded-full shadow-2xl ${
              isComplete && !isSubmitting
                ? "bg-gold text-obsidian hover:bg-gold/90 scale-105 active:scale-100"
                : "bg-gold/20 text-alabaster/30 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Processing..." : "Confirm order"}
          </button>
        </div>

        {/* Right: Bottle photo + AI preview */}
        <div className="sticky top-0 space-y-6">
          {/* Original bottle */}
          {bottleData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] bg-obsidian rounded-[40px] border border-gold/10 overflow-hidden shadow-2xl"
            >
              <img
                src={bottleData.image}
                alt={bottleData.name}
                className="w-full h-full object-cover brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <p className="font-mono text-[10px] text-gold uppercase tracking-[0.4em] mb-2">Selected Vessel</p>
                <p className="font-heading text-2xl text-alabaster">{bottleData.name}</p>
              </div>
            </motion.div>
          ) : (
            <div className="aspect-[3/4] bg-white/5 rounded-[40px] border border-dashed border-white/10 flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
              Awaiting selection
            </div>
          )}

          {/* AI Preview section */}
          <div className="rounded-[32px] border border-gold/20 bg-white/[0.02] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold mb-1">AI Vision</p>
                <p className="font-heading text-sm text-alabaster">Personalised label preview</p>
              </div>
              <Sparkles className="w-4 h-4 text-gold/60" />
            </div>

            {/* Content area */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Generated image */}
                {aiImage && !generating && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative rounded-2xl overflow-hidden border border-gold/10"
                  >
                    <img src={aiImage} alt="AI generated perfume" className="w-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold/80">
                        Generated by Imagen 3
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Loading shimmer */}
                {generating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-4 border border-white/5"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-8 h-8 text-gold" />
                    </motion.div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                      Generating your vision…
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                {genError && !generating && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-red-500/5 border border-red-500/20 px-5 py-6 flex gap-3 items-start"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-1">Error</p>
                      <p className="text-xs text-white/40">{genError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Placeholder */}
                {!aiImage && !generating && !genError && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square rounded-2xl bg-white/[0.015] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center px-6"
                  >
                    <Sparkles className="w-6 h-6 text-gold/30" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
                      Click Generate to see your personalised perfume
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate / Regenerate button */}
              <button
                onClick={handleGenerate}
                disabled={!isComplete || generating}
                className={`mt-5 w-full py-3 rounded-full font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isComplete && !generating
                    ? "border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold"
                    : "border border-white/10 text-white/20 cursor-not-allowed"
                }`}
              >
                {aiImage && !generating ? (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    {generating ? "Generating…" : "Generate AI preview"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isComplete && (
        <p className="text-center font-mono text-[10px] text-alabaster/30 mt-3 uppercase tracking-widest">
          Complete all steps to confirm
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, done, isGold }) {
  return (
    <div className={`flex items-center gap-6 py-4 px-6 border border-white/5 rounded-2xl transition-all duration-500 ${
      isGold
        ? "bg-gold/10 border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
        : "bg-white/[0.02] hover:bg-white/[0.05]"
    }`}>
      <div className={`w-6 h-6 flex items-center justify-center border rounded-full transition-colors ${
        done ? "border-gold bg-gold" : "border-white/20"
      }`}>
        {done && <Check className="w-3 h-3 text-obsidian" />}
      </div>
      <div className="flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mb-1">{label}</p>
        <p className={`font-heading ${
          value && value !== "—"
            ? isGold ? "text-gold font-bold text-xl" : "text-alabaster text-base"
            : "text-white/10"
        }`}>
          {value || "Not selected"}
        </p>
      </div>
    </div>
  );
}
