import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Maximize2, X } from "lucide-react";

export default function BottleSelector({ selected, onSelect, dbData = [] }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  return (
    <div>
      {/* Bottle Grid - full width of the container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {dbData.map((dbBottle, i) => {
          const name = dbBottle.name || dbBottle.nombre;
          const hasStock = dbBottle.stock !== undefined ? dbBottle.stock > 0 : true;
          const image = dbBottle.image_url || "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cilindro.png";
          const description = dbBottle.description || dbBottle.descripcion;
          const id = dbBottle.id;

          const bottleItem = { id, name, description, image };

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="relative group"
            >
              <button
                onClick={() => hasStock && onSelect(id)}
                disabled={!hasStock}
                className={`w-full aspect-square overflow-hidden border transition-all duration-300 relative ${selected === id
                    ? "border-gold bg-gold/5"
                    : !hasStock 
                      ? "border-red-500/20 opacity-40 cursor-not-allowed grayscale"
                      : "border-gold/10 hover:border-gold/30 bg-obsidian"
                  }`}
              >
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover brightness-110 group-hover:brightness-125 transition-all duration-500 shine"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />

                {selected === id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-obsidian" />
                  </div>
                )}

                {!hasStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] border border-red-400 px-2 py-1 rotate-[-15deg]">
                      Agotado
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-gold/50">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-heading text-[11px] font-medium text-alabaster leading-tight">
                    {name}
                  </p>
                </div>
              </button>

                {/* Zoom Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImage(bottleItem);
                  }}
                  className="absolute top-2 left-2 p-1.5 bg-obsidian/80 border border-gold/20 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold hover:text-obsidian"
                  title="View larger"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </motion.div>
          );
        })}
          </div>


      {selected && (() => {
        const selectedDbBottle = dbData.find(b => b.id === selected);
        const name = selectedDbBottle?.name || selectedDbBottle?.nombre;
        const description = selectedDbBottle?.description || selectedDbBottle?.descripcion;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 border border-gold/20 bg-gold/5"
          >
            <p className="font-heading text-sm font-semibold text-gold mb-1">
              {name}
            </p>
            <p className="text-alabaster/50 text-xs leading-relaxed">
              {description}
            </p>
          </motion.div>
        );
      })()}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-obsidian/95 backdrop-blur-sm"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full aspect-square md:aspect-video bg-obsidian border border-gold/20 overflow-hidden shadow-2xl shadow-gold/10"
            >
              <img
                src={zoomedImage.image}
                alt={zoomedImage.name}
                className="w-full h-full object-contain"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent">
                <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">
                  Bottle Detail
                </p>
                <h3 className="font-heading text-2xl font-bold text-alabaster mb-2">
                  {zoomedImage.name}
                </h3>
                <p className="text-alabaster/60 text-sm max-w-2xl leading-relaxed">
                  {zoomedImage.description}
                </p>
              </div>

              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-2 bg-obsidian/50 border border-gold/20 text-gold hover:bg-gold hover:text-obsidian transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}