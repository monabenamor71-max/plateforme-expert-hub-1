"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import {
  FaBullseye, FaRocket, FaHandsHelping, FaStar, FaArrowRight,
  FaUsers, FaAward, FaChartLine, FaGlobe, FaCheck, FaQuoteLeft,
  FaLinkedin, FaTwitter, FaEnvelope, FaChevronDown,
  FaPlay, FaMicrophone, FaVideo, FaTimes, FaExpand,
  FaVolumeUp, FaExternalLinkAlt, FaYoutube,
  FaFacebookF, FaInstagram, FaLinkedinIn,
  FaMapMarkerAlt, FaPhone,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

type Lang = "fr" | "en";

interface VideoMedia {
  id: number;
  titre: string;
  description?: string;
  url: string;
  type: "youtube" | "vimeo" | "upload" | "external";
  miniature?: string;
  duree?: string;
  emission?: string;
  date_publication?: string;
  categorie?: string;
  statut: string;
  featured?: boolean;
  createdAt: string;
}

const T: Record<Lang, Record<string, string>> = {
  fr: {
    nav_home: "Accueil", nav_about: "À propos", nav_services: "Services",
    nav_experts: "Experts", nav_blog: "Blog", nav_contact: "Contact",
    btn_login: "Connexion", btn_signup: "S'inscrire",
    hero_badge: "Notre histoire & ADN",
    hero_title: "Qui est",
    hero_title_highlight: "Business Expert Hub",
    hero_desc: "Depuis 2019, nous connectons les startups les plus ambitieuses aux meilleurs experts pour transformer leurs visions en succès mesurables.",
    hero_cta_vision: "Notre Vision",
    hero_cta_mission: "Notre Mission",
    hero_cta_valeurs: "Nos Valeurs",
    stat_creation: "Année de création",
    stat_experts: "Experts certifiés",
    stat_startups: "Startups accompagnées",
    vision_badge: "Vision",
    vision_title: "Devenir la",
    vision_title_highlight: "référence",
    vision_title_end: "en accompagnement de startups",
    vision_desc: "Notre vision est de créer un écosystème où chaque startup innovante a accès aux mêmes ressources humaines d'exception que les grandes entreprises.",
    vision_point1: "Accès universel à l'expertise de haut niveau",
    vision_point2: "Réseau pan-africain et européen d'ici 2027",
    vision_point3: "Technologie au service de la mise en relation",
    vision_point4: "1 000 startups accompagnées à l'horizon 2027",
    citation: "Nous ne faisons pas que connecter des experts et des startups. Nous créons les success stories de demain.",
    citation_auteur: "Ahmed Benslimane",
    citation_role: "CEO & Co-fondateur",
    mission_badge: "Mission",
    mission_title: "Offrir un accès",
    mission_title_highlight: "privilégié",
    mission_title_end: "à l'expertise",
    mission_desc: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds.",
    mission_card1_title: "Structurer",
    mission_card1_desc: "Nous aidons les startups à poser des bases solides : stratégie, business model, organisation interne et processus scalables.",
    mission_card1_item1: "Diagnostic stratégique complet",
    mission_card1_item2: "Business model canvas",
    mission_card1_item3: "Organisation & gouvernance",
    mission_card2_title: "Accélérer",
    mission_card2_desc: "Grâce à nos experts marketing, tech et commercial, nous boostons votre croissance avec des méthodes éprouvées.",
    mission_card2_item1: "Growth hacking & acquisition",
    mission_card2_item2: "Optimisation produit & UX",
    mission_card2_item3: "Scalabilité commerciale",
    mission_card3_title: "Financer",
    mission_card3_desc: "Nous connectons les startups à notre réseau de VCs, family offices et fonds pour faciliter les levées.",
    mission_card3_item1: "Préparation pitch & deck",
    mission_card3_item2: "Accès réseau investisseurs",
    mission_card3_item3: "Accompagnement due diligence",
    timeline_badge: "Notre parcours",
    timeline_title: "Notre histoire &",
    timeline_title_highlight: "succès",
    timeline1_title: "Fondation", timeline1_desc: "Création de Business Expert Hub par une équipe de consultants passionnés.",
    timeline2_title: "Premiers succès", timeline2_desc: "Accompagnement de nos 20 premières startups.",
    timeline3_title: "Expansion digitale", timeline3_desc: "Lancement de la plateforme digitale.",
    timeline4_title: "Reconnaissance", timeline4_desc: "Obtention du label Meilleure plateforme d'accompagnement startup.",
    timeline5_title: "Scale-up", timeline5_desc: "Dépassement des 100 startups accompagnées.",
    timeline6_title: "Leader régional", timeline6_desc: "Consolidation de notre position de référence.",
    videos_badge: "Nos apparitions médiatiques",
    videos_title: "BEH dans les",
    videos_title_highlight: "médias",
    videos_desc: "Nos experts et fondateurs prennent la parole dans les émissions radio, télévision et podcasts pour partager leur vision de l'écosystème startup.",
    videos_empty: "Aucune vidéo ou interview disponible pour le moment.",
    videos_empty_sub: "Les médias publiés apparaîtront ici.",
    videos_play: "Regarder",
    videos_listen: "Écouter",
    videos_filter_all: "Tout voir",
    videos_filter_interview: "Interviews",
    videos_filter_reportage: "Reportages",
    videos_filter_conference: "Conférences",
    videos_loading: "Chargement des médias...",
    videos_modal_close: "Fermer",
    videos_modal_source: "Voir la source",
    valeurs_badge: "Valeurs",
    valeurs_title: "Les valeurs qui nous",
    valeurs_title_highlight: "définissent",
    valeur1_titre: "Excellence", valeur1_desc: "Nous sélectionnons rigoureusement chaque expert pour garantir un niveau d'accompagnement exceptionnel.",
    valeur2_titre: "Transparence", valeur2_desc: "Chaque interaction, chaque contrat, chaque résultat est documenté et partagé.",
    valeur3_titre: "Engagement", valeur3_desc: "Votre succès est notre succès. Nous nous impliquons bien au-delà de la prestation.",
    cta_title: "Prêt à nous rejoindre ?",
    cta_desc: "Que vous soyez expert ou startup, rejoignez notre écosystème et bénéficiez d'un accompagnement sur mesure.",
    cta_btn: "Rejoindre BEH",
    cta_btn_contact: "Nous contacter",
    foot_desc: "Plateforme premium de mise en relation entre startups ambitieuses et experts certifiés.",
    foot_nav: "Navigation", foot_services: "Services", foot_contact: "Contact",
    foot_legal: "Mentions légales", foot_privacy: "Confidentialité",
    foot_copy: "© 2026 Business Expert Hub. Tous droits réservés.",
  },
  en: {
    nav_home: "Home", nav_about: "About", nav_services: "Services",
    nav_experts: "Experts", nav_blog: "Blog", nav_contact: "Contact",
    btn_login: "Login", btn_signup: "Sign up",
    hero_badge: "Our story & DNA",
    hero_title: "Who is",
    hero_title_highlight: "Business Expert Hub",
    hero_desc: "Since 2019, we connect the most ambitious startups with the best experts to turn their visions into measurable success.",
    hero_cta_vision: "Our Vision",
    hero_cta_mission: "Our Mission",
    hero_cta_valeurs: "Our Values",
    stat_creation: "Year of creation",
    stat_experts: "Certified experts",
    stat_startups: "Startups supported",
    vision_badge: "Vision",
    vision_title: "Become the",
    vision_title_highlight: "reference",
    vision_title_end: "in startup support",
    vision_desc: "Our vision is to create an ecosystem where every innovative startup has access to the same exceptional human resources as large companies.",
    vision_point1: "Universal access to high-level expertise",
    vision_point2: "Pan-African and European network by 2027",
    vision_point3: "Technology at the service of connection",
    vision_point4: "1,000 startups supported by 2027",
    citation: "We don't just connect experts and startups. We create tomorrow's success stories.",
    citation_auteur: "Ahmed Benslimane",
    citation_role: "CEO & Co-founder",
    mission_badge: "Mission",
    mission_title: "Provide",
    mission_title_highlight: "privileged",
    mission_title_end: "access to expertise",
    mission_desc: "Give startups privileged access to certified experts to structure their strategy, accelerate growth and succeed in fundraising.",
    mission_card1_title: "Structure",
    mission_card1_desc: "We help startups build solid foundations: strategy, business model, internal organization and scalable processes.",
    mission_card1_item1: "Complete strategic diagnosis",
    mission_card1_item2: "Business model canvas",
    mission_card1_item3: "Organization & governance",
    mission_card2_title: "Accelerate",
    mission_card2_desc: "With our marketing, tech and sales experts, we boost your growth using proven methods.",
    mission_card2_item1: "Growth hacking & acquisition",
    mission_card2_item2: "Product & UX optimization",
    mission_card2_item3: "Commercial scalability",
    mission_card3_title: "Fund",
    mission_card3_desc: "We connect startups with our network of VCs, family offices and funds to facilitate fundraising.",
    mission_card3_item1: "Pitch & deck preparation",
    mission_card3_item2: "Investor network access",
    mission_card3_item3: "Due diligence support",
    timeline_badge: "Our journey",
    timeline_title: "Our story &",
    timeline_title_highlight: "success",
    timeline1_title: "Foundation", timeline1_desc: "Creation of Business Expert Hub by a team of passionate consultants.",
    timeline2_title: "First successes", timeline2_desc: "Supporting our first 20 startups.",
    timeline3_title: "Digital expansion", timeline3_desc: "Launch of the digital platform.",
    timeline4_title: "Recognition", timeline4_desc: "Obtaining the label Best startup support platform.",
    timeline5_title: "Scale-up", timeline5_desc: "Exceeding 100 startups supported.",
    timeline6_title: "Regional leader", timeline6_desc: "Consolidating our position as a reference.",
    videos_badge: "Our media appearances",
    videos_title: "BEH in the",
    videos_title_highlight: "media",
    videos_desc: "Our experts and founders speak on radio programs, television and podcasts to share their vision of the startup ecosystem.",
    videos_empty: "No videos or interviews available at the moment.",
    videos_empty_sub: "Published media will appear here.",
    videos_play: "Watch",
    videos_listen: "Listen",
    videos_filter_all: "See all",
    videos_filter_interview: "Interviews",
    videos_filter_reportage: "Reports",
    videos_filter_conference: "Conferences",
    videos_loading: "Loading media...",
    videos_modal_close: "Close",
    videos_modal_source: "View source",
    valeurs_badge: "Values",
    valeurs_title: "The values that",
    valeurs_title_highlight: "define us",
    valeur1_titre: "Excellence", valeur1_desc: "We rigorously select each expert to guarantee an exceptional level of support.",
    valeur2_titre: "Transparency", valeur2_desc: "Every interaction, every contract, every result is documented and shared.",
    valeur3_titre: "Commitment", valeur3_desc: "Your success is our success. We get involved far beyond the service.",
    cta_title: "Ready to join us?",
    cta_desc: "Whether you are an expert or a startup, join our ecosystem and benefit from personalized support.",
    cta_btn: "Join BEH",
    cta_btn_contact: "Contact us",
    foot_desc: "Premium platform connecting ambitious startups with certified experts.",
    foot_nav: "Navigation", foot_services: "Services", foot_contact: "Contact",
    foot_legal: "Legal notice", foot_privacy: "Privacy policy",
    foot_copy: "© 2026 Business Expert Hub. All rights reserved.",
  },
};

const SERVICES_NAV = [
  { label: { fr: "Consulting", en: "Consulting" }, slug: "consulting" },
  { label: { fr: "Audit sur site", en: "On-site Audit" }, slug: "audit-sur-site" },
  { label: { fr: "Nos plateformes", en: "Our platforms" }, slug: "nos-plateformes" },
  { label: { fr: "Formations", en: "Training" }, slug: "formations" },
];

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}
function getEmbedUrl(video: VideoMedia): string | null {
  if (video.type === "youtube") { const id = getYoutubeId(video.url); return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null; }
  if (video.type === "vimeo") { const id = getVimeoId(video.url); return id ? `https://player.vimeo.com/video/${id}?autoplay=1&color=F7B500` : null; }
  if (video.type === "upload") return `${BASE}/uploads/videos/${video.url}`;
  return null;
}
function getThumbnail(video: VideoMedia): string | null {
  if (video.miniature) return `${BASE}/uploads/videos-miniatures/${video.miniature}`;
  if (video.type === "youtube") { const id = getYoutubeId(video.url); if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
  return null;
}
function getCatMeta(cat?: string): { color: string; icon: ReactNode; label: string } {
  switch (cat) {
    case "interview":  return { color: "#F7B500", icon: <FaMicrophone />, label: "Interview" };
    case "reportage":  return { color: "#3B82F6", icon: <FaVideo />,      label: "Reportage" };
    case "conference": return { color: "#10B981", icon: <FaUsers />,      label: "Conférence" };
    default:           return { color: "#8B5CF6", icon: <FaPlay />,       label: "Média" };
  }
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const LANGS = [{ code: "fr" as Lang, label: "Français", short: "FR" }, { code: "en" as Lang, label: "English", short: "EN" }];
  const current = LANGS.find(l => l.code === lang)!;
  function select(code: Lang) { setLang(code); setOpen(false); if (typeof window !== "undefined") localStorage.setItem("beh_lang", code); }
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", padding: "6px 8px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13.5, fontWeight: 600, color: "#374151", borderRadius: 8, transition: "color .18s,background .18s", outline: "none" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#0A2540"; e.currentTarget.style.background = "#F3F4F6"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; } }}>
        <FaGlobe size={15} style={{ color: "#6B7280", flexShrink: 0 }} />
        <span style={{ letterSpacing: ".3px" }}>{current.short}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(10,37,64,.13)", border: "1px solid #E5E7EB", overflow: "hidden", minWidth: 140, zIndex: 400, animation: "langDrop .15s cubic-bezier(.22,1,.36,1)" }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => select(l.code)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: l.code === lang ? "#F9FAFB" : "transparent", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13.5, fontWeight: l.code === lang ? 700 : 500, color: l.code === lang ? "#0A2540" : "#6B7280", transition: "background .12s,color .12s", textAlign: "left" }}>
              <FaGlobe size={13} style={{ color: l.code === lang ? "#F7B500" : "#9CA3AF", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheck size={7} style={{ color: "#F7B500" }} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0px)" : "translateY(44px)", transition: `opacity 0.78s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.78s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function VideoModal({ video, onClose, tr }: { video: VideoMedia; onClose: () => void; tr: Record<string, string> }) {
  const embedUrl = getEmbedUrl(video);
  const isUpload = video.type === "upload";
  const catMeta = getCatMeta(video.categorie);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,12,28,.92)", backdropFilter: "blur(14px)" }} onClick={onClose} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 980, animation: "modalIn .35s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ background: catMeta.color, color: "#fff", borderRadius: 99, padding: "4px 12px 4px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{catMeta.icon} {catMeta.label}</span>
            {video.emission && <span style={{ color: "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 500 }}>{video.emission}</span>}
            {video.duree && <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>• {video.duree}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {video.type === "external" && (
              <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                <FaExternalLinkAlt size={11} /> {tr.videos_modal_source}
              </a>
            )}
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes /></button>
          </div>
        </div>
        <div style={{ background: "#000", borderRadius: 20, overflow: "hidden", boxShadow: "0 48px 120px rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.06)" }}>
          {embedUrl && !isUpload ? (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={video.titre} />
            </div>
          ) : isUpload && embedUrl ? (
            <video src={embedUrl} controls autoPlay style={{ width: "100%", maxHeight: 550, display: "block", background: "#000" }} />
          ) : (
            <div style={{ padding: "80px 40px", textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32, color: "#0A2540" }}><FaPlay /></div>
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: 15, marginBottom: 24 }}>Ce média est disponible sur la plateforme source.</p>
              <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", borderRadius: 11, padding: "13px 28px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}><FaExternalLinkAlt /> {tr.videos_modal_source}</a>
            </div>
          )}
        </div>
        <div style={{ padding: "18px 4px 0" }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 6px" }}>{video.titre}</h3>
          {video.description && <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{video.description}</p>}
          {video.date_publication && <div style={{ color: "rgba(255,255,255,.3)", fontSize: 12.5, marginTop: 8 }}>📅 {new Date(video.date_publication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>}
        </div>
      </div>
    </div>
  );
}

function MediasInTimeline({ tr, lang }: { tr: Record<string, string>; lang: Lang }) {
  const [videos, setVideos] = useState<VideoMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [openVideo, setOpenVideo] = useState<VideoMedia | null>(null);
  useEffect(() => {
    fetch(`${BASE}/medias/videos/public`).then(r => r.ok ? r.json() : []).then((data: any) => { if (Array.isArray(data)) setVideos(data.sort((a: VideoMedia, b: VideoMedia) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); else setVideos([]); }).catch(() => setVideos([])).finally(() => setLoading(false));
  }, []);
  const filters = [{ key: "all", label: tr.videos_filter_all }, { key: "interview", label: tr.videos_filter_interview }, { key: "reportage", label: tr.videos_filter_reportage }, { key: "conference", label: tr.videos_filter_conference }];
  const filtered = activeFilter === "all" ? videos : videos.filter(v => v.categorie === activeFilter);
  const featured = filtered.find(v => v.featured);
  const rest = featured ? filtered.filter(v => v.id !== featured.id) : filtered;

  if (loading) return (<div style={{ textAlign: "center", padding: "48px 0" }}><div style={{ width: 40, height: 40, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 14px", animation: "spin .8s linear infinite" }} /><p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>{tr.videos_loading}</p></div>);
  if (videos.length === 0) return (<div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,.03)", borderRadius: 20, border: "1.5px dashed rgba(255,255,255,.1)" }}><div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(247,181,0,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26, color: "#F7B500" }}><FaMicrophone /></div><h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{tr.videos_empty}</h3><p style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>{tr.videos_empty_sub}</p></div>);

  return (
    <>
      <FadeUp delay={0.05}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {filters.map(f => {
            const isActive = activeFilter === f.key;
            const count = f.key === "all" ? videos.length : videos.filter(v => v.categorie === f.key).length;
            if (count === 0 && f.key !== "all") return null;
            return (<button key={f.key} onClick={() => setActiveFilter(f.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 99, border: `1.5px solid ${isActive ? "#F7B500" : "rgba(255,255,255,.15)"}`, background: isActive ? "#F7B500" : "transparent", color: isActive ? "#0A2540" : "rgba(255,255,255,.6)", fontWeight: isActive ? 800 : 600, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>{f.label}<span style={{ background: isActive ? "rgba(10,37,64,.2)" : "rgba(255,255,255,.1)", borderRadius: 99, padding: "0px 7px", fontSize: 11, fontWeight: 800 }}>{count}</span></button>);
          })}
        </div>
      </FadeUp>
      {featured && (
        <FadeUp delay={0.1}>
          <div onClick={() => setOpenVideo(featured)} style={{ background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(247,181,0,.2)", borderRadius: 22, overflow: "hidden", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 28, transition: "border-color .3s, transform .35s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(247,181,0,.5)"; el.style.transform = "translateY(-6px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(247,181,0,.2)"; el.style.transform = "translateY(0)"; }}>
            <div style={{ position: "relative", minHeight: 240, background: "linear-gradient(135deg,#0f3460,#1a4a80)", overflow: "hidden" }}>
              {getThumbnail(featured) && <img src={getThumbnail(featured)!} alt={featured.titre} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .6, position: "absolute", inset: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(10,37,64,.55),rgba(10,37,64,.15))" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(247,181,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#0A2540", boxShadow: "0 10px 36px rgba(247,181,0,.45)" }}><FaPlay style={{ marginLeft: 3 }} /></div></div>
              <div style={{ position: "absolute", top: 14, left: 14 }}><span style={{ background: getCatMeta(featured.categorie).color, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>{getCatMeta(featured.categorie).icon} À la une</span></div>
              {featured.duree && <div style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,.7)", borderRadius: 7, padding: "3px 9px", fontSize: 12, color: "#fff", fontWeight: 700 }}>{featured.duree}</div>}
            </div>
            <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {featured.emission && (<div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.2)", borderRadius: 99, padding: "4px 12px", marginBottom: 14, width: "fit-content" }}><span style={{ fontSize: 13 }}>📻</span><span style={{ color: "#F7B500", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px" }}>{featured.emission}</span></div>)}
              <h3 style={{ color: "#fff", fontWeight: 900, fontSize: 20, lineHeight: 1.35, margin: "0 0 10px" }}>{featured.titre}</h3>
              {featured.description && <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.75, margin: 0 }}>{featured.description}</p>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#F7B500", color: "#0A2540", borderRadius: 10, padding: "9px 18px", fontWeight: 800, fontSize: 13, marginTop: 22, width: "fit-content" }}><FaPlay size={11} /> {tr.videos_play}</div>
            </div>
          </div>
        </FadeUp>
      )}
      {rest.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {rest.map((v, i) => {
            const thumb = getThumbnail(v);
            const catMeta = getCatMeta(v.categorie);
            return (
              <FadeUp key={v.id} delay={i * .08}>
                <div onClick={() => setOpenVideo(v)} style={{ background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.07)", borderRadius: 18, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "border-color .3s, transform .35s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${catMeta.color}55`; el.style.transform = "translateY(-7px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,.07)"; el.style.transform = "translateY(0)"; }}>
                  <div style={{ position: "relative", height: 168, background: "linear-gradient(135deg,#0f3460,#1a4a80)", overflow: "hidden", flexShrink: 0 }}>
                    {thumb && <img src={thumb} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .65 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(10,37,64,.7) 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(247,181,0,.88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#0A2540", boxShadow: "0 6px 22px rgba(247,181,0,.45)" }}>{v.categorie === "interview" ? <FaMicrophone /> : <FaPlay style={{ marginLeft: 2 }} />}</div></div>
                    <div style={{ position: "absolute", top: 10, left: 10 }}><span style={{ background: catMeta.color, color: "#fff", borderRadius: 99, padding: "3px 9px", fontSize: 10.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>{catMeta.icon} {catMeta.label}</span></div>
                    {v.duree && <div style={{ position: "absolute", bottom: 8, right: 10, background: "rgba(0,0,0,.72)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#fff", fontWeight: 700 }}>{v.duree}</div>}
                    {v.type === "youtube" && <div style={{ position: "absolute", bottom: 8, left: 10 }}><FaYoutube size={16} style={{ color: "#FF0000", filter: "drop-shadow(0 1px 4px rgba(0,0,0,.7))" }} /></div>}
                  </div>
                  <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {v.emission && <span style={{ fontSize: 10.5, color: catMeta.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block" }}>📻 {v.emission}</span>}
                    <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.4, margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{v.titre}</h4>
                    {v.description && <p style={{ color: "rgba(255,255,255,.42)", fontSize: 12, lineHeight: 1.65, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{v.description}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      {v.date_publication && <span style={{ fontSize: 11, color: "rgba(255,255,255,.28)" }}>{new Date(v.date_publication).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: catMeta.color }}>{tr.videos_play} <FaArrowRight size={9} /></span>
                    </div>
                  </div>
                  <div style={{ height: 2, background: `linear-gradient(90deg,${catMeta.color},${catMeta.color}22)`, flexShrink: 0 }} />
                </div>
              </FadeUp>
            );
          })}
        </div>
      )}
      {openVideo && <VideoModal video={openVideo} onClose={() => setOpenVideo(null)} tr={tr} />}
    </>
  );
}

export default function APropos() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];
  const [servicesOpen, setServicesOpen] = useState(false);
  const [nbExperts, setNbExperts] = useState<number | null>(null);
  const [nbStartups, setNbStartups] = useState<number | null>(null);
  const [histoire, setHistoire] = useState<any>({});

  const defaults: Record<string, string> = {
    annee_creation: "2019", description_hero: tr.hero_desc, description_vision: tr.vision_desc,
    vision_point1: tr.vision_point1, vision_point2: tr.vision_point2, vision_point3: tr.vision_point3, vision_point4: tr.vision_point4,
    citation: tr.citation, citation_auteur: tr.citation_auteur, citation_role: tr.citation_role,
    mission_titre: tr.mission_title, mission_desc: tr.mission_desc,
    timeline1_year: "2019", timeline1_title: tr.timeline1_title, timeline1_desc: tr.timeline1_desc,
    timeline2_year: "2020", timeline2_title: tr.timeline2_title, timeline2_desc: tr.timeline2_desc,
    timeline3_year: "2021", timeline3_title: tr.timeline3_title, timeline3_desc: tr.timeline3_desc,
    timeline4_year: "2022", timeline4_title: tr.timeline4_title, timeline4_desc: tr.timeline4_desc,
    timeline5_year: "2023", timeline5_title: tr.timeline5_title, timeline5_desc: tr.timeline5_desc,
    timeline6_year: "2024", timeline6_title: tr.timeline6_title, timeline6_desc: tr.timeline6_desc,
    valeur1_titre: tr.valeur1_titre, valeur1_desc: tr.valeur1_desc, valeur1_color: "#F7B500",
    valeur2_titre: tr.valeur2_titre, valeur2_desc: tr.valeur2_desc, valeur2_color: "#22C55E",
    valeur3_titre: tr.valeur3_titre, valeur3_desc: tr.valeur3_desc, valeur3_color: "#3B82F6",
  };
  const get = (key: string) => histoire?.[key] || defaults[key] || "";

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["vision", "mission", "valeurs"].includes(hash)) setTimeout(() => { document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350);
    fetch(`${BASE}/histoire`).then(r => r.ok ? r.json() : null).then(d => { if (d) setHistoire(d); }).catch(() => {});
    const loadStats = () => {
      fetch(`${BASE}/experts/liste`).then(r => r.ok ? r.json() : []).then(d => setNbExperts(Array.isArray(d) ? d.filter((e: any) => e.statut === "valide").length : 0)).catch(() => setNbExperts(0));
      fetch(`${BASE}/startups/liste`).then(r => r.ok ? r.json() : []).then(d => setNbStartups(Array.isArray(d) ? d.filter((s: any) => s.statut === "valide").length : 0)).catch(() => setNbStartups(0));
    };
    loadStats();
    const iv = setInterval(loadStats, 30000);
    return () => clearInterval(iv);
  }, []);

  const timeline = [1, 2, 3, 4, 5, 6].map(n => ({ year: get(`timeline${n}_year`), title: get(`timeline${n}_title`), desc: get(`timeline${n}_desc`) })).filter(t => t.year && t.title);
  const valeurs = [1, 2, 3].map(n => ({ titre: get(`valeur${n}_titre`), desc: get(`valeur${n}_desc`), color: get(`valeur${n}_color`) || "#F7B500", icon: n === 1 ? <FaAward /> : n === 2 ? <FaGlobe /> : <FaHandsHelping /> }));

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", color: "#2D3748", background: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY { 0%,100%{transform:translateY(-50%) rotate(45deg)} 50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)} }
        .diamond-float { animation:floatY 6s ease-in-out infinite }
        @keyframes heroIn { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        .hero-c>* { animation:heroIn .85s cubic-bezier(.22,1,.36,1) both }
        .hero-c>*:nth-child(1){animation-delay:.10s}.hero-c>*:nth-child(2){animation-delay:.22s}.hero-c>*:nth-child(3){animation-delay:.35s}.hero-c>*:nth-child(4){animation-delay:.48s}.hero-c>*:nth-child(5){animation-delay:.60s}
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer { background:linear-gradient(90deg,#F7B500 0%,#fff8c0 40%,#F7B500 60%,#e6a800 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3.2s linear infinite }
        @keyframes countPop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
        .count-pop { animation:countPop .5s cubic-bezier(.22,1,.36,1) both }
        .val-card { transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s }
        .val-card:hover { transform:translateY(-10px); box-shadow:0 28px 60px rgba(10,37,64,.14)!important }
        .timeline-dot { transition:transform .3s,box-shadow .3s }
        .timeline-item:hover .timeline-dot { transform:scale(1.2); box-shadow:0 0 0 8px rgba(247,181,0,.15) }
        .timeline-item:hover .timeline-box { border-color:rgba(247,181,0,.35)!important }
        .timeline-box { transition:border-color .3s }
        #vision,#mission,#valeurs,#medias { scroll-margin-top:90px }
        @keyframes langDrop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .nav-link { color:#475569; text-decoration:none; font-size:14.5px; font-weight:500; transition:color .2s }
        .nav-link:hover { color:#F7B500 }
        .btn-conn { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:13.5px; cursor:pointer; transition:all .22s; font-family:inherit }
        .btn-conn:hover { background:#F7B500; border-color:#F7B500 }
        .btn-insc { background:#F7B500; color:#0A2540; border:2px solid #F7B500; padding:9px 22px; border-radius:9px; font-weight:800; font-size:13.5px; cursor:pointer; transition:all .22s; font-family:inherit }
        .btn-insc:hover { background:#e6a800 }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; background:#F7B500; color:#0A2540; border:none; border-radius:10px; padding:13px 28px; font-weight:800; font-size:15px; cursor:pointer; font-family:inherit; transition:transform .22s,box-shadow .22s,background .22s; text-decoration:none }
        .btn-gold:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(247,181,0,.38); background:#e6a800 }
        .btn-outline-wh { display:inline-flex; align-items:center; gap:8px; background:transparent; color:#F7B500; border:2px solid #F7B500; border-radius:10px; padding:13px 28px; font-weight:700; font-size:15px; cursor:pointer; font-family:inherit; transition:transform .22s,background .22s; text-decoration:none }
        .btn-outline-wh:hover { transform:translateY(-3px); background:rgba(247,181,0,.1) }
        .drop-item { display:block; padding:10px 18px; color:#334155; text-decoration:none; font-size:14px; font-weight:500; transition:background .15s,color .15s; white-space:nowrap }
        .drop-item:hover { background:#FFFBEB; color:#F7B500 }
        .bc-link { color:rgba(255,255,255,.45); text-decoration:none; font-size:13px; transition:color .2s }
        .bc-link:hover { color:#F7B500 }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 #EEF2F7,0 4px 18px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="11" fill="#0A2540" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", letterSpacing: "-0.3px" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, justifyContent: "center" }}>
            <Link href="/" className="nav-link">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-link" style={{ color: "#F7B500", fontWeight: 700 }}>{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{tr.nav_services} <FaChevronDown size={9} /></Link>
              {servicesOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "8px", margin: 0, zIndex: 200, minWidth: 210, boxShadow: "0 16px 48px rgba(10,37,64,.14)", border: "1px solid #EEF2F7" }}>
                  {SERVICES_NAV.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label[lang]}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-link">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-link">{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 2px" }} />
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 2px" }} />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ position: "relative", background: "#0A2540", color: "#fff", overflow: "hidden", minHeight: 540 }}>
        {[{ w: 420, r: 60, delay: "0s" }, { w: 270, r: 150, delay: "1.4s" }, { w: 150, r: 222, delay: "2.6s" }].map((d, i) => (
          <div key={i} className="diamond-float" style={{ position: "absolute", width: d.w, height: d.w, right: d.r, top: "50%", transform: "translateY(-50%) rotate(45deg)", background: `rgba(255,255,255,${0.045 + i * 0.01})`, border: "1px solid rgba(255,255,255,0.08)", animationDelay: d.delay, pointerEvents: "none" }} />
        ))}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
        <div className="hero-c" style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "100px 32px 110px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
            <Link href="/" className="bc-link">{tr.nav_home}</Link>
            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 13 }}>/</span>
            <span style={{ color: "#F7B500", fontWeight: 600, fontSize: 13 }}>{tr.nav_about}</span>
          </div>
          <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase", padding: "6px 18px", borderRadius: 99, marginBottom: 28 }}>{tr.hero_badge}</span>
          <h1 style={{ fontWeight: 900, margin: "0 0 20px", lineHeight: 1.08, fontSize: "clamp(42px,6vw,76px)" }}>
            {tr.hero_title} <span className="shimmer">{tr.hero_title_highlight}</span>&nbsp;?
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.72)", maxWidth: 600, lineHeight: 1.85, marginBottom: 36 }}>{get("description_hero")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a href="#vision" className="btn-gold">{tr.hero_cta_vision} <FaArrowRight size={12} /></a>
            <a href="#mission" className="btn-outline-wh">{tr.hero_cta_mission} <FaArrowRight size={12} /></a>
            <a href="#valeurs" className="btn-outline-wh">{tr.hero_cta_valeurs} <FaArrowRight size={12} /></a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: "72px 28px", background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "stretch" }}>
          {[{ value: get("annee_creation"), label: tr.stat_creation, loading: false }, { value: nbExperts, label: tr.stat_experts, loading: nbExperts === null }, { value: nbStartups, label: tr.stat_startups, loading: nbStartups === null }].map((stat, i, arr) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 24px", borderRight: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div className={stat.loading ? "" : "count-pop"} style={{ fontSize: 52, fontWeight: 900, color: "#F7B500", marginBottom: 6, lineHeight: 1 }}>
                {stat.loading ? <div style={{ width: 36, height: 36, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto", animation: "spin .8s linear infinite" }} /> : stat.value}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VISION ══ */}
      <section id="vision" style={{ padding: "100px 28px", position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#0A2540 0%,#0f3460 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle,rgba(247,181,0,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <FadeUp>
            <span style={{ display: "inline-block", color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "5px 18px", borderRadius: 99, border: "1px solid rgba(247,181,0,.35)", marginBottom: 24 }}>{tr.vision_badge}</span>
            <h2 style={{ fontWeight: 900, color: "#fff", margin: "0 0 20px", lineHeight: 1.12, fontSize: "clamp(32px,4vw,56px)" }}>{tr.vision_title} <span style={{ color: "#F7B500" }}>{tr.vision_title_highlight}</span> {tr.vision_title_end}</h2>
            <p style={{ color: "rgba(255,255,255,.68)", fontSize: 16, lineHeight: 1.88, marginBottom: 32 }}>{get("description_vision")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[get("vision_point1"), get("vision_point2"), get("vision_point3"), get("vision_point4")].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaCheck size={10} style={{ color: "#0A2540" }} /></div>
                  <span style={{ color: "rgba(255,255,255,.8)", fontSize: 15, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.22}>
            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 26, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", padding: "48px 40px", backdropFilter: "blur(6px)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#F7B500,transparent)" }} />
                <FaQuoteLeft style={{ color: "rgba(247,181,0,.18)", fontSize: 44, marginBottom: 24 }} />
                <blockquote style={{ color: "rgba(255,255,255,.9)", fontSize: 19, fontWeight: 700, lineHeight: 1.65, margin: "0 0 32px", fontStyle: "italic" }}>&ldquo;{get("citation")}&rdquo;</blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#0A2540,#1a4080)", border: "2.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                    {get("citation_auteur").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{get("citation_auteur")}</div><div style={{ color: "#F7B500", fontSize: 13, fontWeight: 600 }}>{get("citation_role")}</div></div>
                </div>
              </div>
              <div style={{ position: "absolute", bottom: -28, right: -28, width: 110, height: 110, borderRadius: 22, background: "rgba(247,181,0,.08)", border: "1px solid rgba(247,181,0,.15)", transform: "rotate(18deg)", pointerEvents: "none" }} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section id="mission" style={{ padding: "100px 28px", position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#f8faff 0%,#fff 55%,#fffdf0 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "6px 18px", borderRadius: 99, marginBottom: 20 }}>{tr.mission_badge}</span>
              <h2 style={{ fontWeight: 900, color: "#0A2540", margin: "0 0 14px", lineHeight: 1.12, fontSize: "clamp(32px,4vw,56px)" }}>{tr.mission_title} <span style={{ color: "#F7B500" }}>{tr.mission_title_highlight}</span> {tr.mission_title_end}</h2>
              <p style={{ color: "#64748B", fontSize: 16, maxWidth: 600, margin: "0 auto", lineHeight: 1.85 }}>{get("mission_desc")}</p>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { icon: <FaBullseye />, title: tr.mission_card1_title, color: "#F7B500", desc: tr.mission_card1_desc, items: [tr.mission_card1_item1, tr.mission_card1_item2, tr.mission_card1_item3] },
              { icon: <FaRocket />, title: tr.mission_card2_title, color: "#3B82F6", desc: tr.mission_card2_desc, items: [tr.mission_card2_item1, tr.mission_card2_item2, tr.mission_card2_item3] },
              { icon: <FaChartLine />, title: tr.mission_card3_title, color: "#22C55E", desc: tr.mission_card3_desc, items: [tr.mission_card3_item1, tr.mission_card3_item2, tr.mission_card3_item3] },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * .15}>
                <div className="val-card" style={{ background: "#fff", borderRadius: 22, overflow: "hidden", height: "100%", boxShadow: "0 6px 32px rgba(10,37,64,.07)", border: "1px solid rgba(10,37,64,.06)" }}>
                  <div style={{ height: 5, background: `linear-gradient(90deg,${item.color},${item.color}55)` }} />
                  <div style={{ padding: "36px 32px" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: `${item.color}18`, border: `1.5px solid ${item.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: item.color, marginBottom: 20 }}>{item.icon}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", marginBottom: 10 }}>{item.title}</h3>
                    <p style={{ color: "#64748B", lineHeight: 1.8, fontSize: 14.5, marginBottom: 20 }}>{item.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {item.items.map((pt, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaCheck size={9} style={{ color: "#fff" }} /></div>
                          <span style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TIMELINE + MÉDIAS ══ */}
      <section style={{ background: "#0A2540", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px,transparent 1px)", backgroundSize: "38px 38px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "100px 28px 80px", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ display: "inline-block", color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "5px 18px", borderRadius: 99, border: "1px solid rgba(247,181,0,.3)", marginBottom: 20 }}>{tr.timeline_badge}</span>
              <h2 style={{ fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.12, fontSize: "clamp(30px,4vw,52px)" }}>{tr.timeline_title} <span style={{ color: "#F7B500" }}>{tr.timeline_title_highlight}</span></h2>
            </div>
          </FadeUp>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 27, top: 28, bottom: 28, width: 2, background: "linear-gradient(to bottom,#F7B500,rgba(247,181,0,.08))", pointerEvents: "none" }} />
            {timeline.map((item, i) => (
              <FadeUp key={i} delay={i * .1}>
                <div className="timeline-item" style={{ position: "relative", display: "flex", gap: 28, marginBottom: i < timeline.length - 1 ? 28 : 0 }}>
                  <div style={{ flexShrink: 0, position: "relative", zIndex: 10 }}>
                    <div className="timeline-dot" style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 13, boxShadow: "0 4px 18px rgba(247,181,0,.4)" }}>{item.year.slice(2)}</div>
                  </div>
                  <div className="timeline-box" style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 13 }}>{item.year}</span>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.2)", flexShrink: 0 }} />
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{item.title}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,.52)", fontSize: 14, lineHeight: 1.78, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 100px", position: "relative", zIndex: 10 }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 72 }}>
            <FadeUp>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 44 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(247,181,0,.3),transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(247,181,0,.12)", border: "1px solid rgba(247,181,0,.25)", borderRadius: 99, padding: "8px 22px" }}>
                  <FaMicrophone style={{ color: "#F7B500", fontSize: 14 }} />
                  <span style={{ color: "#F7B500", fontWeight: 800, fontSize: 12.5, letterSpacing: "2px", textTransform: "uppercase" }}>{tr.videos_badge}</span>
                </div>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg,rgba(247,181,0,.3),transparent)" }} />
              </div>
            </FadeUp>
            <MediasInTimeline tr={tr} lang={lang} />
          </div>
        </div>
      </section>

      {/* ══ VALEURS ══ */}
      <section id="valeurs" style={{ padding: "100px 28px", position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#f8faff 0%,#fff 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", padding: "6px 18px", borderRadius: 99, marginBottom: 20 }}>{tr.valeurs_badge}</span>
              <h2 style={{ fontWeight: 900, color: "#0A2540", margin: "0 0 14px", lineHeight: 1.12, fontSize: "clamp(32px,4vw,56px)" }}>{tr.valeurs_title} <span style={{ color: "#F7B500" }}>{tr.valeurs_title_highlight}</span></h2>
            </div>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
            {valeurs.map((val, i) => (
              <FadeUp key={i} delay={i * .18}>
                <div className="val-card" style={{ background: "#fff", borderRadius: 24, overflow: "hidden", height: "100%", boxShadow: "0 6px 32px rgba(10,37,64,.08)", border: "1px solid rgba(10,37,64,.06)" }}>
                  <div style={{ height: 6, background: `linear-gradient(90deg,${val.color},${val.color}55)` }} />
                  <div style={{ padding: "42px 36px" }}>
                    <div style={{ width: 70, height: 70, borderRadius: 20, background: `${val.color}18`, border: `1.5px solid ${val.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: val.color, marginBottom: 24 }}>{val.icon}</div>
                    <h3 style={{ fontSize: 26, fontWeight: 900, color: "#0A2540", marginBottom: 14 }}>{val.titre}</h3>
                    <p style={{ color: "#64748B", lineHeight: 1.82, fontSize: 15 }}>{val.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: "80px 28px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#0A2540 0%,#0f3460 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          <FadeUp>
            <h2 style={{ fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.12, fontSize: "clamp(28px,4vw,48px)" }}>{tr.cta_title}</h2>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 16, lineHeight: 1.85, marginBottom: 36 }}>{tr.cta_desc}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/inscription" className="btn-gold">{tr.cta_btn} <FaArrowRight size={12} /></Link>
              <Link href="/contact" className="btn-outline-wh">{tr.cta_btn_contact} <FaArrowRight size={12} /></Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ FOOTER — IDENTIQUE PAGE D'ACCUEIL ══ */}
      <footer style={{ background: "#05101E", color: "#fff", padding: "24px 28px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Ligne principale */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,.06)" }}>

            {/* Marque */}
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 10 }}>
                <svg width="24" height="24" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="#0A2540" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="12" fontWeight="900" fontFamily="Arial">BEH</text></svg>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
              </Link>
              <p style={{ color: "rgba(255,255,255,.22)", fontSize: 11, lineHeight: 1.6, marginBottom: 12, maxWidth: 220 }}>{tr.foot_desc}</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { Icon: FaFacebookF, href: "https://facebook.com", bg: "#1877F2" },
                  { Icon: FaInstagram, href: "https://instagram.com", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" },
                  { Icon: FaLinkedinIn, href: "https://linkedin.com", bg: "#0A66C2" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 28, height: 28, borderRadius: 7, background: s.bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all .2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 16px rgba(0,0,0,.3)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
                    <s.Icon style={{ fontSize: 10 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ color: "rgba(255,255,255,.3)", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>{tr.foot_nav}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { l: tr.nav_home, h: "/" },
                  { l: tr.nav_about, h: "/a-propos" },
                  { l: tr.nav_services, h: "/services" },
                  { l: tr.nav_experts, h: "/experts" },
                  { l: tr.nav_blog, h: "/blog" },
                  { l: tr.nav_contact, h: "/contact" },
                ].map(({ l, h }) => (
                  <li key={l}>
                    <Link href={h}
                      style={{ color: "rgba(255,255,255,.25)", fontSize: 11.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.25)"}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(247,181,0,.3)", flexShrink: 0 }} />{l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ color: "rgba(255,255,255,.3)", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>{tr.foot_services}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {SERVICES_NAV.map(s => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`}
                      style={{ color: "rgba(255,255,255,.25)", fontSize: 11.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.25)"}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(247,181,0,.3)", flexShrink: 0 }} />{s.label[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: "rgba(255,255,255,.3)", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>{tr.foot_contact}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { Icon: FaEnvelope, text: "contact@beh.com", href: "mailto:contact@beh.com" },
                  { Icon: FaPhone, text: "+216 00 000 000", href: "tel:+21600000000" },
                  { Icon: FaMapMarkerAlt, text: "Tunis, Tunisie", href: "#" },
                ].map((item, i) => (
                  <li key={i}>
                    <a href={item.href}
                      style={{ color: "rgba(255,255,255,.25)", fontSize: 11.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 7, transition: "color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.25)"}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>
                        <item.Icon />
                      </div>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ padding: "10px 0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.14)", fontSize: 10 }}>{tr.foot_copy}</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[tr.foot_legal, tr.foot_privacy].map(l => (
                <Link key={l} href="#"
                  style={{ color: "rgba(255,255,255,.14)", fontSize: 10, textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F7B500"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.14)"}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}