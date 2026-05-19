import React, { useState } from "react";
import { LayoutDashboard, Package, Users, Settings, BarChart3, Shield, ChevronDown, FileText, FileSignature, Newspaper } from "lucide-react";

const committeeSubItems = [
  { id: "committee-legal",    label: "Marco Legal",          icon: FileText },
  { id: "committee-contrato", label: "Gestión Contractual",  icon: FileSignature },
  { id: "committee-noticias", label: "Noticias y Objetivos", icon: Newspaper },
];

const menuItems = [
  { id: "committee", label: "Comité de Empresa",  icon: Shield, children: committeeSubItems },
  { id: "dashboard", label: "Panel General",       icon: LayoutDashboard },
  { id: "orders",    label: "Gestión de Pedidos",  icon: Package },
  { id: "analytics", label: "Análisis de Ventas",  icon: BarChart3 },
  { id: "settings",  label: "Configuración",       icon: Settings },
];

export default function IntranetSidebar({ active, onNavigate }) {
  const [committeeOpen, setCommitteeOpen] = useState(
    committeeSubItems.some(s => s.id === active)
  );

  return (
    <aside className="w-72 hidden lg:block border-r border-gold/5 bg-obsidian min-h-screen">
      <div className="p-8 sticky top-0">
        <div className="mb-12">
          <span className="mono-detail text-[8px] opacity-30 block mb-2">Acceso autorizado</span>
          <h2 className="font-heading text-xl text-alabaster tracking-widest uppercase italic">Panel Interno</h2>
        </div>

        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const isActive = active === item.id || item.children?.some(c => c.id === active);
            if (item.children) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setCommitteeOpen(o => !o)}
                    className={`flex items-center justify-between w-full group transition-all duration-500 ${
                      isActive ? "text-gold" : "text-alabaster/30 hover:text-alabaster/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-3.5 h-3.5 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:translate-x-1"}`} />
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em]">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${committeeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {committeeOpen && (
                    <div className="mt-2 ml-7 flex flex-col gap-3 border-l border-gold/10 pl-4">
                      {item.children.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onNavigate(sub.id)}
                          className={`flex items-center gap-3 group transition-all duration-300 ${
                            active === sub.id ? "text-gold" : "text-alabaster/25 hover:text-alabaster/55"
                          }`}
                        >
                          <sub.icon className="w-3 h-3 flex-shrink-0" />
                          <span className="font-mono text-[8px] uppercase tracking-[0.2em]">{sub.label}</span>
                          {active === sub.id && <div className="w-1 h-1 bg-gold rounded-full ml-auto shadow-[0_0_8px_rgba(197,160,89,0.5)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between group transition-all duration-500 ${
                  active === item.id ? "text-gold" : "text-alabaster/30 hover:text-alabaster/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-3.5 h-3.5 transition-transform duration-500 ${active === item.id ? "scale-110" : "group-hover:translate-x-1"}`} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em]">{item.label}</span>
                </div>
                {active === item.id && (
                  <div className="w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-32 pt-12 border-t border-gold/5">
          <div className="bg-gold/5 p-6 border border-gold/10">
            <span className="mono-detail text-[7px] text-gold/40 block mb-2">Estado de cifrado</span>
            <p className="font-mono text-[8px] text-gold uppercase tracking-widest">Activo: RSA-4096</p>
          </div>
        </div>
      </div>
    </aside>
  );
}