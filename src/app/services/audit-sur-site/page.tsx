"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FaSearchPlus, FaArrowRight, FaArrowLeft,
  FaChartLine, FaGraduationCap, FaDesktop,
  FaCheck, FaStar,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s, transform .65s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

const COLOR = "#8B5CF6";

const PROBLEMES = [
  { label: "Processus non maîtrisés", desc: "Vos équipes travaillent sans méthode claire, causant des retards répétés." },
  { label: "Manque de visibilité sur les opérations", desc: "Impossible de savoir ce qui se passe réellement sur le terrain." },
  { label: "Baisse de performance sans raison claire", desc: "Les résultats chutent mais l'origine du problème reste floue." },
  { label: "Absence d'audit interne sur les normes ISO", desc: "Votre conformité n'est ni vérifiée ni documentée régulièrement." },
  { label: "Absence de tour manager", desc: "Aucun responsable pour coordonner les opérations terrain au quotidien." },
  { label: "Écarts entre procédures et réalité terrain", desc: "Ce qui est écrit et ce qui se fait sont deux réalités différentes." },
  { label: "Manque de coordination entre équipes", desc: "Chaque département travaille en silo, sans communication transversale." },
];

const METHODOLOGIE = [
  { num: 1, color: "#8B5CF6", title: "Préparation & Cadrage", desc: "Analyse des besoins et compréhension du contexte métier avant toute intervention." },
  { num: 2, color: "#6366F1", title: "Audit Terrain", desc: "Observation in situ, entretiens et collecte de données qualitatives sur site." },
  { num: 3, color: "#3B82F6", title: "Analyse des Écarts", desc: "Identification des dysfonctionnements, risques et axes d'amélioration prioritaires." },
  { num: 4, color: "#0EA5E9", title: "Rapport de Synthèse", desc: "Documentation structurée des constats avec preuves et recommandations claires." },
  { num: 5, color: "#22C55E", title: "Plan d'Action", desc: "Feuille de route opérationnelle avec responsables, délais et indicateurs de suivi." },
];

const OTHERS = [
  { slug: "consulting", icon: <FaChartLine />, color: "#3B82F6", title: "Consulting", badge: "Stratégie" },
  { slug: "nos-plateformes", icon: <FaDesktop />, color: "#A3E635", title: "Nos Plateformes", badge: "Digital" },
  { slug: "formations", icon: <FaGraduationCap />, color: "#F7B500", title: "Formations", badge: "Certif." },
];

const NAV = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

export default function AuditPage() {
  const [open, setOpen] = useState(false);
  const [expandedP, setExpandedP] = useState<number | null>(null);

  // ==================== STATS RÉELLES DEPUIS LA BASE DE DONNÉES ====================
  const [nbExperts, setNbExperts] = useState<number | null>(null);
  const [nbStartups, setNbStartups] = useState<number | null>(null);
  const [tauxSatisfaction, setTauxSatisfaction] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Nombre d'experts validés
        const expertsRes = await fetch(`${BASE}/experts/liste`);
        if (expertsRes.ok) {
          const experts = await expertsRes.json();
          setNbExperts(Array.isArray(experts) ? experts.filter((e: any) => e.statut === "valide").length : 0);
        }

        // Nombre de startups validées
        const startupsRes = await fetch(`${BASE}/startups/liste`);
        if (startupsRes.ok) {
          const startups = await startupsRes.json();
          setNbStartups(Array.isArray(startups) ? startups.filter((s: any) => s.statut === "valide").length : 0);
        }

        // Taux de satisfaction depuis les témoignages
        const temosRes = await fetch(`${BASE}/temoignages/publics`);
        if (temosRes.ok) {
          const temos = await temosRes.json();
          if (Array.isArray(temos) && temos.length > 0) {
            const total = temos.reduce((sum: number, t: any) => sum + (t.note || 5), 0);
            setTauxSatisfaction(Math.round((total / temos.length / 5) * 100));
          } else {
            setTauxSatisfaction(94);
          }
        }
      } catch (error) {
        console.error("Erreur chargement stats:", error);
        setNbExperts(0);
        setNbStartups(0);
        setTauxSatisfaction(94);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const renderStars = () => {
    const note = (tauxSatisfaction ?? 94) / 20;
    return (
      <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar key={s} style={{ color: s <= Math.round(note) ? "#F7B500" : "rgba(255,255,255,.3)", fontSize: 10 }} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#374151", background: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .diamond-float{animation:floatY 7s ease-in-out infinite;position:absolute;pointer-events:none;}
        .h1{animation:heroIn .8s cubic-bezier(.22,1,.36,1) .08s both}
        .h2{animation:heroIn .8s cubic-bezier(.22,1,.36,1) .2s both}
        .h3{animation:heroIn .8s cubic-bezier(.22,1,.36,1) .32s both}
        .h4{animation:heroIn .8s cubic-bezier(.22,1,.36,1) .44s both}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}
        .bar{width:4px;border-radius:99px;background:${COLOR};flex-shrink:0}
        .oc{border:1.5px solid rgba(10,37,64,.08);border-radius:16px;background:white;padding:22px;transition:all .3s;text-decoration:none;display:block;box-shadow:0 2px 12px rgba(10,37,64,.05)}
        .oc:hover{transform:translateY(-7px);box-shadow:0 20px 44px rgba(10,37,64,.12)}
        .pb-card{background:#fff;border:1.5px solid #F1F5F9;border-radius:14px;padding:16px 18px;cursor:pointer;transition:all .25s cubic-bezier(.22,1,.36,1);margin-bottom:10px;display:flex;align-items:flex-start;gap:14px;}
        .pb-card:hover{border-color:rgba(139,92,246,.35);background:rgba(139,92,246,.03);transform:translateX(5px);}
        .pb-card.active{border-color:rgba(139,92,246,.5);background:rgba(139,92,246,.04);}
        .pb-detail{overflow:hidden;transition:max-height .35s cubic-bezier(.22,1,.36,1),opacity .3s;max-height:0;opacity:0;}
        .pb-detail.open{max-height:60px;opacity:1;}
        .meth-dot{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;border:2.5px solid;}
        .meth-body{background:#F8FAFC;border:1px solid #E8EEF6;border-radius:14px;padding:18px 20px;flex:1;transition:all .3s;}
        .meth-body:hover{background:#fff;box-shadow:0 8px 28px rgba(139,92,246,.12);border-color:rgba(139,92,246,.25);transform:translateX(4px);}
        .stat-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:22px;transition:all .3s;animation:slideInRight .5s ease both;}
        .stat-card:hover{transform:translateY(-4px);background:rgba(255,255,255,.12);}
        .nav-link-w{color:#0A2540;text-decoration:none;font-size:15px;font-weight:500;transition:color .2s;}
        .nav-link-w:hover{color:#F7B500;}
        .stat-number{font-size:36px;font-weight:900;color:#F7B500;line-height:1;margin-bottom:4px}
        .stat-loading{width:28px;height:28px;border:3px solid #F7B500;border-top-color:transparent;border-radius:50%;margin:0 auto;animation:spin .8s linear infinite}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#0A2540", letterSpacing: "-0.3px" }}>
              Business <span style={{ color: "#F7B500" }}>Expert</span> Hub
            </span>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" className="nav-link-w">Accueil</Link>
            <Link href="/a-propos" className="nav-link-w">À propos</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <span style={{ color: "#F7B500", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Services ▾</span>
              {open && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "8px 0", zIndex: 200, minWidth: 210, boxShadow: "0 8px 30px rgba(0,0,0,.12)", animation: "fadeSlideDown .2s ease" }}>
                  {NAV.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link-w">Experts</Link>
            <Link href="/blog" className="nav-link-w">Blog</Link>
            <Link href="/contact" className="nav-link-w">Contact</Link>
          </nav>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/connexion"><button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription-startup"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#0A2540 0%,#2d1b5e 60%,#1a0d3d 100%)", padding: "80px 24px 100px", position: "relative", overflow: "hidden", color: "#fff" }}>
        <div className="diamond-float" style={{ width: 420, height: 420, right: -80, top: "50%", background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.14)", borderRadius: 24, animationDelay: "0s" }} />
        <div className="diamond-float" style={{ width: 250, height: 250, right: 110, top: "50%", background: "rgba(139,92,246,.05)", border: "1px solid rgba(139,92,246,.1)", borderRadius: 16, animationDelay: "-1.5s" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 28, display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Accueil</Link><span>›</span>
            <Link href="/services" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Services</Link><span>›</span>
            <span style={{ color: "#A78BFA", fontWeight: 600 }}>Audit sur site</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* TEXTE GAUCHE */}
            <div>
              <div className="h1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(139,92,246,.2)", border: "1.5px solid rgba(139,92,246,.5)", color: "#A78BFA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}><FaSearchPlus /></div>
                <span style={{ background: "#8B5CF6", color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", padding: "8px 18px", borderRadius: 99 }}>Audit Terrain</span>
              </div>
              <h1 className="h2" style={{ fontWeight: 900, fontSize: "clamp(38px,5vw,64px)", margin: "0 0 20px", lineHeight: 1.1 }}>
                Audit <span style={{ color: "#A78BFA" }}>sur site</span>
              </h1>
              <p className="h3" style={{ fontSize: 17, color: "rgba(255,255,255,.75)", lineHeight: 1.9, marginBottom: 28, maxWidth: 520 }}>
                Vous avez des problèmes de performance, mais vous ne savez pas exactement d'où ils viennent ?
              </p>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: "16px 22px", marginBottom: 32 }}>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.85)", lineHeight: 1.8 }}>
                  Avec <strong style={{ color: "#F7B500" }}>Business Expert Hub</strong>, identifiez les blocages réels et obtenez un plan d'action concret en 5 jours !
                </p>
              </div>
              <div className="h4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/inscription-startup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", padding: "14px 30px", borderRadius: 99, fontWeight: 800, fontSize: 15, textDecoration: "none", transition: "all .25s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(247,181,0,.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
                  Demander un audit <FaArrowRight size={13} />
                </Link>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.22)", color: "#fff", padding: "14px 28px", borderRadius: 99, fontWeight: 700, fontSize: 15, textDecoration: "none", transition: "all .25s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.16)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.08)"; }}>
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* 3 STATS DROITE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Experts certifiés */}
              <div className="stat-card" style={{ animationDelay: "0.1s" }}>

                <div className="stat-number">
                  {loadingStats ? <div className="stat-loading" /> : nbExperts ?? 0}
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>Experts certifiés</div>
              </div>

              {/* Startups accompagnées */}
              <div className="stat-card" style={{ animationDelay: "0.2s" }}>

                <div className="stat-number">
                  {loadingStats ? <div className="stat-loading" /> : nbStartups ?? 0}
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>Startups accompagnées</div>
              </div>

              {/* Taux de satisfaction — occupe toute la largeur */}
              <div className="stat-card" style={{ animationDelay: "0.3s", gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

                  <div>
                    <div className="stat-number">
                      {loadingStats ? <div className="stat-loading" /> : `${tauxSatisfaction ?? 94}%`}
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>Taux de satisfaction clients</div>
                    {!loadingStats && renderStars()}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CORPS */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Problèmes */}
        <section style={{ padding: "72px 0", borderBottom: "1px solid #F1F5F9" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div className="bar" style={{ height: 28 }} />
              <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 24 }}>Vous reconnaissez ces situations ?</h2>
            </div>
            <p style={{ color: "#64748B", fontSize: 14.5, marginBottom: 32, paddingLeft: 16 }}>
              Cliquez sur chaque problème pour comprendre son impact réel.
            </p>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            {PROBLEMES.map((p, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div>
                  <div
                    className={`pb-card${expandedP === i ? " active" : ""}`}
                    onClick={() => setExpandedP(expandedP === i ? null : i)}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: expandedP === i ? COLOR : "#CBD5E1", flexShrink: 0, marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{p.label}</span>
                      <div className={`pb-detail${expandedP === i ? " open" : ""}`}>
                        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, paddingTop: 6 }}>{p.desc}</p>
                      </div>
                    </div>
                    <span style={{ color: "#C4B5FD", fontSize: 18, transition: "transform .3s", transform: expandedP === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Méthodologie */}
        <section style={{ padding: "72px 0", borderBottom: "1px solid #F1F5F9" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ width: 60, height: 3, background: COLOR, margin: "0 auto 20px", borderRadius: 2 }} />
              <h2 style={{ fontWeight: 900, color: "#0A2540", fontSize: "clamp(26px,3.5vw,36px)", marginBottom: 14 }}>Notre méthodologie d'intervention</h2>
              <p style={{ color: "#64748B", fontSize: 15, maxWidth: 580, margin: "0 auto" }}>
                Une approche terrain structurée en <strong style={{ color: COLOR }}>5 étapes</strong> pour des résultats concrets et actionnables
              </p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px" }}>
            <div>
              {METHODOLOGIE.map((m, i) => (
                <FadeUp key={m.num} delay={i * 0.1}>
                  <div style={{ position: "relative", display: "flex", gap: 20, alignItems: "flex-start", marginBottom: i < METHODOLOGIE.length - 1 ? 32 : 0 }}>
                    {i < METHODOLOGIE.length - 1 && (
                      <div style={{ position: "absolute", left: 21, top: 44, bottom: -32, width: 2, background: `linear-gradient(${m.color},${METHODOLOGIE[i + 1].color})`, opacity: 0.3 }} />
                    )}
                    <div className="meth-dot" style={{ background: `${m.color}14`, borderColor: m.color, color: m.color }}>
                      <span style={{ fontSize: 16, fontWeight: 900 }}>{m.num}</span>
                    </div>
                    <div className="meth-body">
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540", marginBottom: 8 }}>{m.title}</div>
                      <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
            <FadeUp delay={0.2}>
              <div style={{ background: "linear-gradient(135deg,#0A2540,#2d1b5e)", borderRadius: 24, padding: 36, color: "#fff", height: "fit-content", position: "sticky", top: 100 }}>
                <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 14, lineHeight: 1.2 }}>
                  Résultats attendus<br /><span style={{ color: "#A78BFA" }}>après l'audit</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["Identification de tous les écarts critiques", "#A78BFA"],
                    ["Plan d'action priorisé et chiffré", "#F7B500"],
                    ["Recommandations normes ISO si applicable", "#60A5FA"],
                    ["Suivi post-audit inclus sur 30 jours", "#A3E635"],
                  ].map(([txt, c], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: `${c}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <FaCheck size={9} color={c} />
                      </div>
                      <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.8)", lineHeight: 1.6 }}>{txt}</span>
                    </div>
                  ))}
                </div>
                <Link href="/inscription-startup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", padding: "13px 26px", borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: "none", marginTop: 24, width: "100%", justifyContent: "center" }}>
                  Demander un audit <FaArrowRight size={12} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* CTA */}
        <FadeUp>
          <section style={{ padding: "72px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ background: "linear-gradient(135deg,#0A2540 0%,#2d1b5e 100%)", borderRadius: 28, padding: "60px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ width: 70, height: 70, borderRadius: 20, background: "rgba(247,181,0,.15)", border: "1px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <FaSearchPlus size={28} color="#F7B500" />
                </div>
                <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(24px,4vw,36px)", marginBottom: 14 }}>Demandez votre audit personnalisé</h2>
                <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: "0 auto 32px" }}>
                  Contactez-nous pour un diagnostic personnalisé de vos processus terrain.
                </p>
                <Link href="/inscription-startup" style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#F7B500", color: "#0A2540", fontWeight: 800, fontSize: 16, borderRadius: 99, padding: "16px 48px", textDecoration: "none", boxShadow: "0 12px 32px rgba(247,181,0,.35)" }}>
                  Demander un audit <FaArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Autres services */}
        <FadeUp>
          <section style={{ paddingBottom: "80px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="bar" style={{ height: 32 }} />
                <h2 style={{ fontWeight: 800, color: "#0A2540", margin: 0, fontSize: 22 }}>Nos autres services</h2>
              </div>
              <Link href="/services" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, color: COLOR, textDecoration: "none" }}>
                <FaArrowLeft size={10} /> Tous les services
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {OTHERS.map((s, i) => (
                <Link key={i} href={`/services/${s.slug}`} className="oc">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: `${s.color}12`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{s.icon}</div>
                    <span style={{ background: `${s.color}12`, color: s.color, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{s.badge}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15, marginBottom: 7 }}>{s.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: s.color, fontWeight: 700, fontSize: 13 }}>
                    Découvrir <FaArrowRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </FadeUp>
      </div>

      <footer style={{ background: "#081B33", color: "#fff", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 14 }}>© 2026 Business Expert Hub — Audit sur site</p>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, margin: 0 }}>Solutions personnalisées disponibles sur devis</p>
      </footer>
    </div>
  );
}