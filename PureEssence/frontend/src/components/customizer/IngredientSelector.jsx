import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

export default function IngredientSelector({ selected, onSelect, dbData = [] }) {
  const [activeFamily, setActiveFamily] = useState("All");

  const dbIngredientsList = dbData.map(dbIng => ({
    id: dbIng.id,
    name: dbIng.name || dbIng.nombre,
    family: dbIng.family || dbIng.familia_olfativa || "Other",
    hasStock: dbIng.stock !== undefined ? dbIng.stock > 0 : true
  }));

  const dbFamilies = [...new Set(dbIngredientsList.map(i => i.family))];
  const allFamilies = ["All", ...dbFamilies];

  const filtered = activeFamily === "All"
    ? dbIngredientsList
    : dbIngredientsList.filter(i => i.family === activeFamily);

  const handleToggle = (id, hasStock) => {
    if (!hasStock) return;
    if (selected.includes(id)) {
      onSelect(selected.filter(s => s !== id));
    } else if (selected.length < 2) {
      onSelect([...selected, id]);
    } else {
      // Replace the first selected
      onSelect([selected[1], id]);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold mb-2">
          Step 02
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-alabaster tracking-tight mb-2">
          Compose Your Essence
        </h2>
        <p className="text-alabaster/40 text-sm">
          Select exactly 2 ingredients from {dbData.length} available.
        </p>
      </div>

      {/* Selected ingredients display */}
      <div className="flex gap-3 mb-6">
        {[0, 1].map((slot) => {
          const selectedId = selected[slot];
          const selectedDbIng = dbData.find(i => i.id === selectedId);
          const name = selectedDbIng ? (selectedDbIng.name || selectedDbIng.nombre) : null;
          
          return (
          <div
            key={slot}
            className={`flex-1 h-14 border flex items-center justify-center gap-2 transition-all ${selectedId
              ? "border-gold bg-gold/10"
              : "border-gold/10 border-dashed"
              }`}
          >
            {selectedId ? (
              <>
                <span className="font-heading text-sm text-gold">
                  {name}
                </span>
                <button
                  onClick={() => onSelect(selected.filter(s => s !== selectedId))}
                  className="w-5 h-5 flex items-center justify-center hover:bg-gold/20 transition-colors"
                >
                  <X className="w-3 h-3 text-gold/60" />
                </button>
              </>
            ) : (
              <span className="font-mono text-[10px] text-alabaster/20 uppercase tracking-widest">
                Ingredient {slot + 1}
              </span>
            )}
          </div>
        )})}
      </div>

      {/* Family tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {allFamilies.map((family) => (
          <button
            key={family}
            onClick={() => setActiveFamily(family)}
            className={`flex-shrink-0 px-4 py-2 font-mono text-[10px] uppercase tracking-widest border transition-all ${activeFamily === family
              ? "border-gold bg-gold text-obsidian"
              : "border-gold/20 text-alabaster/50 hover:border-gold/40"
              }`}
          >
            {family}
          </button>
        ))}
      </div>

      {/* Ingredient grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => {
            const isSelected = selected.includes(item.id);

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleToggle(item.id, item.hasStock)}
                disabled={!item.hasStock}
                className={`relative p-3 border text-center transition-all duration-300 ${isSelected
                  ? "border-gold bg-gold/10"
                  : !item.hasStock
                    ? "border-red-500/10 opacity-30 cursor-not-allowed"
                    : "border-gold/10 hover:border-gold/30"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-gold flex items-center justify-center">
                    <Check className="w-2 h-2 text-obsidian" />
                  </div>
                )}
                {!item.hasStock && (
                  <div className="absolute top-1 right-1 px-1 bg-red-500 text-white text-[6px] font-bold uppercase tracking-tighter">
                    Agotado
                  </div>
                )}
                <p className={`font-heading text-xs font-medium leading-tight ${!item.hasStock ? "text-white/20" : "text-alabaster"}`}>
                  {item.name}
                </p>
                <p className="font-mono text-[8px] text-gold/40 uppercase tracking-widest mt-1">
                  {item.family}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}