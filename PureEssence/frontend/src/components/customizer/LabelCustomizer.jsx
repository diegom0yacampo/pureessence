import React from "react";
import { motion } from "framer-motion";
import { LABEL_SHAPES } from "@/lib/perfumeData";
import { Circle, Square, RectangleHorizontal, Check } from "lucide-react";

const shapeIcons = {
  circular: Circle,
  cuadrada: Square,
  rectangular: RectangleHorizontal,
};

const LABEL_COLORS = [
  { id: "white", name: "Blanco", class: "bg-white", hex: "#FFFFFF" },
  { id: "black", name: "Negro", class: "bg-black", hex: "#000000" },
  { id: "gold", name: "Dorado", class: "bg-gold", hex: "#B5995B" },
];

const TEXT_COLORS = [
  { id: "white", name: "Blanco", class: "bg-white", hex: "#FFFFFF" },
  { id: "black", name: "Negro", class: "bg-black", hex: "#000000" },
  { id: "gold", name: "Dorado", class: "bg-gold", hex: "#B5995B" },
  { id: "blue", name: "Azul", class: "bg-blue-600", hex: "#181a92ff" },
];

export default function LabelCustomizer({
  shape, onShapeChange,
  labelColor, onLabelColorChange,
  textColor, onTextColorChange,
  dedication, onDedicationChange
}) {
  return (
    <div className="space-y-10">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold mb-2">
          Step 03
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-alabaster tracking-tight mb-2">
          Engrave Your Signature
        </h2>
        <p className="text-alabaster/40 text-sm">
          Choose your label shape, colors and write your personal dedication.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Label shape selection */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">
              Label Shape
            </p>
            <div className="flex gap-3">
              {LABEL_SHAPES.map((labelShape) => {
                const Icon = shapeIcons[labelShape.id];
                const isSelected = shape === labelShape.id;
                return (
                  <button
                    key={labelShape.id}
                    onClick={() => onShapeChange(labelShape.id)}
                    className={`flex-1 p-4 border flex flex-col items-center gap-2 transition-all duration-300 ${isSelected
                      ? "border-gold bg-gold/10"
                      : "border-gold/10 hover:border-gold/30"
                      }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? "text-gold" : "text-alabaster/30"}`} />
                    <span className={`font-mono text-[8px] uppercase tracking-widest ${isSelected ? "text-gold" : "text-alabaster/40"}`}>
                      {labelShape.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Color Selection Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Label Color */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">
                Label Color
              </p>
              <div className="flex gap-3">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onLabelColorChange(color.id)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${labelColor === color.id ? "border-gold scale-110" : "border-transparent"}`}
                    title={color.name}
                  >
                    <div className={`w-full h-full rounded-full ${color.class}`} />
                  </button>
                ))}
              </div>
            </section>

            {/* Text Color */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-widest text-alabaster/40 mb-4">
                Text Color
              </p>
              <div className="flex gap-3">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onTextColorChange(color.id)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${textColor === color.id ? "border-gold scale-110" : "border-transparent"}`}
                    title={color.name}
                  >
                    <div className={`w-full h-full rounded-full ${color.class}`} />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Dedication input */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-alabaster/40">
                Dedication
              </p>
              <p className="font-mono text-[10px] text-gold/60">
                {dedication.length}/50
              </p>
            </div>
            <input
              type="text"
              value={dedication}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  onDedicationChange(e.target.value);
                }
              }}
              placeholder="Write your personal dedication..."
              className="w-full bg-transparent border border-gold/20 px-6 py-4 text-alabaster font-heading text-lg placeholder:text-alabaster/20 focus:outline-none focus:border-gold transition-colors"
            />
          </section>
        </div>

        {/* Live preview */}
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-12 min-h-[400px]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-alabaster/20 mb-12">
            Label Live Preview
          </p>

          <motion.div
            key={`${shape}-${labelColor}-${textColor}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`shadow-2xl transition-all duration-500 flex items-center justify-center p-8 ${shape === "circular"
              ? "rounded-full w-56 h-56"
              : shape === "cuadrada"
                ? "w-56 h-56"
                : "w-80 h-40"
              }`}
            style={{
              backgroundColor: LABEL_COLORS.find(c => c.id === labelColor)?.hex,
              color: TEXT_COLORS.find(c => c.id === textColor)?.hex
            }}
          >
            <div className="text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.4em] opacity-50 mb-3">
                CustomLab Studio
              </p>
              <p className="font-heading text-lg font-bold break-words max-w-[200px] leading-tight">
                {dedication || "Your dedication"}
              </p>
              <p className="font-mono text-[8px] uppercase tracking-widest opacity-30 mt-4">
                Geometric Parfum
              </p>
            </div>
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-alabaster/30 text-xs font-mono uppercase tracking-widest">
              Physical engraving
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}