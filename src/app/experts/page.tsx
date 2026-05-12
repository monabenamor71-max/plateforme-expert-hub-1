"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar, FaArrowRight, FaSearch,
  FaUsers, FaThLarge, FaLock, FaGlobe, FaCheck,
  FaCalendarAlt, FaMapMarkerAlt, FaBriefcase, FaEnvelope,
} from "react-icons/fa";

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    nav_home: "Accueil", nav_about: "À propos", nav_services: "Services",
    nav_experts: "Experts", nav_blog: "Blog", nav_contact: "Contact",
    btn_login: "Connexion", btn_signup: "S'inscrire",
    hero_badge: "Experts certifiés",
    hero_title: "Nos", hero_title_highlight: "Experts",
    hero_desc: "Des experts qualifiés pour répondre à vos besoins dans différents domaines professionnels.",
    filter_placeholder: "Rechercher un expert, une compétence…",
    filter_all: "Tous", filter_results: "expert trouvé",
    filter_results_plural: "experts trouvés",
    filter_no_results: "Aucun expert trouvé",
    filter_no_results_desc: "Essayez un autre terme ou sélectionnez un autre domaine.",
    filter_reset: "Réinitialiser",
    btn_become_expert: "Devenir expert",
    exp_label: "Expérience",
    upcoming_slots: "Prochains créneaux",
    view_profile: "Voir le profil",
    book: "Réserver",
    modal_title: "Inscription requise",
    modal_desc: "Pour consulter ce profil ou réserver un rendez-vous, créez un compte gratuit ou connectez-vous.",
    modal_create: "Créer un compte gratuit",
    modal_login: "J'ai déjà un compte — Connexion",
    cta_title: "Vous êtes expert ?",
    cta_title_highlight: "Rejoignez notre réseau",
    cta_desc: "Intégrez la plateforme BEH et connectez-vous avec des startups qui ont besoin de vos compétences.",
    cta_btn: "Candidater comme expert",
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Plateforme de mise en relation startups & experts",
    loading: "Chargement des experts…",
    error: "Erreur lors du chargement des experts",
  },
  en: {
    nav_home: "Home", nav_about: "About", nav_services: "Services",
    nav_experts: "Experts", nav_blog: "Blog", nav_contact: "Contact",
    btn_login: "Login", btn_signup: "Sign up",
    hero_badge: "Certified experts",
    hero_title: "Our", hero_title_highlight: "Experts",
    hero_desc: "Qualified experts to meet your needs in various professional fields.",
    filter_placeholder: "Search for an expert, skill…",
    filter_all: "All", filter_results: "expert found",
    filter_results_plural: "experts found",
    filter_no_results: "No expert found",
    filter_no_results_desc: "Try another term or select another domain.",
    filter_reset: "Reset",
    btn_become_expert: "Become an expert",
    exp_label: "Experience",
    upcoming_slots: "Upcoming slots",
    view_profile: "View profile",
    book: "Book",
    modal_title: "Registration required",
    modal_desc: "To view this profile or book an appointment, create a free account or log in.",
    modal_create: "Create a free account",
    modal_login: "Already have an account — Log in",
    cta_title: "Are you an expert?",
    cta_title_highlight: "Join our network",
    cta_desc: "Join the BEH platform and connect with startups that need your skills.",
    cta_btn: "Apply as an expert",
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Startup & expert matching platform",
    loading: "Loading experts…",
    error: "Error loading experts",
  },
};

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const LANGS = [{ code: "fr" as Lang, label: "Français", short: "FR" }, { code: "en" as Lang, label: "English", short: "EN" }];
  function select(code: Lang) { setLang(code); setOpen(false); if (typeof window !== "undefined") localStorage.setItem("beh_lang", code); }
  const current = LANGS.find(l => l.code === lang)!;
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", padding: "6px 8px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13.5, fontWeight: 600, color: "#374151", borderRadius: 8, outline: "none" }}>
        <FaGlobe size={15} style={{ color: "#6B7280" }} /><span>{current.short}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(10,37,64,.13)", border: "1px solid #E5E7EB", overflow: "hidden", minWidth: 140, zIndex: 400 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => select(l.code)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: l.code === lang ? "#F9FAFB" : "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13.5, fontWeight: l.code === lang ? 700 : 500, color: l.code === lang ? "#0A2540" : "#6B7280", textAlign: "left" }}>
              <FaGlobe size={13} style={{ color: l.code === lang ? "#F7B500" : "#9CA3AF" }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheck size={7} style={{ color: "#F7B500" }} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s, transform .65s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

const navServices = [
  { label: "Consulting", slug: "consulting" }, { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" }, { label: "Formations", slug: "formations" },
];

const calculerExperience = (anneeDebut: number | null | undefined): string => {
  if (!anneeDebut) return "";
  const ans = new Date().getFullYear() - anneeDebut;
  if (ans < 0) return "";
  return `${ans} ${ans > 1 ? "ans" : "an"}`;
};

const getExperienceText = (ex: any): string => {
  if (ex.annee_debut_experience) { const e = calculerExperience(ex.annee_debut_experience); return e ? `${e} d'expérience` : "Non renseignée"; }
  if (ex.experience) return ex.experience;
  return "Non renseignée";
};

function formatCreneau(d: any, lang: Lang) {
  const date = new Date(d.date);
  const jour = date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
  return `${jour} ${(d.heureDebut || d.heure || "").slice(0, 5)}`;
}

// ── Domain color map ──
const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
};
function getDomainStyle(domain: string) {
  return DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.default;
}

export default function ExpertsPage() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];

  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<string>("tous");
  const [domainsList, setDomainsList] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [dispos, setDispos] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadExperts(); }, []);

  async function loadExperts() {
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:3001/experts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) { setError("Format de données incorrect"); setLoading(false); return; }
      const transformed = data.map((e: any) => ({
        id: e.id,
        initials: ((e.user?.prenom?.[0] || e.prenom?.[0] || "") + (e.user?.nom?.[0] || e.nom?.[0] || "")).toUpperCase(),
        name: `${e.user?.prenom || e.prenom || ""} ${e.user?.nom || e.nom || ""}`.trim(),
        title: e.domaine || "",
        domainLabel: e.domaine || "",
        bio: e.description || "",
        experience: e.experience || "",
        annee_debut_experience: e.annee_debut_experience || null,
        tarif: e.tarif || "",
        localisation: e.localisation || "",
        photo: e.photo || null,
      }));
      setExperts(transformed);
      const uniqueDomains = Array.from(new Set(transformed.map((ex: any) => ex.domainLabel).filter((d: string) => d && d.trim() !== ""))) as string[];
      setDomainsList([...uniqueDomains].sort().map(d => ({ value: d, label: d })));
      const map: Record<number, any[]> = {};
      await Promise.allSettled(transformed.map(async (ex: any) => {
        const r = await fetch(`http://localhost:3001/disponibilites/expert/${ex.id}`).catch(() => null);
        map[ex.id] = r && r.ok ? await r.json() : [];
      }));
      setDispos(map);
    } catch { setError(tr.error); }
    finally { setLoading(false); }
  }

  const filtered = experts.filter(e => {
    const matchDomain = activeDomain === "tous" || e.domainLabel === activeDomain;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.localisation.toLowerCase().includes(q);
    return matchDomain && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151", minHeight: "100vh", background: "#F7F9FC" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes heroZoom { 0% { transform: scale(1.06); } 100% { transform: scale(1); } }
        .hero-bg { animation: heroZoom 2s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes hfi { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .hci { animation: hfi .8s cubic-bezier(.22,1,.36,1) both; }
        .hci-1{animation-delay:.05s;} .hci-2{animation-delay:.18s;} .hci-3{animation-delay:.3s;}
        @keyframes modalIn { from{opacity:0;transform:scale(.93) translateY(18px);} to{opacity:1;transform:scale(1) translateY(0);} }
        .modal-box { animation: modalIn .28s cubic-bezier(.22,1,.36,1); }
        .nav-link { color:#374151; text-decoration:none; font-size:14.5px; font-weight:600; transition:color .18s; }
        .nav-link:hover { color:#F7B500; }
        .nav-link.active { color:#F7B500; }
        .drop-item { display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:13.5px; font-weight:600; transition:background .12s; white-space:nowrap; }
        .drop-item:hover { background:#FFFBEB; }
        .btn-conn { border:1.5px solid #D1D5DB; color:#374151; background:white; padding:8px 20px; border-radius:9px; font-weight:700; font-size:13.5px; cursor:pointer; transition:all .2s; font-family:inherit; }
        .btn-conn:hover { border-color:#0A2540; color:#0A2540; }
        .btn-insc { background:#F7B500; color:#0A2540; border:none; padding:9px 22px; border-radius:9px; font-weight:800; font-size:13.5px; cursor:pointer; transition:all .2s; font-family:inherit; }
        .btn-insc:hover { background:#e6a800; }
        .domain-pill { display:flex; align-items:center; gap:6px; padding:8px 18px; border-radius:99px; font-size:13px; font-weight:700; cursor:pointer; border:1.5px solid #E5E7EB; background:white; color:#6B7280; transition:all .2s; white-space:nowrap; }
        .domain-pill:hover { border-color:#0A2540; color:#0A2540; background:#F9FAFB; }
        .domain-pill.active { background:#0A2540; color:#F7B500; border-color:#0A2540; }
        .search-box { width:100%; background:white; border:1.5px solid #E5E7EB; border-radius:12px; padding:11px 16px 11px 44px; font-size:14px; color:#0A2540; outline:none; transition:border-color .2s, box-shadow .2s; font-family:inherit; }
        .search-box::placeholder { color:#9CA3AF; }
        .search-box:focus { border-color:#F7B500; box-shadow:0 0 0 3px rgba(247,181,0,.1); }

        /* ── EXPERT CARD ── */
        .expert-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #E8EEF6;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
          box-shadow: 0 2px 12px rgba(10,37,64,.06);
          position: relative;
        }
        .expert-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 48px rgba(10,37,64,.13);
          border-color: rgba(247,181,0,.35);
        }
        .expert-card:hover .card-accent { opacity: 1; }

        .card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #F7B500, #e6a800);
          opacity: 0;
          transition: opacity .3s;
        }

        .card-avatar {
          width: 68px; height: 68px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #0A2540, #1a3a6e);
          display: flex; align-items: center; justify-content: center;
          color: #F7B500; font-weight: 900; font-size: 22px;
          flex-shrink: 0;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #F7B500;
        }

        .btn-primary {
          flex: 1; background: #0A2540; color: white; border: none;
          border-radius: 10px; padding: 11px 14px;
          font-family: inherit; font-weight: 700; font-size: 13px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all .2s;
        }
        .btn-primary:hover { background: #F7B500; color: #0A2540; }

        .btn-secondary {
          width: 42px; height: 42px;
          background: #F7F9FC; border: 1.5px solid #E8EEF6;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6B7280;
          transition: all .2s; flex-shrink: 0;
        }
        .btn-secondary:hover { background: #F7B500; color: #0A2540; border-color: #F7B500; }

        .slot-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #F0F9FF; color: #0369A1;
          padding: 3px 9px; border-radius: 6px;
          font-size: 11px; font-weight: 600;
          border: 1px solid #BAE6FD;
        }

        .stat-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; color: #6B7280;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping2 { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(1.9);opacity:0;} }
      `}</style>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(10,37,64,.6)", backdropFilter: "blur(6px)" }} onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 440, padding: "44px 40px", position: "relative", boxShadow: "0 28px 72px rgba(10,37,64,.24)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#0A2540", margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(247,181,0,.3)" }}><FaLock /></div>
            {selectedExpert && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F7F9FC", borderRadius: 12, padding: "12px 14px", marginBottom: 18, border: "1px solid #E8EEF6" }}>
                <div className="card-avatar" style={{ width: 42, height: 42, fontSize: 14 }}>
                  {selectedExpert.photo ? <img src={`http://localhost:3001/uploads/photos/${selectedExpert.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : selectedExpert.initials}
                </div>
                <div><div style={{ fontWeight: 800, color: "#0A2540", fontSize: 14 }}>{selectedExpert.name}</div><div style={{ color: "#9CA3AF", fontSize: 12 }}>{selectedExpert.title}</div></div>
              </div>
            )}
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0A2540", marginBottom: 8, textAlign: "center" }}>{tr.modal_title}</h2>
            <p style={{ color: "#6B7280", fontSize: 13.5, lineHeight: 1.7, marginBottom: 24, textAlign: "center" }}>{tr.modal_desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/inscription-expert" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 11, padding: "13px", fontFamily: "inherit", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>{tr.modal_create}</button>
              </Link>
              <Link href="/connexion" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "transparent", color: "#374151", border: "1.5px solid #E5E7EB", borderRadius: 11, padding: "11px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{tr.modal_login}</button>
              </Link>
            </div>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 22, color: "#D1D5DB", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ background: "white", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #F3F4F6", boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="11" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <span style={{ fontWeight: 900, fontSize: 17, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" className="nav-link">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-link">{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link">{tr.nav_services} ▾</Link>
              {servicesOpen && (
                <ul style={{ position: "absolute", top: "100%", left: 0, background: "white", borderRadius: 12, listStyle: "none", padding: "6px 0", margin: 0, zIndex: 200, minWidth: 190, boxShadow: "0 8px 32px rgba(0,0,0,.10)", border: "1px solid #E5E7EB" }}>
                  {navServices.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link active">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-link">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-link">{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 22, background: "#E5E7EB", margin: "0 2px" }} />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription-expert"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", color: "white", minHeight: 480 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/ex1.jpg" alt="Experts" fill priority className="hero-bg" style={{ objectFit: "cover", objectPosition: "center top" }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(10,37,64,.96) 0%, rgba(10,37,64,.80) 45%, rgba(10,37,64,.45) 100%)" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px 96px", position: "relative", zIndex: 10 }}>
          <div className="hci hci-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontSize: 13, color: "rgba(255,255,255,.45)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none" }}>{tr.nav_home}</Link>
            <span>›</span>
            <span style={{ color: "#F7B500", fontWeight: 600 }}>{tr.nav_experts}</span>
          </div>
          <div style={{ maxWidth: 620 }}>
            <div className="hci hci-2">
              <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", padding: "5px 16px", borderRadius: 99, marginBottom: 18 }}>{tr.hero_badge}</span>
            </div>
            <h1 className="hci hci-3" style={{ fontWeight: 900, margin: "0 0 14px", lineHeight: 1.08, fontSize: "clamp(36px,5vw,60px)" }}>
              {tr.hero_title} <span style={{ color: "#F7B500" }}>{tr.hero_title_highlight}</span>
            </h1>
            <p className="hci hci-3" style={{ fontSize: 16, color: "rgba(255,255,255,.7)", lineHeight: 1.8, margin: 0 }}>{tr.hero_desc}</p>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section style={{ background: "white", position: "sticky", top: 72, zIndex: 50, borderBottom: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(10,37,64,.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 12, pointerEvents: "none" }} />
              <input type="text" placeholder={tr.filter_placeholder} value={search} onChange={e => setSearch(e.target.value)} className="search-box" />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 12 }}>✕</button>}
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button onClick={() => setActiveDomain("tous")} className={`domain-pill${activeDomain === "tous" ? " active" : ""}`}>
                <FaThLarge size={11} /> {tr.filter_all}
              </button>
              {domainsList.map(d => (
                <button key={d.value} onClick={() => setActiveDomain(d.value)} className={`domain-pill${activeDomain === d.value ? " active" : ""}`}>
                  <FaUsers size={11} /> {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GRID ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 24px 64px" }}>

        {/* Results count */}
        <FadeUp>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontWeight: 900, color: "#0A2540", margin: "0 0 4px", fontSize: 22 }}>
                {activeDomain === "tous" ? "Tous les experts" : activeDomain}
              </h2>
              <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>
                {loading ? tr.loading : `${filtered.length} ${filtered.length > 1 ? tr.filter_results_plural : tr.filter_results}`}
              </p>
            </div>
          </div>
        </FadeUp>

        {loading ? (
          <div style={{ textAlign: "center", padding: "88px 0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .75s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>{tr.loading}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "72px 0", color: "#DC2626", fontSize: 15 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontWeight: 900, color: "#0A2540", marginBottom: 8, fontSize: 20 }}>{tr.filter_no_results}</h3>
            <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 22 }}>{tr.filter_no_results_desc}</p>
            <button onClick={() => { setSearch(""); setActiveDomain("tous"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 11, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{tr.filter_reset}</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 22 }}>
            {filtered.map((ex, i) => {
              const ds = getDomainStyle(ex.domainLabel);
              const slots = dispos[ex.id] || [];
              return (
                <FadeUp key={ex.id} delay={Math.min(i * 0.06, 0.4)}>
                  <div className="expert-card">
                    {/* Gold top accent on hover */}
                    <div className="card-accent" />

                    {/* ── Card Header ── */}
                    <div style={{ padding: "22px 22px 16px", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        {/* Avatar */}
                        <div className="card-avatar">
                          {ex.photo
                            ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : ex.initials}
                        </div>
                        {/* Name + domain */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontWeight: 900, color: "#0A2540", fontSize: 16, margin: "0 0 5px", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ex.name}
                          </h3>
                          <span style={{ display: "inline-block", background: ds.bg, color: ds.text, border: `1px solid ${ds.border}`, borderRadius: 99, padding: "3px 11px", fontSize: 11.5, fontWeight: 700 }}>
                            {ex.domainLabel || "Expert"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Card Body ── */}
                    <div style={{ padding: "16px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

                      {/* Stats row */}
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div className="stat-badge">
                          <FaBriefcase size={11} style={{ color: "#F7B500" }} />
                          <span>{getExperienceText(ex)}</span>
                        </div>
                        {ex.localisation && (
                          <div className="stat-badge">
                            <FaMapMarkerAlt size={11} style={{ color: "#F7B500" }} />
                            <span>{ex.localisation}</span>
                          </div>
                        )}
                        {ex.tarif && (
                          <div className="stat-badge">
                            <span style={{ color: "#F7B500", fontWeight: 800 }}>DT</span>
                            <span>{ex.tarif}</span>
                          </div>
                        )}
                      </div>

                      {/* Separator */}
                      <div style={{ height: 1, background: "#F3F4F6" }} />

                      {/* Bio */}
                      {ex.bio && (
                        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {ex.bio}
                        </p>
                      )}

                      {/* Slots */}
                      {slots.length > 0 && (
                        <div>
                          <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 7 }}>
                            {tr.upcoming_slots}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {slots.slice(0, 3).map((d, idx) => (
                              <span key={idx} className="slot-chip">
                                <FaCalendarAlt size={9} />{formatCreneau(d, lang)}
                              </span>
                            ))}
                            {slots.length > 3 && <span style={{ fontSize: 11, color: "#9CA3AF", alignSelf: "center" }}>+{slots.length - 3}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Card Footer (CTA) ── */}
                    <div style={{ padding: "14px 22px 20px", display: "flex", gap: 8 }}>
                      <button
                        className="btn-primary"
                        onClick={() => { setSelectedExpert(ex); setShowModal(true); }}
                      >
                        {tr.view_profile} <FaArrowRight size={11} />
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => { setSelectedExpert(ex); setShowModal(true); }}
                        title={tr.book}
                      >
                        <FaCalendarAlt size={13} />
                      </button>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        )}

        {/* ── BECOME EXPERT CTA (below cards) ── */}
        {!loading && filtered.length > 0 && (
          <FadeUp delay={0.15}>
            <div style={{ marginTop: 56, textAlign: "center" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16, background: "white", borderRadius: 24, border: "1px solid #E8EEF6", padding: "36px 48px", boxShadow: "0 4px 24px rgba(10,37,64,.08)" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(247,181,0,.3)" }}>
                  <FaUsers size={22} style={{ color: "#0A2540" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, color: "#0A2540", fontSize: 20, margin: "0 0 6px" }}>
                    {tr.cta_title} <span style={{ color: "#F7B500" }}>{tr.cta_title_highlight}</span>
                  </h3>
                  <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0, maxWidth: 400, lineHeight: 1.6 }}>{tr.cta_desc}</p>
                </div>
                <Link href="/inscription-expert">
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2540", color: "white", border: "none", borderRadius: 12, padding: "13px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", boxShadow: "0 4px 16px rgba(10,37,64,.2)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F7B500"; (e.currentTarget as HTMLButtonElement).style.color = "#0A2540"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0A2540"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}>
                    {tr.cta_btn} <FaArrowRight size={13} />
                  </button>
                </Link>
              </div>
            </div>
          </FadeUp>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0A2540", color: "white", padding: "28px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{tr.footer_copy}</p>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>{tr.footer_tagline}</p>
      </footer>
    </div>
  );
}