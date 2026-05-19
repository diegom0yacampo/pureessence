import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, FileText, Bell,
  ChevronRight, ChevronDown, Clock,
  ShieldCheck, Award, LogOut,
  CheckCircle2, AlertCircle, Video,
  Cloud, ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Intranet.module.css';

const organigramaImg = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/Fotos-Generales/organigrama.png";

import IntranetUsers from '@/components/intranet/IntranetUsers';
import IntranetStock from '@/components/intranet/IntranetStock';
import IntranetFichajes from '@/components/intranet/IntranetFichajes';
import IntranetOrders from '@/components/intranet/IntranetOrders';

export default function Intranet() {
  const [activeTab, setActiveTab]         = useState('welcome');
  const [committeeOpen, setCommitteeOpen] = useState(false);
  const { user, logout } = useAuth();

  const committeeSubItems = [
    { id: 'legal',     label: 'Marco Legal',          icon: ShieldCheck },
    { id: 'contracts', label: 'Gestión Contractual',  icon: FileText },
    { id: 'news',      label: 'Noticias y Objetivos', icon: Bell },
  ];

  const menuItems = [
    { id: 'welcome',  label: 'Bienvenida',  icon: Award },
    { id: 'COMITE' },
    { id: 'fichajes', label: 'Mis Fichajes', icon: Clock },
    { id: 'orders',   label: 'Pedidos',     icon: ShoppingBag },
    { id: 'users',    label: 'Usuarios',    icon: Users },
    { id: 'stock',    label: 'Stock',       icon: BookOpen },
    { id: 'aws',      label: 'AWS Academy', icon: Cloud },
  ];

  const committeeActive = ['committee','legal','contracts','news'].includes(activeTab);

  return (
    <div className={styles.wrap}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <p className={styles.sidebarLabel}>Panel de Empleado</p>
          <h2 className={styles.sidebarName}>{user?.username}</h2>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItems}>
            {menuItems.map((item) => {
              if (item.id === 'COMITE') return (
                <div key="comite-block">
                  <button
                    onClick={() => { setCommitteeOpen(o => !o); if (!committeeOpen) setActiveTab('committee'); }}
                    className={`${styles.menuBtnHead} ${committeeActive ? styles.menuBtnHeadActive : ''}`}
                  >
                    <div className={styles.menuBtnInner}>
                      <Users size={16} style={{ flexShrink: 0 }} />
                      <span className={styles.menuLabel}>Comité de Empresa</span>
                    </div>
                    <ChevronDown className={`${styles.chevron} ${committeeOpen ? styles.chevronOpen : ''}`} />
                  </button>
                  {committeeOpen && (
                    <div className={styles.subMenu}>
                      {committeeSubItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveTab(sub.id)}
                          className={`${styles.subBtn} ${activeTab === sub.id ? styles.subBtnActive : ''}`}
                        >
                          <sub.icon size={14} style={{ flexShrink: 0 }} />
                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${styles.menuBtn} ${activeTab === item.id ? styles.menuBtnActive : ''}`}
                >
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.navFooter}>
            <button onClick={() => logout()} className={styles.logoutBtn}>
              <LogOut size={16} style={{ flexShrink: 0 }} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">

          {/* ── BIENVENIDA ── */}
          {activeTab === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.welcomeSection}>
              <div className={styles.welcomeCard}>
                <h1 className={styles.welcomeTitle}>Pure Essence Intranet</h1>
                <p className={styles.welcomeText}>
                  <strong style={{ color: 'var(--color-gold)' }}>Documentación Intranet: PURE ESSENCE</strong><br />
                  <strong>Responsables del Proyecto:</strong> Sergio Gómez, Diego Moya y Diego Justo.
                </p>
                <div className={styles.welcomeBox}>
                  <h4 className={styles.welcomeBoxTitle}>Acceso a la Intranet</h4>
                  <p className={styles.welcomeBoxText}>
                    Para acceder a nuestra intranet se necesita un correo electrónico autorizado para que solo puedan acceder los trabajadores de nuestra empresa. Este correo sería asignado por la compañera de recursos humanos. Una vez dentro, encontrarás diferentes apartados donde podrás acceder e informarte de las novedades conseguidas por el comité de empresa.
                  </p>
                </div>
              </div>

              <section className={styles.videoSection}>
                <h3 className={styles.videoHeading}>
                  <Video size={24} style={{ color: 'var(--color-gold)' }} /> Vídeo de Bienvenida
                </h3>
                <p className={styles.videoDesc}>
                  Sergio, Diego M. y Diego J. presentan la intranet, mostrando a los nuevos empleados cómo acceder a sus derechos y recursos desde el primer día en Pure Essence.
                </p>
                <div className={styles.videoWrap}>
                  <video
                    src="https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/Comite.mp4"
                    controls
                    className={styles.video}
                  />
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'fichajes' && <IntranetFichajes key="fichajes" />}
          {activeTab === 'orders'   && <IntranetOrders  key="orders" />}
          {activeTab === 'users'    && <IntranetUsers   key="users" />}
          {activeTab === 'stock'    && <IntranetStock   key="stock" />}

          {/* ── COMITÉ ── */}
          {activeTab === 'committee' && (
            <motion.div key="committee" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.pageSection}>
              <section>
                <h2 className={styles.sectionTitle}>Comité de Empresa</h2>
                <div className={styles.introBox}>
                  <h4 className={styles.introBoxTitle}>¿Quiénes somos?</h4>
                  <p className={styles.introBoxText}>
                    El comité de empresa es el órgano encargado de representar a todos los trabajadores de Pure Essence.
                    Su función principal es servir como enlace con la dirección para negociar mejoras y asegurar
                    que se respete la normativa laboral vigente.
                  </p>
                </div>
              </section>

              <section>
                <h3 className={styles.sectionSubtitle}>Organigrama y Roles</h3>
                <p style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '1rem' }}>
                  Para nuestra estructura de 50 trabajadores, el comité se compone de 5 miembros:
                </p>
                <div className={styles.rolesGrid}>
                  {[
                    { role: 'Presidente', desc: 'Coordina las reuniones y representa legalmente al comité.' },
                    { role: 'Secretario', desc: 'Encargado de las actas y la gestión documental oficial.' },
                    { role: 'Vocales (3)', desc: 'Portavoces de los diferentes departamentos de la empresa.' }
                  ].map((item, i) => (
                    <div key={i} className={styles.roleCard}>
                      <Users size={40} className={styles.roleIcon} />
                      <h5 className={styles.roleTitle}>{item.role}</h5>
                      <p className={styles.roleDesc}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.orgWrap}>
                  <span className={styles.orgLabel}>Diagrama Estructural Oficial</span>
                  <img src={organigramaImg} alt="Organigrama Pure Essence" className={styles.orgImg} />
                </div>
              </section>
            </motion.div>
          )}

          {/* ── MARCO LEGAL ── */}
          {activeTab === 'legal' && (
            <motion.div key="legal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.pageSection}>
              <h2 className={styles.sectionTitle}>Marco Legal y Convenio</h2>
              <p className={styles.legalDesc}>
                En este espacio los trabajadores pueden encontrar los enlaces directos a la normativa aplicable:
                el Estatuto de los Trabajadores (ET) y el Convenio Colectivo de la Industria Química y Perfumería.
                A continuación se recogen los artículos más relevantes para nuestra plantilla.
              </p>

              <div className={styles.legalLinks}>
                <a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2015-11430" target="_blank" rel="noopener noreferrer" className={styles.legalLinkBtn}>
                  <FileText size={15} /> Estatuto de los Trabajadores (BOE)
                </a>
                <a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2025-4808" target="_blank" rel="noopener noreferrer" className={styles.legalLinkBtn}>
                  <FileText size={15} /> Convenio Colectivo Industria Química y Perfumería (BOE)
                </a>
              </div>

              <h3 className={styles.legalGroupTitle}>Estatuto de los Trabajadores</h3>
              <div className={styles.legalBlocks}>
                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Artículo 4 — Derechos laborales básicos</h4>
                  <div className={styles.legalBody}>
                    <p>
                      Todos los trabajadores tienen derecho a recibir un trato digno y respetuoso, cobrar su salario puntualmente,
                      acceder a formación profesional y trabajar en condiciones seguras y saludables, sin sufrir ningún tipo de discriminación.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Artículo 29 — Pago del salario</h4>
                  <div className={styles.legalBody}>
                    <p>
                      La empresa deberá pagar el salario dentro de los plazos establecidos y entregar la nómina correspondiente.
                      Los trabajadores tienen derecho a reclamar cualquier error o retraso en el pago.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Artículo 34 — Jornada laboral</h4>
                  <div className={styles.legalBody}>
                    <p>
                      La jornada laboral se organizará respetando los horarios, descansos y límites de horas establecidos por la ley,
                      garantizando una correcta organización del tiempo de trabajo.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Artículo 38 — Vacaciones anuales</h4>
                  <div className={styles.legalBody}>
                    <p>
                      Todos los trabajadores tienen derecho a disfrutar de vacaciones retribuidas cada año, acordadas entre la empresa
                      y el empleado para garantizar el descanso y bienestar.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className={styles.legalGroupTitle}>Convenio Colectivo de la Industria Química y Perfumería</h3>
              <div className={styles.legalBlocks}>
                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Seguridad y prevención laboral</h4>
                  <div className={styles.legalBody}>
                    <p>
                      La empresa garantizará medidas de seguridad, formación preventiva y equipos de protección para asegurar
                      un entorno de trabajo seguro en la manipulación de productos químicos y perfumes.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Clasificación profesional</h4>
                  <div className={styles.legalBody}>
                    <p>
                      Cada trabajador tendrá asignado un grupo profesional según sus funciones, experiencia y responsabilidades
                      dentro de la empresa.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Complementos salariales</h4>
                  <div className={styles.legalBody}>
                    <p>
                      Los trabajadores podrán recibir complementos salariales por horas extra, nocturnidad, turnicidad u otras
                      condiciones especiales establecidas en el convenio.
                    </p>
                  </div>
                </div>

                <div className={styles.legalBlock}>
                  <h4 className={styles.legalTitle}>Formación profesional</h4>
                  <div className={styles.legalBody}>
                    <p>
                      La empresa fomentará la formación continua para mejorar los conocimientos y el desarrollo profesional
                      de todos los trabajadores.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CONTRATOS ── */}
          {activeTab === 'contracts' && (
            <motion.div key="contracts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.pageSection}>
              <h2 className={styles.sectionTitle}>Gestión Contractual (Infografías)</h2>
              <div className={styles.contractsGrid}>
                <div className={styles.contractCard}>
                  <div className={styles.contractIconGold}><FileText /></div>
                  <h4 className={styles.contractTitle}>Modificación del Contrato</h4>
                  <p className={styles.contractText}>
                    Explicación sobre los cambios en las condiciones de trabajo (jornada, horario, funciones). Se destaca la obligación de un preaviso de 15 días y los derechos del trabajador ante estas modificaciones.
                  </p>
                  <a href="https://create.piktochart.com/output/bec19f62f2b5-modificacion-del-contrato-laboral" target="_blank" rel="noopener noreferrer" className={styles.contractLink}>
                    <FileText size={16} /> Ver Infografía
                  </a>
                </div>
                <div className={styles.contractCard}>
                  <div className={styles.contractIconRed}><ShieldCheck /></div>
                  <h4 className={styles.contractTitle}>Extinción: Despido Disciplinario</h4>
                  <p className={styles.contractText}>
                    Guía clara sobre la finalización del contrato por incumplimientos graves. Se detalla el proceso de notificación mediante carta de despido y los plazos de reclamación.
                  </p>
                  <a href="https://create.piktochart.com/output/266e804138ab-el-despido-disciplinario" target="_blank" rel="noopener noreferrer" className={styles.contractLink}>
                    <FileText size={16} /> Ver Infografía
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── NOTICIAS ── */}
          {activeTab === 'news' && (
            <motion.div key="news" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.pageSection}>
              <h2 className={styles.sectionTitle}>Noticias y Objetivos</h2>

              <div>
                <h3 className={styles.newsSubtitle}>Acuerdos conseguidos recientemente</h3>
                <div className={styles.newsItems}>
                  {[
                    {
                      title: 'Mejora de los sistemas de ventilación',
                      desc: 'La empresa ha mejorado los sistemas de ventilación en la zona de mezclado de fragancias para garantizar un entorno de trabajo más seguro y saludable para los trabajadores.'
                    },
                    {
                      title: 'Flexibilidad horaria',
                      desc: 'Se ha implementado un sistema de flexibilidad horaria con el objetivo de facilitar la conciliación entre la vida laboral y personal de los empleados.'
                    },
                    {
                      title: 'Plus por componentes químicos',
                      desc: 'Se ha aprobado un complemento salarial para los trabajadores que manipulan componentes químicos volátiles, reconociendo las condiciones específicas de su trabajo.'
                    },
                    {
                      title: 'Formación en diseño de envases',
                      desc: 'La empresa ofrecerá un curso gratuito de diseño de envases dirigido a toda la plantilla para fomentar la formación y el desarrollo profesional.'
                    }
                  ].map((news, i) => (
                    <div key={i} className={styles.newsItem}>
                      <CheckCircle2 size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '0.2rem' }} />
                      <div>
                        <p className={styles.newsItemTitle}>{news.title}</p>
                        <p className={styles.newsItemText}>{news.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={styles.newsSubtitle}>Objetivos para 2026</h3>
                <div className={styles.newsItems}>
                  {[
                    {
                      title: 'Jornada intensiva en verano',
                      desc: 'Uno de los objetivos de la empresa para 2026 es implantar la jornada intensiva durante los meses de verano para mejorar el bienestar de los trabajadores.'
                    },
                    {
                      title: 'Formación continua en perfumería',
                      desc: 'La empresa pretende desarrollar un plan de formación continua centrado en nuevas tecnologías aplicadas al sector de la perfumería y la industria química.'
                    }
                  ].map((obj, i) => (
                    <div key={i} className={styles.newsItem}>
                      <AlertCircle size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '0.2rem' }} />
                      <div>
                        <p className={styles.newsItemTitle}>{obj.title}</p>
                        <p className={styles.newsItemText}>{obj.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── AWS ACADEMY ── */}
          {activeTab === 'aws' && (
            <motion.div key="aws" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.pageSection}>
              <div className={styles.awsCard}>
                <div className={styles.awsCardHeader}>
                  <div>
                    <div className={styles.awsBadges}>
                      <span className={styles.badgeGold}>Formación Oficial</span>
                      <span className={styles.badgeBlue}>Amazon Partner</span>
                    </div>
                    <h2 className={styles.awsTitle}>AWS Academy</h2>
                    <p className={styles.awsSubtitle}>
                      Acceso exclusivo para el equipo de Pure Essence a la plataforma de aprendizaje oficial de Amazon Web Services.
                      Desarrolla competencias clave en computación en la nube, infraestructura global y soluciones de inteligencia artificial.
                    </p>
                  </div>
                  <div className={styles.awsIconWrap}>
                    <Cloud size={48} style={{ color: 'var(--color-gold)' }} className={styles.pulsing} />
                  </div>
                </div>

                <div className={styles.awsCardFooter}>
                  <div>
                    <p className={styles.awsFooterLabel}>Enlace de acceso a la plataforma</p>
                    <p className={styles.awsFooterSub}>Inicia sesión con tus credenciales corporativas de Pure Essence</p>
                  </div>
                  <a href="https://awsacademy.instructure.com/" target="_blank" rel="noopener noreferrer" className={styles.awsBtn}>
                    <span>Entrar a AWS Academy</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>

              <div className={styles.coursesSection}>
                <h3 className={styles.coursesSectionTitle}>Cursos Disponibles</h3>
                <div className={styles.coursesGrid}>
                  <div className={styles.courseCard}>
                    <div className={styles.courseIconGold}><Cloud size={20} /></div>
                    <h4 className={styles.courseTitle}>AWS Academy Cloud Foundations</h4>
                    <p className={styles.courseDesc}>
                      Introducción general a los conceptos de computación en la nube, servicios de AWS, seguridad, arquitectura y soporte. Ideal para todo el personal de Pure Essence.
                    </p>
                    <div className={styles.courseMeta}>
                      <span>Nivel: Principiante</span>
                      <span>Duración: 20 Horas</span>
                    </div>
                  </div>

                  <div className={styles.courseCard}>
                    <div className={styles.courseIconBlue}><Award size={20} /></div>
                    <h4 className={styles.courseTitle}>AWS Academy Cloud Architecting</h4>
                    <p className={styles.courseDesc}>
                      Aprende a diseñar soluciones escalables, eficientes y seguras utilizando los servicios principales de AWS. Preparación completa para la certificación AWS Certified Solutions Architect.
                    </p>
                    <div className={styles.courseMeta}>
                      <span>Nivel: Intermedio</span>
                      <span>Duración: 40 Horas</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
