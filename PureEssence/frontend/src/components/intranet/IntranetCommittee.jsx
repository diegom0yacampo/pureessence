import React from "react";
import { motion } from "framer-motion";
import { Users, FileText, Gavel, Award, Target, BookOpen, UserCheck, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui";

const committeeMembers = [
    { role: "Presidente", description: "Coordina las reuniones y representa legalmente al comité.", icon: UserCheck },
    { role: "Secretario", description: "Encargado de las actas y la gestión documental oficial.", icon: FileText },
    { role: "Vocales (3)", description: "Portavoces de los diferentes departamentos de la empresa.", icon: Users },
];

const agreements = [
    "Mejora de los sistemas de ventilación en la zona de mezclado de fragancias.",
    "Implementación de un sistema de flexibilidad horaria para mejorar la conciliación.",
    "Aprobación de un plus por manejo de componentes químicos volátiles.",
    "Curso gratuito de formación en diseño de envases para toda la plantilla.",
];

const goals = [
    "Conseguir la jornada intensiva durante los meses de verano.",
    "Implementar un plan de formación continua en nuevas tecnologías de perfumería.",
];

export default function IntranetCommittee() {
    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
            >
                <Badge variant="outline" className="text-gold border-gold/30 mb-4 px-3 py-1 font-mono uppercase tracking-widest text-[10px]">
                    Recursos Humanos
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-alabaster tracking-tight mb-6">
                    Comité de Empresa
                </h1>
                <p className="text-alabaster/60 text-lg leading-relaxed">
                    El órgano encargado de representar a todos los trabajadores de CustomLab Studio.
                    Nuestra misión es asegurar un entorno de trabajo justo, seguro y en constante mejora.
                </p>
            </motion.div>

            {/* Who are we */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-obsidian/50 border-gold/10 backdrop-blur-sm shine overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-gold">
                            <Users className="w-5 h-5 glow-gold" />
                            ¿Quiénes somos?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-alabaster/70 leading-relaxed">
                        El comité de empresa es el enlace directo con la dirección para negociar mejoras y asegurar que se respete la normativa laboral vigente en CustomLab Studio.
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    {committeeMembers.map((member, idx) => (
                        <motion.div
                            key={member.role}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gold/5 border border-gold/10 shine"
                        >
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold glow-gold">
                                <member.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-alabaster text-sm">{member.role}</h4>
                                <p className="text-xs text-alabaster/50">{member.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Legal Framework */}
            <section>
                <h2 className="text-2xl font-bold text-alabaster mb-6 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-gold glow-gold" />
                    Marco Legal y Convenio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a
                        href="#"
                        className="group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-alabaster">Estatuto de los Trabajadores</h3>
                                <p className="text-xs text-alabaster/40 uppercase tracking-widest font-mono">Normativa General (ET)</p>
                            </div>
                        </div>
                        <Award className="w-5 h-5 text-alabaster/20 group-hover:text-gold transition-colors" />
                    </a>

                    <a
                        href="#"
                        className="group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-alabaster">Convenio Colectivo</h3>
                                <p className="text-xs text-alabaster/40 uppercase tracking-widest font-mono">Industria Química y Perfumería</p>
                            </div>
                        </div>
                        <Award className="w-5 h-5 text-alabaster/20 group-hover:text-gold transition-colors" />
                    </a>
                </div>
            </section>

            {/* Contractual Management */}
            <section className="bg-gold/5 rounded-3xl p-8 border border-gold/10">
                <h2 className="text-2xl font-bold text-alabaster mb-8 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gold" />
                    Gestión Contractual
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-lg font-bold text-gold mb-4">Modificación del Contrato</h3>
                        <div className="space-y-4 text-alabaster/70">
                            <p>Explicación sobre los cambios en las condiciones de trabajo (jornada, horario, funciones).</p>
                            <div className="p-4 rounded-xl bg-black/40 border border-gold/10 text-sm">
                                <strong className="text-alabaster block mb-1">Puntos clave:</strong>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Obligación de preaviso de 15 días.</li>
                                    <li>Derecho a rescindir con indemnización si hay perjuicio grave.</li>
                                    <li>Posibilidad de impugnar ante la jurisdicción social.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gold mb-4">Extinción: Despido Disciplinario</h3>
                        <div className="space-y-4 text-alabaster/70">
                            <p>Finalización del contrato por incumplimientos graves y culpables del trabajador.</p>
                            <div className="p-4 rounded-xl bg-black/40 border border-gold/10 text-sm">
                                <strong className="text-alabaster block mb-1">Proceso:</strong>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Notificación por escrito (Carta de despido).</li>
                                    <li>Descripción clara de los hechos y fecha de efectos.</li>
                                    <li>Plazo de 20 días hábiles para reclamación.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* News and Objectives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-obsidian/50 border-gold/10 backdrop-blur-sm overflow-hidden">
                    <div className="bg-gold/10 px-6 py-3 border-b border-gold/10">
                        <CardTitle className="text-sm font-mono uppercase tracking-widest text-gold flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Acuerdos Recientes
                        </CardTitle>
                    </div>
                    <CardContent className="p-6">
                        <ul className="space-y-4">
                            {agreements.map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-alabaster/70 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-obsidian/50 border-gold/10 backdrop-blur-sm overflow-hidden">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/10">
                        <CardTitle className="text-sm font-mono uppercase tracking-widest text-alabaster flex items-center gap-2">
                            <Target className="w-4 h-4 text-gold" />
                            Objetivos 2026
                        </CardTitle>
                    </div>
                    <CardContent className="p-6">
                        <ul className="space-y-4">
                            {goals.map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-alabaster/70 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-alabaster/30 mt-1.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
