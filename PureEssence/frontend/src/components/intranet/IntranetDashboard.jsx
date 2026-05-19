import React from "react";
import { motion } from "framer-motion";
import { Users, FileText, Info, Award, Calendar, Video, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

export default function IntranetDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="border-b border-gold/20 pb-8">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-mono text-xs uppercase tracking-widest text-gold mb-2"
        >
          Documentación Interna
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl md:text-5xl font-bold text-alabaster tracking-tight mb-4"
        >
          INTRANET: Pure Essence
        </motion.h2>
        <div className="flex flex-wrap items-center gap-4 text-alabaster/60 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gold/60" />
            <span>Responsables del proyecto: <span className="text-alabaster font-medium">Sergio Gómez, Diego Moya, Diego Justo</span></span>
          </div>
        </div>
      </div>

      {/* 1. Comité de Empresa */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 flex items-center justify-center border border-gold/20">
            <ShieldCheck className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-alabaster">Comité de Empresa (Zona de Personal)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gold/10 p-6 bg-obsidian/40 backdrop-blur-sm">
            <h4 className="font-heading text-lg font-semibold text-gold mb-3">¿Quiénes somos?</h4>
            <p className="text-alabaster/60 text-sm leading-relaxed">
              El comité de empresa es el órgano encargado de representar a todos los trabajadores de CustomLab Studio.
              Su función principal es servir como enlace con la dirección para negociar mejoras y asegurar que se respete la normativa laboral vigente.
            </p>
          </div>

          <div className="border border-gold/10 p-6 bg-obsidian/40 backdrop-blur-sm">
            <h4 className="font-heading text-lg font-semibold text-gold mb-3">Organigrama y Roles</h4>
            <p className="text-alabaster/40 text-[10px] uppercase tracking-widest mb-4">Estructura: 50 trabajadores · 5 miembros</p>
            <ul className="space-y-3">
              {[
                { role: "Presidente", desc: "Coordina las reuniones y representa legalmente al comité." },
                { role: "Secretario", desc: "Encargado de las actas y la gestión documental oficial." },
                { role: "Vocales (3)", desc: "Portavoces de los diferentes departamentos de la empresa." }
              ].map((item) => (
                <li key={item.role} className="flex gap-3 text-sm">
                  <span className="text-gold font-mono text-xs pt-1">▸</span>
                  <div>
                    <span className="text-alabaster font-medium">{item.role}:</span>{" "}
                    <span className="text-alabaster/60">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border border-gold/10 p-6 bg-gold/5">
          <h4 className="font-heading text-lg font-semibold text-gold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />Marco Legal y Convenio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="#" className="flex items-center justify-between p-4 border border-gold/20 bg-obsidian hover:border-gold transition-colors group">
              <span className="text-sm text-alabaster group-hover:text-gold transition-colors">Estatuto de los Trabajadores (ET)</span>
              <ExternalLink className="w-4 h-4 text-gold/40" />
            </a>
            <a href="#" className="flex items-center justify-between p-4 border border-gold/20 bg-obsidian hover:border-gold transition-colors group">
              <span className="text-sm text-alabaster group-hover:text-gold transition-colors">Convenio Colectivo Industria Química</span>
              <ExternalLink className="w-4 h-4 text-gold/40" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Gestión Contractual */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 flex items-center justify-center border border-gold/20">
            <FileText className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-alabaster">Gestión Contractual (Infografías)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gold/10 p-6 bg-obsidian/40 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-semibold text-gold mb-3">Modificación del Contrato</h4>
              <p className="text-alabaster/60 text-sm leading-relaxed mb-4">
                Explicación sobre los cambios en las condiciones de trabajo (jornada, horario, funciones).
                Destaca la obligación de un preaviso de 15 días y los derechos del trabajador.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-tighter bg-gold/10 text-gold px-3 py-1 self-start">
              <Info className="w-3 h-3" /> Preaviso mínimo de 15 días
            </div>
          </div>

          <div className="border border-gold/10 p-6 bg-obsidian/40 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-semibold text-gold mb-3">Extinción: Despido Disciplinario</h4>
              <p className="text-alabaster/60 text-sm leading-relaxed mb-4">
                Guía clara sobre la finalización del contrato por incumplimientos graves.
                Proceso de notificación mediante carta y plazos de reclamación.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-tighter bg-red-900/20 text-red-400 px-3 py-1 self-start">
              <ShieldCheck className="w-3 h-3" /> Se recomienda consulta legal
            </div>
          </div>
        </div>
      </section>

      {/* 3. Noticias y Objetivos */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 flex items-center justify-center border border-gold/20">
            <Award className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-alabaster">3. Noticias y Objetivos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-gold/60">Acuerdos recientes</h4>
            {[
              "Mejora de sistemas de ventilación en zona de mezclado.",
              "Implementación de flexibilidad horaria para conciliación.",
              "Aprobación de plus por manejo de componentes químicos.",
              "Curso gratuito de formación en diseño de envases."
            ].map((text, i) => (
              <div key={i} className="flex gap-4 items-center p-4 border border-gold/5 bg-obsidian/20">
                <div className="w-1 h-1 bg-gold rounded-full" />
                <p className="text-sm text-alabaster/70">{text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-gold/60">Objetivos para 2026</h4>
            <div className="border border-gold/10 p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-alabaster/40 uppercase">Jornada de verano</span>
                  <span className="text-gold">75%</span>
                </div>
                <div className="h-1 bg-gold/10 overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: "75%" }} />
                </div>
                <p className="text-xs text-alabaster/60 italic">Conseguir la jornada intensiva durante verano.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-alabaster/40 uppercase">Formación continua</span>
                  <span className="text-gold">40%</span>
                </div>
                <div className="h-1 bg-gold/10 overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: "40%" }} />
                </div>
                <p className="text-xs text-alabaster/60 italic">Plan de formación continua en nuevas tecnologías.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Vídeo de Bienvenida */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 flex items-center justify-center border border-gold/20">
            <Video className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-alabaster">4. Vídeo de Bienvenida</h3>
        </div>

        <div className="aspect-video bg-obsidian border border-gold/10 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gold/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-500">
              <Video className="w-6 h-6 text-gold" />
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold text-alabaster mb-1">Bienvenido a Pure Essence</p>
              <p className="font-mono text-[10px] text-gold/40 uppercase tracking-widest">Sergio, Diego M & Diego J · 1:30 min</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs text-alabaster/40 leading-relaxed max-w-lg">
              <span className="text-gold font-medium italic">Sinopsis:</span> Presentación de la intranet, mostrando a los nuevos empleados cómo acceder a sus derechos y recursos desde el primer día.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}