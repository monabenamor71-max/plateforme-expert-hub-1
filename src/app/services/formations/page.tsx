"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaGraduationCap, FaMapMarkerAlt, FaUsers, FaClock,
  FaCertificate, FaArrowRight, FaSearch, FaFilter,
  FaLaptop, FaBuilding, FaTimes, FaCheckCircle, FaLock,
  FaMicrophone, FaPlay, FaCalendarAlt, FaGlobe, FaChevronDown, FaCheck,
  FaEnvelope, FaPhone, FaUser, FaBriefcase, FaInfoCircle,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    nav_home: "Accueil",
    nav_about: "À propos",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Connexion",
    btn_signup: "S'inscrire",
    hero_badge: "Apprentissage continu",
    hero_title: "Formations &",
    hero_title_highlight: "Podcasts",
    hero_desc: "Des formations certifiantes et des podcasts exclusifs animés par nos experts. Accédez à toutes les ressources après inscription gratuite.",
    hero_stat_formations: "formations",
    hero_stat_podcasts: "podcasts",
    hero_btn_signup: "S'inscrire",
    tab_formations: "Formations",
    tab_podcasts: "Podcasts",
    filter_placeholder: "Rechercher une formation, un formateur...",
    filter_domaine: "Domaine",
    filter_results: "formation trouvée",
    filter_results_plural: "formations trouvées",
    filter_no_results: "Aucune formation trouvée",
    filter_no_results_desc: "Essayez de modifier vos filtres de recherche",
    podcast_placeholder: "Rechercher un podcast, un expert...",
    podcast_no_results: "Aucun podcast trouvé",
    card_certifiante: "CERTIFIANTE",
    card_en_savoir_plus: "En savoir plus",
    card_acceder: "Accéder",
    card_sinscrire: "S'inscrire",
    card_voir: "Voir",
    card_places_restantes: "place restante",
    card_places_restantes_plural: "places restantes",
    card_complet: "Complet",
    podcast_label: "Podcast",
    podcast_ecouter: "Écouter",
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Formations certifiantes et podcasts exclusifs",
    gratuit: "Gratuit",
    payant: "Payant",
    presentiel: "Présentiel",
    en_ligne: "En ligne",
    loading: "Chargement des formations...",
    // Modal inscription
    modal_title: "Inscription requise",
    modal_desc: "Pour accéder à ce contenu, vous devez créer un compte gratuitement.",
    modal_btn_register: "Créer un compte",
    modal_btn_login: "Se connecter",
    modal_already: "Déjà inscrit ?",
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_signup: "Sign up",
    hero_badge: "Continuous learning",
    hero_title: "Trainings &",
    hero_title_highlight: "Podcasts",
    hero_desc: "Certified training courses and exclusive podcasts hosted by our experts. Access all resources after free registration.",
    hero_stat_formations: "trainings",
    hero_stat_podcasts: "podcasts",
    hero_btn_signup: "Sign up",
    tab_formations: "Trainings",
    tab_podcasts: "Podcasts",
    filter_placeholder: "Search for a training, instructor...",
    filter_domaine: "Domain",
    filter_results: "training found",
    filter_results_plural: "trainings found",
    filter_no_results: "No training found",
    filter_no_results_desc: "Try modifying your search filters",
    podcast_placeholder: "Search for a podcast, expert...",
    podcast_no_results: "No podcast found",
    card_certifiante: "CERTIFIED",
    card_en_savoir_plus: "Learn more",
    card_acceder: "Access",
    card_sinscrire: "Sign up",
    card_voir: "View",
    card_places_restantes: "place left",
    card_places_restantes_plural: "places left",
    card_complet: "Full",
    podcast_label: "Podcast",
    podcast_ecouter: "Listen",
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Certified trainings & exclusive podcasts",
    gratuit: "Free",
    payant: "Paid",
    presentiel: "In-person",
    en_ligne: "Online",
    loading: "Loading trainings...",
    modal_title: "Registration required",
    modal_desc: "To access this content, you need to create a free account.",
    modal_btn_register: "Create an account",
    modal_btn_login: "Login",
    modal_already: "Already have an account?",
  },
};

// LangSwitcher
function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const LANGS = [
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
  ];

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem("beh_lang", code);
  }

  const current = LANGS.find(l => l.code === lang)!;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent",
          border: "none",
          padding: "6px 8px",
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600,
          color: "#374151",
          borderRadius: 8,
          transition: "color .18s, background .18s",
          outline: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#0A2540"; e.currentTarget.style.background = "#F3F4F6"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; } }}
      >
        <FaGlobe size={15} style={{ color: "#6B7280", flexShrink: 0 }} />
        <span style={{ letterSpacing: ".3px" }}>{current.short}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(10,37,64,.13)",
          border: "1px solid #E5E7EB",
          overflow: "hidden", minWidth: 140, zIndex: 400,
          animation: "langDrop .15s cubic-bezier(.22,1,.36,1)",
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: l.code === lang ? "#F9FAFB" : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13.5,
                fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? "#0A2540" : "#6B7280",
                transition: "background .12s, color .12s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (l.code !== lang) { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; } }}
              onMouseLeave={e => { if (l.code !== lang) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; } }}
            >
              <FaGlobe size={13} style={{ color: l.code === lang ? "#F7B500" : "#9CA3AF", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCheck size={7} style={{ color: "#F7B500" }} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Modal d'inscription
function InscriptionModal({ isOpen, onClose, itemTitle, itemType, lang }: { 
  isOpen: boolean; 
  onClose: () => void; 
  itemTitle: string; 
  itemType: "formation" | "podcast";
  lang: Lang;
}) {
  const router = useRouter();
  const tr = T[lang];

  if (!isOpen) return null;

  return (
    <div 
      className="modal-bg" 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,37,64,.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(8px)",
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(10,37,64,.35)",
          animation: "fadeInUp .3s ease",
        }}
      >
        <div style={{
          background: "linear-gradient(135deg,#0A2540,#1a3a6e)",
          padding: "28px 28px 24px",
          textAlign: "center",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,.15)",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes size={14} />
          </button>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(247,181,0,.15)",
            border: "2px solid rgba(247,181,0,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            {itemType === "formation" ? (
              <FaGraduationCap size={28} style={{ color: "#F7B500" }} />
            ) : (
              <FaMicrophone size={28} style={{ color: "#F7B500" }} />
            )}
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 8 }}>
            {tr.modal_title}
          </h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.6 }}>
            {tr.modal_desc}
          </p>
          <div style={{
            marginTop: 12,
            background: "rgba(247,181,0,.1)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            color: "#F7B500",
            fontWeight: 600,
          }}>
            {itemType === "formation" ? "🎓" : "🎙️"} {itemTitle}
          </div>
        </div>

        <div style={{ padding: "28px 28px 32px", textAlign: "center" }}>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#F7B500,#e6a800)",
              color: "#0A2540",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <FaUser size={14} /> {tr.modal_btn_register}
          </button>
          
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
            {tr.modal_already} <span style={{ color: "#3B82F6", cursor: "pointer", fontWeight: 600 }} onClick={() => router.push("/connexion")}>{tr.btn_login}</span>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1.5px solid #E2E8F0",
              borderRadius: 10,
              padding: "10px 20px",
              color: "#475569",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
            }}
          >
            {tr.card_en_savoir_plus}
          </button>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

const MODE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  presentiel: { label: "Présentiel", icon: <FaBuilding />, color: "#3B82F6" },
  en_ligne:   { label: "En ligne",   icon: <FaLaptop />,   color: "#22C55E" },
};

function useInView(thr = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
  }, []);
  return [ref, v] as const;
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(22px)", transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s, transform .65s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

export default function FormationsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];

  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"formations" | "podcasts">("formations");
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [podSearch, setPodSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ title: string; type: "formation" | "podcast" } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
    loadFormations();
    loadPodcasts();
  }, []);

  async function loadFormations() {
    try {
      const res = await fetch(`${BASE}/formations/public`);
      if (res.ok) {
        const data = await res.json();
        setFormations(Array.isArray(data) ? data : []);
      } else setFormations([]);
    } catch (error) {
      console.error("Erreur chargement formations", error);
      setFormations([]);
    }
    setLoading(false);
  }

  async function loadPodcasts() {
    try {
      const res = await fetch(`${BASE}/podcasts/public`);
      if (res.ok) {
        const data = await res.json();
        setPodcasts(Array.isArray(data) ? data : []);
      } else setPodcasts([]);
    } catch (error) {
      console.error("Erreur chargement podcasts", error);
      setPodcasts([]);
    }
  }

  // Fonction pour gérer le clic sur "Voir" / "Accéder"
  function handleAccess(item: any, type: "formation" | "podcast") {
    if (isLoggedIn) {
      // Connecté → rediriger vers le contenu
      if (type === "formation") {
        router.push(`/formation-detail?id=${item.id}`);
      } else {
        router.push(`/podcast-detail?id=${item.id}`);
      }
    } else {
      // Non connecté → ouvrir modal d'inscription
      setSelectedItem({ title: item.titre, type });
      setModalOpen(true);
    }
  }

  const filteredFormations = formations.filter(f => {
    const matchDomaine = domaineFilter === "Tous" || f.domaine === domaineFilter;
    const matchSearch = !searchQuery || f.titre?.toLowerCase().includes(searchQuery.toLowerCase()) || f.description?.toLowerCase().includes(searchQuery.toLowerCase()) || f.formateur?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDomaine && matchSearch;
  });

  const formationsByDomaine: Record<string, any[]> = {};
  if (domaineFilter === "Tous") {
    filteredFormations.forEach(f => {
      const d = f.domaine || "Autres";
      if (!formationsByDomaine[d]) formationsByDomaine[d] = [];
      formationsByDomaine[d].push(f);
    });
  }

  const domainesDisponibles = ["Tous", ...Array.from(new Set(formations.map(f => f.domaine || "Autres"))).filter(Boolean).sort()];
  const podcastDomaines = ["Tous", ...Array.from(new Set(podcasts.map(p => p.domaine || "Autres"))).filter(Boolean).sort()];
  const filteredPodcasts = podcasts.filter(p => {
    const matchDomaine = domaineFilter === "Tous" || p.domaine === domaineFilter;
    const matchSearch = !podSearch || p.titre?.toLowerCase().includes(podSearch.toLowerCase()) || p.description?.toLowerCase().includes(podSearch.toLowerCase());
    return matchDomaine && matchSearch;
  });

  function getPrixLabel(prix: any) {
    if (!prix || prix === 0 || prix === "0") return tr.gratuit;
    return tr.payant;
  }

  function placesRestantes(f: any) {
    if (!f.places_limitees) return null;
    return f.places_disponibles ?? 0;
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const FormationCard = ({ f }: { f: any }) => {
    const places = placesRestantes(f);
    const modeInfo = MODE_LABELS[f.mode] || { label: f.mode || "En ligne", icon: <FaLaptop />, color: "#22C55E" };
    const prixLabel = getPrixLabel(f.prix);
    const placesText = places !== null
      ? (places > 0 ? `${places} ${places > 1 ? tr.card_places_restantes_plural : tr.card_places_restantes}` : tr.card_complet)
      : "";

    const handleLearnMore = () => router.push(`/formation-detail?id=${f.id}`);

    return (
      <div className="formation-card">
        <div style={{ height: 140, position: "relative", background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden" }}>
          {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .6 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.85),rgba(10,37,64,.2))" }} />
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {f.certifiante && (
              <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <FaCertificate style={{ fontSize: 9 }} />{tr.card_certifiante}
              </span>
            )}
          </div>
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", borderRadius: 99, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: modeInfo.color, fontSize: 10 }}>{modeInfo.icon}</span>
            {modeInfo.label === "Présentiel" ? tr.presentiel : tr.en_ligne}
          </div>
          <div style={{ position: "absolute", bottom: 12, right: 12 }}>
            <span style={{ background: f.prix ? "rgba(10,37,64,.85)" : "rgba(34,197,94,.85)", backdropFilter: "blur(4px)", color: f.prix ? "#F7B500" : "#fff", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 900 }}>
              {prixLabel}
            </span>
          </div>
        </div>
        <div style={{ padding: "18px 18px 16px" }}>
          {f.domaine && <div style={{ fontSize: 11, fontWeight: 700, color: "#F7B500", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>{f.domaine}</div>}
          <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 15.5, lineHeight: 1.35, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.titre}</h3>
          {f.description && (
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.description}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, fontSize: 12, color: "#64748B" }}>
            {f.formateur && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaUsers style={{ color: "#94A3B8", fontSize: 11 }} />{f.formateur}</span>}
            {f.duree && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaClock style={{ color: "#94A3B8", fontSize: 11 }} />{f.duree}</span>}
            {f.localisation && f.mode !== "en_ligne" && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaMapMarkerAlt style={{ color: "#94A3B8", fontSize: 11 }} />{f.localisation}</span>}
          </div>

          {(f.dateDebut || f.dateFin) && (
            <div style={{ marginBottom: 12, fontSize: 11, color: "#1D4ED8", background: "#EFF6FF", padding: "6px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <FaCalendarAlt style={{ fontSize: 10 }} />
              {f.dateDebut && <span>Début : {formatDate(f.dateDebut)}</span>}
              {f.dateDebut && f.dateFin && <span>•</span>}
              {f.dateFin && <span>Fin : {formatDate(f.dateFin)}</span>}
            </div>
          )}

          {places !== null && (
            <div style={{ marginBottom: 12 }}>
              <span className="badge-places" style={{ background: places > 5 ? "#ECFDF5" : places > 0 ? "#FFF8E1" : "#FEF2F2", color: places > 5 ? "#059669" : places > 0 ? "#B45309" : "#DC2626", border: `1px solid ${places > 5 ? "#A7F3D0" : places > 0 ? "#F7B500" : "#FECACA"}` }}>
                <FaUsers style={{ fontSize: 10 }} />
                {placesText}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); handleLearnMore(); }} style={{ flex: 1, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {tr.card_en_savoir_plus}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleAccess(f, "formation"); }} style={{ flex: 1, background: isLoggedIn ? "linear-gradient(135deg,#0A2540,#1a3a6e)" : "#F7B500", color: isLoggedIn ? "#fff" : "#0A2540", border: "none", borderRadius: 10, padding: "10px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {isLoggedIn ? tr.card_acceder : tr.card_voir}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PodcastCard = ({ p }: { p: any }) => {
    return (
      <div className="podcast-card">
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{ width: 160, flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .7 }} /> : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(139,92,246,.35)", border: "2px solid rgba(139,92,246,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone style={{ color: "#C4B5FD", fontSize: 24 }} /></div>}
          </div>
          <div style={{ flex: 1, padding: "18px 18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ background: "#F3F0FF", color: "#7C3AED", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>🎙️ {tr.podcast_label}</span>
              {p.domaine && <span style={{ background: "#F8FAFC", color: "#64748B", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{p.domaine}</span>}
            </div>
            <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 16, lineHeight: 1.3, marginBottom: 6 }}>{p.titre}</h3>
            {p.description && <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#8A9AB5" }}>{p.auteur && <span><FaUsers style={{ fontSize: 10, marginRight: 3 }} />{p.auteur}</span>}</div>
              <button onClick={(e) => { e.stopPropagation(); handleAccess(p, "podcast"); }} style={{ background: isLoggedIn ? "#8B5CF6" : "#F7B500", color: isLoggedIn ? "#fff" : "#0A2540", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
                {isLoggedIn ? <><FaPlay style={{ fontSize: 11 }} />{tr.podcast_ecouter}</> : <><FaLock style={{ fontSize: 11 }} />{tr.card_voir}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu principal
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#374151", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes heroTextIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroImgIn{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}
        @keyframes floatImg{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-18px) rotate(-2deg)}}
        @keyframes pulseRing{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.08;transform:scale(1.12)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-text-1{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .1s both}
        .hero-text-2{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .25s both}
        .hero-text-3{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .4s both}
        .hero-text-4{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .55s both}
        .hero-img-wrap{animation:heroImgIn 1s cubic-bezier(.22,1,.36,1) .2s both}
        .hero-img-float{animation:floatImg 7s ease-in-out 1.2s infinite}
        .pulse-ring{animation:pulseRing 4s ease-in-out infinite}
        .diamond-float{animation:floatY 7s ease-in-out infinite}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}
        .formation-card,.podcast-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:20px;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer;}
        .formation-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(10,37,64,.13);border-color:rgba(247,181,0,.4);}
        .podcast-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(139,92,246,.13);border-color:rgba(139,92,246,.4);}
        .pill{border:1.5px solid #E2E8F0;border-radius:99px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;background:#fff;color:#64748B;transition:all .22s;font-family:inherit;white-space:nowrap;}
        .pill:hover{border-color:#F7B500;color:#B45309;background:#FFFBEB;}
        .pill.active{background:#F7B500;color:#0A2540;border-color:#F7B500;font-weight:700;}
        .badge-places{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .main-tab{background:none;border:none;cursor:pointer;font-family:inherit;font-size:17px;font-weight:700;color:#94A3B8;padding:14px 0;border-bottom:3px solid transparent;transition:all .22s;margin-right:32px;}
        .main-tab.on{color:#0A2540;border-bottom-color:#F7B500;}
      `}</style>

      {/* MODAL D'INSCRIPTION */}
      {selectedItem && (
        <InscriptionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedItem(null);
          }}
          itemTitle={selectedItem.title}
          itemType={selectedItem.type}
          lang={lang}
        />
      )}

      {/* HEADER */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540" />
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</div>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" style={{ color: "#0A2540", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{tr.nav_home}</Link>
            <Link href="/a-propos" style={{ color: "#0A2540", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}>
              <span style={{ color: "#F7B500", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{tr.nav_services} ▾</span>
              {navOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "8px 0", zIndex: 200, minWidth: 210, boxShadow: "0 8px 30px rgba(0,0,0,.12)", animation: "fadeSlideDown .2s ease" }}>
                  {NAV.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" style={{ color: "#0A2540", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{tr.nav_experts}</Link>
            <Link href="/blog" style={{ color: "#0A2540", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{tr.nav_blog}</Link>
            <Link href="/contact" style={{ color: "#0A2540", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 4px" }} />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#0A2540 0%,#0f3060 60%,#0A2540 100%)", padding: "72px 24px 80px", position: "relative", overflow: "hidden", color: "#fff" }}>
        {[{ w: 380, r: -60, d: "0s" }, { w: 220, r: 120, d: "1.8s" }].map((d, i) => (
          <div key={i} className="diamond-float" style={{ position: "absolute", width: d.w, height: d.w, right: d.r, top: "50%", transform: "translateY(-50%) rotate(45deg)", background: "rgba(247,181,0,.05)", border: "1px solid rgba(247,181,0,.1)", pointerEvents: "none", animationDelay: d.d }} />
        ))}

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "rgba(255,255,255,.5)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>{tr.nav_home}</Link><span>›</span>
            <Link href="/services" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>{tr.nav_services}</Link><span>›</span>
            <span style={{ color: "#F7B500", fontWeight: 600 }}>{tr.tab_formations} & {tr.tab_podcasts}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div className="hero-text-1" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(247,181,0,.12)", border: "1px solid rgba(247,181,0,.3)", borderRadius: 99, padding: "7px 18px", marginBottom: 24 }}>
                <FaGraduationCap style={{ color: "#F7B500", fontSize: 14 }} />
                <span style={{ color: "#F7B500", fontWeight: 700, fontSize: 12, letterSpacing: "2px", textTransform: "uppercase" }}>{tr.hero_badge}</span>
              </div>
              <h1 className="hero-text-2" style={{ fontWeight: 900, fontSize: "clamp(32px,4vw,56px)", margin: "0 0 18px", lineHeight: 1.08, color: "#fff" }}>
                {tr.hero_title}<br /><span style={{ color: "#F7B500" }}>{tr.hero_title_highlight}</span>
              </h1>
              <p className="hero-text-3" style={{ fontSize: 16, color: "rgba(255,255,255,.72)", lineHeight: 1.85, maxWidth: 480, marginBottom: 32 }}>
                {tr.hero_desc}
              </p>
              <div className="hero-text-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 99, padding: "9px 18px" }}>
                  <FaCheckCircle style={{ color: "#4ADE80", fontSize: 13 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 600 }}>{formations.length} {tr.hero_stat_formations}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 99, padding: "9px 18px" }}>
                  <FaMicrophone style={{ color: "#A78BFA", fontSize: 13 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 600 }}>{podcasts.length} {tr.hero_stat_podcasts}</span>
                </div>
                {!isLoggedIn && (
                  <Link href="/inscription" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", padding: "11px 24px", borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                    <FaLock style={{ fontSize: 12 }} /> {tr.hero_btn_signup}
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-img-wrap" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <div className="pulse-ring" style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "2px solid rgba(247,181,0,.35)", pointerEvents: "none" }} />
              <div className="pulse-ring" style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(247,181,0,.15)", pointerEvents: "none", animationDelay: "1.5s" }} />
              <div className="hero-img-float" style={{ position: "relative", zIndex: 2 }}>
                <div style={{ width: 300, height: 300, borderRadius: 32, overflow: "hidden", border: "3px solid rgba(247,181,0,.35)", boxShadow: "0 32px 80px rgba(0,0,0,.45)" }}>
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                    <rect width="300" height="300" fill="#0D1F36" />
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0L0 0 0 30" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1" /></pattern>
                    <rect width="300" height="300" fill="url(#grid)" />
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#F7B500" stopOpacity="0.18" /><stop offset="100%" stopColor="#F7B500" stopOpacity="0" /></radialGradient>
                    <rect width="300" height="300" fill="url(#glow)" />
                    <rect x="72" y="145" width="156" height="100" rx="10" fill="#1a3a6e" /><rect x="72" y="145" width="156" height="6" rx="3" fill="#F7B500" opacity="0.7" /><rect x="78" y="155" width="70" height="82" rx="4" fill="#152d54" />
                    {[0,1,2,3,4].map(i=><rect key={i} x="86" y={168+i*12} width={50} height="3" rx="1.5" fill="rgba(255,255,255,.18)" />)}
                    <rect x="152" y="155" width="70" height="82" rx="4" fill="#1e4080" />
                    {[0,1,2,3].map(i=><rect key={i} x="160" y={168+i*12} width={55} height="3" rx="1.5" fill="rgba(255,255,255,.22)" />)}
                    <rect x="160" y="216" width="42" height="3" rx="1.5" fill="#F7B500" opacity="0.6" /><rect x="147" y="151" width="6" height="86" rx="3" fill="#0A2540" />
                    <polygon points="150,68 196,88 150,108 104,88" fill="#F7B500" opacity="0.95" /><rect x="188" y="88" width="4" height="32" rx="2" fill="#F7B500" opacity="0.8" />
                    <circle cx="192" cy="122" r="6" fill="#F7B500" opacity="0.8" /><rect x="142" y="60" width="16" height="28" rx="4" fill="#F7B500" opacity="0.75" /><rect x="147" y="56" width="6" height="14" rx="3" fill="#F7B500" />
                    <circle cx="62" cy="110" r="5" fill="#F7B500" opacity="0.6" /><circle cx="62" cy="110" r="2.5" fill="#F7B500" /><circle cx="238" cy="130" r="4" fill="#A78BFA" opacity="0.7" /><circle cx="238" cy="130" r="2" fill="#A78BFA" />
                    <circle cx="90" cy="180" r="3" fill="#4ADE80" opacity="0.5" />
                    <rect x="200" y="168" width="52" height="40" rx="8" fill="#1e3a5f" stroke="rgba(247,181,0,.4)" strokeWidth="1.5" /><circle cx="226" cy="181" r="8" fill="none" stroke="#F7B500" strokeWidth="1.5" opacity="0.8" />
                    <path d="M222 181 L225 184 L230 178" stroke="#F7B500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                    <rect x="208" y="194" width="36" height="3" rx="1.5" fill="rgba(255,255,255,.2)" /><rect x="214" y="200" width="24" height="3" rx="1.5" fill="rgba(255,255,255,.12)" />
                    <circle cx="56" cy="168" r="3" fill="#4ADE80" opacity="0.8" /><path d="M48 162 Q56 156 64 162" stroke="#4ADE80" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" /><path d="M44 157 Q56 148 68 157" stroke="#4ADE80" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />
                    <rect x="88" y="258" width="124" height="22" rx="11" fill="rgba(247,181,0,.15)" stroke="rgba(247,181,0,.3)" strokeWidth="1" /><text x="150" y="273" textAnchor="middle" fill="#F7B500" fontSize="10" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2">CERTIFIÉ BEH</text>
                  </svg>
                </div>
                <div style={{ position: "absolute", top: -18, left: -24, background: "rgba(10,37,64,.9)", border: "1px solid rgba(247,181,0,.4)", borderRadius: 14, padding: "10px 14px", backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 600, marginBottom: 2 }}>Taux de satisfaction</div><div style={{ fontSize: 18, fontWeight: 900, color: "#F7B500", lineHeight: 1 }}>94%</div>
                </div>
                <div style={{ position: "absolute", bottom: -16, right: -20, background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.4)", borderRadius: 14, padding: "10px 14px", backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FaMicrophone style={{ color: "#A78BFA", fontSize: 13 }} /><div><div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>Podcasts exclusifs</div><div style={{ fontSize: 15, fontWeight: 800, color: "#C4B5FD", lineHeight: 1.2 }}>{podcasts.length > 0 ? podcasts.length : "+"} épisodes</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ borderBottom: "2px solid #F1F5F9", marginBottom: 32, marginTop: 32, display: "flex" }}>
          <button className={`main-tab${activeTab === "formations" ? " on" : ""}`} onClick={() => setActiveTab("formations")}>
            <FaGraduationCap style={{ marginRight: 8, fontSize: 15 }} />{tr.tab_formations}
            {formations.length > 0 && <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800, marginLeft: 8 }}>{formations.length}</span>}
          </button>
          <button className={`main-tab${activeTab === "podcasts" ? " on" : ""}`} onClick={() => setActiveTab("podcasts")}>
            <FaMicrophone style={{ marginRight: 8, fontSize: 15 }} />{tr.tab_podcasts}
            {podcasts.length > 0 && <span style={{ background: "#8B5CF6", color: "#fff", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800, marginLeft: 8 }}>{podcasts.length}</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px" }}>
        {activeTab === "formations" && (
          <>
            <FadeUp>
              <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 18, padding: "20px 22px", marginBottom: 28 }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} />
                  <input placeholder={tr.filter_placeholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: "1.5px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#fff", outline: "none" }} onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#F7B500"} onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E2E8F0"} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}><FaFilter style={{ marginRight: 5, fontSize: 10 }} />{tr.filter_domaine}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{domainesDisponibles.map(d => <button key={d} className={`pill${domaineFilter === d ? " active" : ""}`} onClick={() => setDomaineFilter(d)}>{d}</button>)}</div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: "#64748B" }}><strong style={{ color: "#0A2540" }}>{filteredFormations.length}</strong> {filteredFormations.length === 1 ? tr.filter_results : tr.filter_results_plural}</div>
              </div>
            </FadeUp>

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}><div style={{ width: 44, height: 44, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: "#64748B", fontSize: 14 }}>{tr.loading}</div></div>
            ) : filteredFormations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}><div style={{ fontSize: 52, marginBottom: 16 }}>🎓</div><div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>{tr.filter_no_results}</div><div style={{ color: "#64748B", fontSize: 14 }}>{tr.filter_no_results_desc}</div></div>
            ) : domaineFilter === "Tous" ? (
              Object.entries(formationsByDomaine).map(([domaine, fList]) => (
                <div key={domaine} style={{ marginBottom: 48 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, borderBottom: "2px solid #F1F5F9", paddingBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#0A2540" }}><FaGraduationCap /></div>
                    <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", margin: 0 }}>{domaine}</h2><span style={{ background: "#E8EEF6", borderRadius: 99, padding: "2px 8px", fontSize: 12, color: "#64748B" }}>{fList.length}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>{fList.map(f => <FormationCard key={f.id} f={f} />)}</div>
                </div>
              ))
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>{filteredFormations.map(f => <FormationCard key={f.id} f={f} />)}</div>
            )}
          </>
        )}

        {activeTab === "podcasts" && (
          <>
            <FadeUp>
              <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 18, padding: "20px 22px", marginBottom: 28 }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} />
                  <input placeholder={tr.podcast_placeholder} value={podSearch} onChange={e => setPodSearch(e.target.value)} style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: "1.5px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#fff", outline: "none" }} onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#8B5CF6"} onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E2E8F0"} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}><FaFilter style={{ marginRight: 5, fontSize: 10 }} />{tr.filter_domaine}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{podcastDomaines.map(d => <button key={d} className={`pill${domaineFilter === d ? " active" : ""}`} onClick={() => setDomaineFilter(d)}>{d}</button>)}</div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: "#64748B" }}><strong style={{ color: "#0A2540" }}>{filteredPodcasts.length}</strong> {filteredPodcasts.length === 1 ? tr.filter_results : tr.filter_results_plural}</div>
              </div>
            </FadeUp>
            {filteredPodcasts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}><div style={{ fontSize: 52, marginBottom: 16 }}>🎙️</div><div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>{tr.podcast_no_results}</div><div style={{ color: "#64748B", fontSize: 14 }}>{tr.filter_no_results_desc}</div></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22 }}>{filteredPodcasts.map(p => <PodcastCard key={p.id} p={p} />)}</div>
            )}
          </>
        )}
      </div>

      <footer style={{ background: "#081B33", color: "#fff", padding: "28px 24px", textAlign: "center", marginTop: 64 }}>
        <p style={{ margin: "0 0 4px", fontSize: 14 }}>{tr.footer_copy}</p>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: 0 }}>{tr.footer_tagline}</p>
      </footer>
    </div>
  );
}