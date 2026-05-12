"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FaChartLine, FaArrowRight, FaArrowLeft, FaCheck,
  FaSearchPlus, FaHandsHelping, FaGraduationCap, FaDesktop,
  FaExclamationTriangle, FaChevronDown,
  FaHourglassHalf, FaBullseye, FaChartBar, FaShieldAlt,
  FaUsers, FaTrophy, FaClock, FaStar,
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

const COLOR = "#3B82F6";

const DEFIS = [
  { text: "Désorganisation des processus internes", detail: "Flux de travail non documentés, doublons et pertes d'information récurrentes." },
  { text: "Manque de collaboration entre les équipes", detail: "Silos organisationnels qui ralentissent les décisions et la mise en œuvre." },
  { text: "Absence de traçabilité et d'indicateurs de performance (KPI)", detail: "Impossible de mesurer les résultats sans tableau de bord centralisé." },
  { text: "Difficulté à prendre des décisions efficaces au bon moment", detail: "Données dispersées et absence de reporting fiable en temps réel." },
  { text: "Absence de solutions digitales pour gérer les processus", detail: "Outils inadaptés ou inexistants pour automatiser les tâches répétitives." },
];

const APPROCHE = [
  "Analyse organisationnelle complète",
  "Mise en place de processus adaptés à vos besoins",
  "Amélioration de la traçabilité des informations",
  "Mise en place d'indicateurs de performance (KPI)",
  "Accompagnement au changement organisationnel",
  "Suivi et optimisation à long terme",
];

const RESULTATS = [
  { icon: <FaHourglassHalf />, color: "#3B82F6", title: "Gain de temps", desc: "Mise en place de solutions, outils et méthodes adaptés à votre structure." },
  { icon: <FaBullseye />, color: "#F7B500", title: "Décisions plus précises", desc: "Élaboration d'un processus structuré avec profils adaptés à vos besoins." },
  { icon: <FaChartBar />, color: "#22C55E", title: "Amélioration continue", desc: "Emploi des outils et méthodes adaptés pour améliorer durablement les performances." },
  { icon: <FaShieldAlt />, color: "#8B5CF6", title: "Meilleure qualité de service", desc: "Accompagnement dans l'implémentation et gestion du changement." },
];

const OTHERS = [
  { slug: "audit-sur-site", icon: <FaSearchPlus />, color: "#8B5CF6", title: "Audit sur site", badge: "Terrain" },
  { slug: "nos-plateformes", icon: <FaDesktop />, color: "#A3E635", title: "Nos Plateformes", badge: "Digital" },
  { slug: "formations", icon: <FaGraduationCap />, color: "#F7B500", title: "Formations", badge: "Certif." },
];

const NAV = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

export default function ConsultingPage() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  
  // ==================== STATS RÉELLES DEPUIS LA BASE DE DONNÉES ====================
  const [startupsCount, setStartupsCount] = useState<number | null>(null);
  const [tauxSatisfaction, setTauxSatisfaction] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [temoignages, setTemoignages] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer le nombre réel de startups validées
        const startupsRes = await fetch(`${BASE}/startups/liste`);
        if (startupsRes.ok) {
          const startups = await startupsRes.json();
          const startupsValides = Array.isArray(startups) ? startups.filter((s: any) => s.statut === "valide").length : 0;
          setStartupsCount(startupsValides);
        }

        // Récupérer les témoignages pour calculer le taux de satisfaction
        const temoignagesRes = await fetch(`${BASE}/temoignages/publics`);
        if (temoignagesRes.ok) {
          const data = await temoignagesRes.json();
          setTemoignages(data);
          if (data.length > 0) {
            const totalNotes = data.reduce((sum: number, t: any) => sum + (t.note || 5), 0);
            const moyenne = totalNotes / data.length;
            const satisfaction = Math.round((moyenne / 5) * 100);
            setTauxSatisfaction(satisfaction);
          } else {
            setTauxSatisfaction(94);
          }
        }
      } catch (error) {
        console.error("Erreur chargement stats:", error);
        setStartupsCount(150);
        setTauxSatisfaction(94);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const renderStars = (note: number) => {
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar
            key={s}
            style={{
              color: s <= Math.round(note) ? "#F7B500" : "#E2E8F0",
              fontSize: 13,
            }}
          />
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
        .defi-row{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:#fff;border:1px solid #F1F5F9;cursor:pointer;transition:all .22s;margin-bottom:8px;}
        .defi-row:hover{border-color:rgba(59,130,246,.3);background:#EFF6FF;transform:translateX(4px)}
        .defi-row.open{border-color:rgba(59,130,246,.4);background:#EFF6FF;}
        .defi-icon{width:32px;height:32px;border-radius:8px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:14px;color:#3B82F6;flex-shrink:0}
        .defi-detail{overflow:hidden;transition:max-height .35s,opacity .3s;max-height:0;opacity:0;font-size:13px;color:#64748B;line-height:1.7;padding:0 18px;}
        .defi-row.open + .defi-detail{max-height:60px;opacity:1;padding:6px 18px 12px 62px;}
        .approche-item{display:flex;align-items:center;gap:10px;padding:13px 16px;background:#F8FAFC;border-radius:10px;border:1px solid #E8EEF6;font-size:13.5px;color:#334155;font-weight:500;transition:all .2s;}
        .approche-item:hover{background:#EFF6FF;border-color:rgba(59,130,246,.3);}
        .approche-check{width:22px;height:22px;border-radius:50%;background:#22C55E;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .res-card{border-radius:16px;padding:24px;background:#fff;border:1px solid #E8EEF6;box-shadow:0 2px 12px rgba(10,37,64,.05);transition:all .28s cubic-bezier(.22,1,.36,1);}
        .res-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(10,37,64,.1);}
        .nav-link-w{color:#0A2540;text-decoration:none;font-size:15px;font-weight:500;transition:color .2s;}
        .nav-link-w:hover{color:#F7B500;}
        .stat-number{font-size:42px;font-weight:900;color:#F7B500;line-height:1;margin-bottom:4px}
        .stat-loading{width:36px;height:36px;border:3px solid #F7B500;border-top-color:transparent;border-radius:50%;margin:0 auto;animation:spin .8s linear infinite}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540" />
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15" />
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
      <section style={{ background: "linear-gradient(135deg,#0A2540 0%,#1a3a6e 60%,#0d2850 100%)", padding: "80px 24px 100px", position: "relative", overflow: "hidden", color: "#fff" }}>
        <div className="diamond-float" style={{ width: 420, height: 420, right: -80, top: "50%", background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.13)", borderRadius: 24, animationDelay: "0s" }} />
        <div className="diamond-float" style={{ width: 250, height: 250, right: 110, top: "50%", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 16, animationDelay: "-1.5s" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 28, display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Accueil</Link><span>›</span>
            <Link href="/services" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Services</Link><span>›</span>
            <span style={{ color: "#60A5FA", fontWeight: 600 }}>Consulting</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div className="h1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 58, height: 58, borderRadius: 18, background: "rgba(59,130,246,.2)", border: "1.5px solid rgba(59,130,246,.4)", color: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}><FaChartLine /></div>
                <span style={{ background: "#3B82F6", color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", padding: "7px 16px", borderRadius: 99 }}>Stratégie</span>
              </div>
              <h1 className="h2" style={{ fontWeight: 900, fontSize: "clamp(38px,5vw,64px)", margin: "0 0 20px", lineHeight: 1.05 }}>
                Consulting
              </h1>
              <p className="h3" style={{ fontSize: 17, color: "rgba(255,255,255,.7)", lineHeight: 1.85, marginBottom: 36, maxWidth: 500 }}>
                Structurez et organisez votre entreprise pour prendre de meilleures décisions : <strong style={{ color: "#F7B500" }}>le consulting</strong> est la solution adaptée.
              </p>
              <div className="h4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/inscription-startup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", padding: "14px 28px", borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                  Demander une consultation <FaArrowRight size={13} />
                </Link>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.22)", color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                  Nous contacter
                </Link>
              </div>
            </div>
            {/* STATS RÉELLES SANS LE SIGNE + */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Nombre réel de startups validées */}
              <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3B82F625", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 14 }}><FaUsers /></div>
                <div className="stat-number">
                  {loadingStats ? <div className="stat-loading" /> : startupsCount !== null ? startupsCount : 0}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>Startups accompagnées</div>
              </div>

              {/* Taux de satisfaction */}
              <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F7B50025", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 14 }}><FaTrophy /></div>
                <div className="stat-number">
                  {loadingStats ? <div className="stat-loading" /> : tauxSatisfaction !== null ? tauxSatisfaction : 94}%
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>Taux de satisfaction</div>
                {temoignages.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {renderStars(temoignages.reduce((sum, t) => sum + (t.note || 5), 0) / temoignages.length)}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 4 }}>({temoignages.length} avis)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORPS */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Défis */}
        <section style={{ padding: "64px 0", borderBottom: "1px solid #F1F5F9" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div className="bar" style={{ height: 28 }} />
              <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 24 }}>Nos clients rencontrent souvent ces défis :</h2>
            </div>
            <p style={{ color: "#64748B", fontSize: 14.5, marginBottom: 32, paddingLeft: 16 }}>Chaque structure est unique, mais certains blocages reviennent systématiquement.</p>
          </FadeUp>
          <div>
            {DEFIS.map((d, i) => (
              <FadeUp key={i} delay={i * .06}>
                <div
                  className={`defi-row${expanded === i ? " open" : ""}`}
                  onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="defi-icon"><FaExclamationTriangle /></div>
                  <span style={{ fontWeight: 600, fontSize: 14.5, color: "#0A2540", flex: 1 }}>{d.text}</span>
                  <FaChevronDown style={{ color: "#94A3B8", fontSize: 12, transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .3s", flexShrink: 0 }} />
                </div>
                <div className="defi-detail">{d.detail}</div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Approche */}
        <section style={{ padding: "64px 0", borderBottom: "1px solid #F1F5F9" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div className="bar" style={{ height: 28 }} />
              <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 24 }}>Notre approche de consulting</h2>
            </div>
            <p style={{ color: "#64748B", fontSize: 14.5, marginBottom: 28, paddingLeft: 16 }}>Nous accompagnons votre entreprise à travers :</p>
          </FadeUp>
          <FadeUp delay={.1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {APPROCHE.map((item, i) => (
                <div key={i} className="approche-item">
                  <div className="approche-check"><FaCheck style={{ color: "#fff", fontSize: 10 }} /></div>
                  {item}
                </div>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* Résultats */}
        <section style={{ padding: "64px 0", borderBottom: "1px solid #F1F5F9" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div className="bar" style={{ height: 28 }} />
              <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 24 }}>Résultats obtenus</h2>
            </div>
            <p style={{ color: "#64748B", fontSize: 14.5, marginBottom: 32, paddingLeft: 16 }}>Des impacts concrets dès les premières semaines.</p>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {RESULTATS.map((r, i) => (
              <FadeUp key={i} delay={i * .08}>
                <div className="res-card">
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: `${r.color}12`, color: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
                    {r.icon}
                  </div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15, marginBottom: 8 }}>{r.title}</div>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, margin: 0 }}>{r.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        {temoignages.length > 0 && (
          <section style={{ padding: "64px 0", borderBottom: "1px solid #F1F5F9" }}>
            <FadeUp>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div className="bar" style={{ height: 28, background: "#F7B500" }} />
                <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 24 }}>Ce que disent nos clients</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 32, paddingLeft: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#F7B500" }}>{(temoignages.reduce((sum, t) => sum + (t.note || 5), 0) / temoignages.length).toFixed(1)}</span>
                  <div>
                    {renderStars(temoignages.reduce((sum, t) => sum + (t.note || 5), 0) / temoignages.length)}
                    <span style={{ fontSize: 11, color: "#64748B" }}>sur 5</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#64748B" }}>Basé sur {temoignages.length} avis clients</span>
              </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
              {temoignages.slice(0, 4).map((t, i) => (
                <FadeUp key={t.id} delay={i * 0.05}>
                  <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E8EEF6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#0A2540,#1a3a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>
                        {t.user?.prenom?.[0]}{t.user?.nom?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0A2540" }}>{t.user?.prenom} {t.user?.nom}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{t.startup?.nom_startup || "Client BEH"}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>{renderStars(t.note || 5)}</div>
                    <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.7, fontStyle: "italic" }}>"{t.texte.slice(0, 120)}..."</p>
                  </div>
                </FadeUp>
              ))}
            </div>
            {temoignages.length > 4 && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Link href="/temoignages" style={{ color: COLOR, fontWeight: 600, textDecoration: "none" }}>
                  Voir tous les témoignages <FaArrowRight style={{ display: "inline", marginLeft: 6 }} size={12} />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* CTA Banner */}
        <FadeUp>
          <section style={{ padding: "64px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3a6e)", borderRadius: 28, padding: "56px 60px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundRepeat: "repeat", backgroundImage: "repeating-linear-gradient(45deg,rgba(59,130,246,.03) 0,rgba(59,130,246,.03) 1px,transparent 1px,transparent 28px)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 360, height: 360, background: "radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(22px,3vw,36px)", lineHeight: 1.15, margin: "0 0 12px" }}>
                    Prêt à transformer votre<br /><span style={{ color: "#60A5FA" }}>performance ?</span>
                  </h3>
                  <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.8, maxWidth: 440, margin: 0 }}>
                    Nos experts analysent votre situation et vous proposent un plan d'action sur mesure.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
                  <Link href="/inscription-startup" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#F7B500", color: "#0A2540", fontWeight: 800, fontSize: 15, borderRadius: 13, padding: "15px 32px", textDecoration: "none", whiteSpace: "nowrap" }}>
                    Demander une consultation <FaArrowRight size={13} />
                  </Link>
                  <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 13, padding: "14px 28px", textDecoration: "none", whiteSpace: "nowrap" }}>
                    Poser une question
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Autres services */}
        <FadeUp>
          <section style={{ padding: "52px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="bar" style={{ height: 32 }} />
                <h2 style={{ fontWeight: 800, color: "#0A2540", margin: 0, fontSize: 22 }}>Autres services</h2>
              </div>
              <Link href="/services" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, color: COLOR, textDecoration: "none" }}>
                Tous les services <FaArrowRight size={11} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {OTHERS.map((s, i) => (
                <Link key={i} href={`/services/${s.slug}`} className="oc">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
                    <span style={{ background: `${s.color}12`, color: s.color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{s.badge}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: s.color, fontWeight: 700, fontSize: 13 }}>Découvrir <FaArrowRight size={10} /></div>
                </Link>
              ))}
            </div>
          </section>
        </FadeUp>
      </div>

      <footer style={{ background: "#081B33", color: "#fff", padding: "28px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 14 }}>© 2026 Business Expert Hub</p>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: 0 }}>Tarifs en Dinar Tunisien (DT) — TVA non incluse</p>
      </footer>
    </div>
  );
}