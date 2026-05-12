"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowRight, FaClock, FaEye,
  FaLock, FaChevronDown,
  FaTimes, FaCalendarAlt, FaSearch,
  FaTag, FaGlobe, FaCheck, FaFacebookF, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

// ==================== TRADUCTIONS ====================

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    // Header
    nav_home: "Accueil",
    nav_about: "À propos",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Connexion",
    btn_signup: "S'inscrire",
    // Hero
    hero_title: "Notre Blog",
    hero_desc: "Conseils, actualités et bonnes pratiques pour réussir vos projets digitaux.",
    // Main
    articles_recent: "Articles récents",
    articles_count: "article",
    articles_count_plural: "articles",
    loading: "Chargement des articles...",
    no_articles: "Aucun article trouvé",
    no_articles_desc: "Essayez d'autres filtres ou termes de recherche",
    reset_filters: "Tout afficher",
    // Sidebar
    search_category: "Rechercher une catégorie",
    categories: "Catégories",
    all_categories: "Toutes les catégories",
    stay_informed: "Restez informé",
    newsletter_desc: "Abonnez-vous pour recevoir les derniers articles directement dans votre boîte mail.",
    newsletter_placeholder: "Votre email...",
    newsletter_btn: "S'abonner",
    // Footer
    foot_desc: "Plateforme de mise en relation entre startups ambitieuses et experts certifiés.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Mentions légales",
    foot_privacy: "Confidentialité",
    foot_copy: "© 2026 Business Expert Hub · Tous droits réservés",
    // Modal
    modal_title: "Contenu réservé aux membres",
    modal_desc_prefix: "«",
    modal_desc_suffix: "»",
    modal_text: "Créez un compte gratuit ou connectez-vous pour accéder à cet article.",
    modal_create: "Créer un compte gratuit",
    modal_login: "Se connecter",
    // Article row
    read: "Lire",
  },
  en: {
    // Header
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_signup: "Sign up",
    // Hero
    hero_title: "Our Blog",
    hero_desc: "Tips, news and best practices to succeed in your digital projects.",
    // Main
    articles_recent: "Recent articles",
    articles_count: "article",
    articles_count_plural: "articles",
    loading: "Loading articles...",
    no_articles: "No articles found",
    no_articles_desc: "Try different filters or search terms",
    reset_filters: "Show all",
    // Sidebar
    search_category: "Search a category",
    categories: "Categories",
    all_categories: "All categories",
    stay_informed: "Stay informed",
    newsletter_desc: "Subscribe to receive the latest articles directly in your inbox.",
    newsletter_placeholder: "Your email...",
    newsletter_btn: "Subscribe",
    // Footer
    foot_desc: "Matching platform connecting ambitious startups with certified experts.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Legal notice",
    foot_privacy: "Privacy policy",
    foot_copy: "© 2026 Business Expert Hub · All rights reserved",
    // Modal
    modal_title: "Members-only content",
    modal_desc_prefix: "«",
    modal_desc_suffix: "»",
    modal_text: "Create a free account or log in to access this article.",
    modal_create: "Create a free account",
    modal_login: "Log in",
    // Article row
    read: "Read",
  },
};

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

  const LANGS: { code: Lang; label: string; short: string }[] = [
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
          fontFamily: "'DM Sans', sans-serif",
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
                fontFamily: "'DM Sans', sans-serif",
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

// ==================== CONSTANTES ====================

const DEFAULT_CATEGORIES = [
  "Développement",
  "Intelligence artificielle",
  "Business",
  "Conseils",
  "Sécurité",
  "Design",
  "Marketing",
  "Finance",
  "Ressources Humaines",
  "Stratégie",
];

const SERVICES = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

export default function BlogPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];

  const [articles, setArticles]       = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCat, setSelectedCat] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockArticle, setLockArticle]    = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn]      = useState(false);
  const [navOpen, setNavOpen]            = useState(false);
  const [categoriesWithCount, setCategoriesWithCount] = useState<{name: string; count: number}[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // Charger tous les articles
  useEffect(() => {
    const u = localStorage.getItem("user");
    setIsLoggedIn(!!u);

    fetch(`${BASE}/articles/public`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setAllArticles(list);
        setArticles(list);

        // Calculer les catégories avec leur nombre d'articles
        const countMap: Record<string, number> = {};
        list.forEach((a: any) => {
          const cat = a.categorie || "Général";
          countMap[cat] = (countMap[cat] || 0) + 1;
        });
        const sorted = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }));
        setCategoriesWithCount(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrer les articles selon catégorie + recherche (par catégorie)
  useEffect(() => {
    let filtered = allArticles;
    if (selectedCat !== "Toutes") {
      filtered = filtered.filter(a => (a.categorie || "Général") === selectedCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        (a.categorie || "Général").toLowerCase().includes(q)
      );
    }
    setArticles(filtered);
  }, [selectedCat, searchQuery, allArticles]);

  function handleArticleClick(article: any) {
    if (article.acces_prive && !isLoggedIn) {
      setLockArticle(article);
      setShowLockModal(true);
      return;
    }
    router.push(`/blog/${article.id}`);
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("sending");
    try {
      const res = await fetch(`${BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, nom: "Blog Subscriber" }),
      });
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
        setTimeout(() => setNewsletterStatus("idle"), 3000);
      } else {
        setNewsletterStatus("error");
        setTimeout(() => setNewsletterStatus("idle"), 3000);
      }
    } catch {
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus("idle"), 3000);
    }
  }

  // Helper pour formater la date selon la langue
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #F7B500; color: #0A2540; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

        .nav-l { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .18s; }
        .nav-l:hover { color: #F7B500; }
        .nav-l.act { color: #0A2540; font-weight: 700; }
        .drp-i { display: block; padding: 9px 16px; color: #374151; text-decoration: none; font-size: 13.5px; font-weight: 500; transition: background .12s, color .12s; }
        .drp-i:hover { background: #FFFBEB; color: #F7B500; }

        .search-wrap { position: relative; }
        .search-wrap input { width: 100%; padding: 10px 40px 10px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #374151; outline: none; transition: border-color .18s, box-shadow .18s; background: #fff; }
        .search-wrap input:focus { border-color: #0A2540; box-shadow: 0 0 0 3px rgba(10,37,64,.07); }
        .search-wrap .ico { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }

        .cat-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; border-radius: 9px; cursor: pointer; transition: background .15s; }
        .cat-row:hover { background: #F3F4F6; }
        .cat-row.active { background: #0A2540; }
        .cat-row.active .cat-name { color: #F7B500; font-weight: 700; }
        .cat-row.active .cat-cnt { background: #F7B500; color: #0A2540; }
        .cat-name { font-size: 13.5px; color: #374151; font-weight: 500; transition: color .15s; }
        .cat-cnt { background: #E5E7EB; color: #6B7280; border-radius: 99px; padding: 2px 9px; font-size: 11px; font-weight: 700; min-width: 26px; text-align: center; transition: background .15s, color .15s; }

        .art-row { display: flex; gap: 20px; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; transition: box-shadow .28s, transform .28s, border-color .28s; cursor: pointer; }
        .art-row:hover { box-shadow: 0 12px 40px rgba(10,37,64,.1); transform: translateY(-3px); border-color: rgba(247,181,0,.35); }
        .art-row:hover .art-thumb { transform: scale(1.06); }
        .art-thumb { transition: transform .5s cubic-bezier(.22,1,.36,1); width: 100%; height: 100%; object-fit: cover; }

        .modal-bg { position: fixed; inset: 0; background: rgba(10,37,64,.55); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(8px); }

        .sub-btn { width: 100%; padding: 12px; background: #0A2540; color: #F7B500; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: background .2s; }
        .sub-btn:hover { background: #F7B500; color: #0A2540; }
        .sub-inp { width: 100%; padding: 11px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; outline: none; transition: border-color .18s; }
        .sub-inp:focus { border-color: #0A2540; }

        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }
      `}</style>

      {/* MODAL ACCÈS PRIVÉ */}
      {showLockModal && (
        <div className="modal-bg" onClick={() => setShowLockModal(false)}>
          <div style={{ background: "#fff", borderRadius: 22, padding: "44px 40px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 40px 100px rgba(10,37,64,.28)", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLockModal(false)} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 20, color: "#CBD5E1", cursor: "pointer" }}><FaTimes /></button>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 28px rgba(247,181,0,.3)" }}>
              <FaLock size={24} style={{ color: "#0A2540" }} />
            </div>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#0A2540", marginBottom: 10 }}>{tr.modal_title}</h3>
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.75, marginBottom: 6 }}>
              <strong style={{ color: "#0A2540" }}>{tr.modal_desc_prefix}{lockArticle?.titre}{tr.modal_desc_suffix}</strong>
            </p>
            <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.75, marginBottom: 28 }}>{tr.modal_text}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/inscription" onClick={() => setShowLockModal(false)}><button style={{ width: "100%", background: "#0A2540", color: "#F7B500", border: "none", borderRadius: 11, padding: "13px", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>{tr.modal_create}</button></Link>
              <Link href="/connexion" onClick={() => setShowLockModal(false)}><button style={{ width: "100%", background: "transparent", color: "#0A2540", border: "1.5px solid #E5E7EB", borderRadius: 11, padding: "11px", fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>{tr.modal_login}</button></Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER AVEC SÉLECTEUR DE LANGUE */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #F1F5F9", boxShadow: "0 1px 0 #EEF2F7,0 4px 16px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, background: "#0A2540", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif", fontWeight: 900, fontSize: 13, color: "#F7B500" }}>BEH</div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 17, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" className="nav-l">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-l">{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}>
              <span className="nav-l" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{tr.nav_services} <FaChevronDown size={9} /></span>
              {navOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "6px", margin: 0, zIndex: 200, minWidth: 200, boxShadow: "0 12px 44px rgba(10,37,64,.12)", border: "1px solid #F1F5F9" }}>
                  {SERVICES.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drp-i">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-l">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-l act">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-l">{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 4px" }} />
            <Link href="/connexion" style={{ padding: "9px 20px", border: "1.5px solid rgba(10,37,64,.18)", borderRadius: 9, color: "#0A2540", fontWeight: 600, fontSize: 13.5, textDecoration: "none", transition: "all .18s", fontFamily: "'DM Sans',sans-serif" }}>{tr.btn_login}</Link>
            <Link href="/inscription" style={{ padding: "9px 20px", background: "#F7B500", borderRadius: 9, color: "#0A2540", fontWeight: 800, fontSize: 13.5, textDecoration: "none", transition: "all .18s", fontFamily: "'DM Sans',sans-serif" }}>{tr.btn_signup}</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", background: "#0A2540", overflow: "hidden", minHeight: 200 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: .22 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,37,64,.97) 0%,rgba(10,37,64,.82) 60%,rgba(10,37,64,.65) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", top: -80, right: -60, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(247,181,0,.07) 0%,transparent 65%)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "52px 28px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, opacity: .7 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none", fontSize: 12.5 }}>{tr.nav_home}</Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            <span style={{ color: "#F7B500", fontSize: 12.5, fontWeight: 600 }}>{tr.nav_blog}</span>
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(36px,5vw,52px)", fontWeight: 800, color: "#F7B500", lineHeight: 1.2, marginBottom: 14 }}>
            {tr.hero_title}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", maxWidth: 480, lineHeight: 1.75 }}>
            {tr.hero_desc}
          </p>
        </div>
      </section>

      {/* MAIN */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 36, alignItems: "start" }}>

        {/* COLONNE GAUCHE */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: "#0A2540" }}>
              {tr.articles_recent}
            </h2>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>
              {articles.length} {articles.length > 1 ? tr.articles_count_plural : tr.articles_count}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 38, height: 38, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
              <div style={{ color: "#9CA3AF", fontSize: 14 }}>{tr.loading}</div>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📝</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>{tr.no_articles}</div>
              <div style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 20 }}>{tr.no_articles_desc}</div>
              <button onClick={() => { setSelectedCat("Toutes"); setSearchQuery(""); }} style={{ background: "#0A2540", color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{tr.reset_filters}</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {articles.map((art, i) => (
                <ArticleRow key={art.id} art={art} delay={i * 0.06} onClick={() => handleArticleClick(art)} tr={tr} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 90 }}>

          {/* Recherche par catégorie */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px 18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0A2540", marginBottom: 14, textTransform: "uppercase", letterSpacing: "1.2px" }}>{tr.search_category}</h3>
            <div className="search-wrap">
              <input
                placeholder={tr.search_category}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <FaSearch size={13} className="ico" />
            </div>
          </div>

          {/* Catégories */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px 18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0A2540", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.2px" }}>{tr.categories}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div className={`cat-row${selectedCat === "Toutes" ? " active" : ""}`} onClick={() => setSelectedCat("Toutes")}>
                <span className="cat-name">{tr.all_categories}</span>
                <span className="cat-cnt" style={{ background: selectedCat === "Toutes" ? "#F7B500" : "#E5E7EB", color: selectedCat === "Toutes" ? "#0A2540" : "#6B7280", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                  {allArticles.length}
                </span>
              </div>
              {categoriesWithCount.map(cat => (
                <div key={cat.name} className={`cat-row${selectedCat === cat.name ? " active" : ""}`} onClick={() => setSelectedCat(cat.name)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaTag size={10} style={{ color: selectedCat === cat.name ? "#F7B500" : "#9CA3AF", flexShrink: 0 }} />
                    <span className="cat-name">{cat.name}</span>
                  </div>
                  <span className="cat-cnt" style={{ background: selectedCat === cat.name ? "#F7B500" : "#E5E7EB", color: selectedCat === cat.name ? "#0A2540" : "#6B7280", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Restez informé */}
          <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 16, padding: "24px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(247,181,0,.15)", border: "1px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20 }}>✉️</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{tr.stay_informed}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.72, marginBottom: 16 }}>
                {tr.newsletter_desc}
              </p>
              <form onSubmit={handleNewsletter}>
                <input
                  className="sub-inp"
                  placeholder={tr.newsletter_placeholder}
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  style={{ marginBottom: 10, background: "#fff" }}
                />
                <button type="submit" className="sub-btn" disabled={newsletterStatus === "sending"}>
                  {newsletterStatus === "sending" ? "Envoi..." : tr.newsletter_btn}
                </button>
                {newsletterStatus === "success" && (
                  <p style={{ fontSize: 11, color: "#4ADE80", textAlign: "center", marginTop: 8 }}>✅ Inscription réussie !</p>
                )}
                {newsletterStatus === "error" && (
                  <p style={{ fontSize: 11, color: "#F87171", textAlign: "center", marginTop: 8 }}>❌ Erreur, réessayez</p>
                )}
              </form>
            </div>
          </div>
        </aside>
      </main>

      {/* ══ FOOTER — VERSION RÉDUITE (comme page d'accueil) ══ */}
      <footer style={{ background: "#05101E", color: "#fff", padding: "24px 28px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Ligne principale — une seule rangée compacte */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,.06)" }}>

            {/* Marque */}
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 10 }}>
                <svg width="24" height="24" viewBox="0 0 46 46" fill="none">
                  <rect width="46" height="46" rx="10" fill="#0A2540"/>
                  <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="12" fontWeight="900" fontFamily="Arial">BEH</text>
                </svg>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
              </Link>
              <p style={{ color: "rgba(255,255,255,.22)", fontSize: 11, lineHeight: 1.6, marginBottom: 12, maxWidth: 220 }}>{tr.foot_desc}</p>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { Icon: FaFacebookF, href: "https://facebook.com", bg: "#1877F2" },
                  { Icon: FaInstagram, href: "https://instagram.com", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" },
                  { Icon: FaLinkedinIn, href: "https://linkedin.com", bg: "#0A66C2" }
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
                  { l: tr.nav_contact, h: "/contact" }
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
                {SERVICES.map(s => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`}
                      style={{ color: "rgba(255,255,255,.25)", fontSize: 11.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.25)"}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(247,181,0,.3)", flexShrink: 0 }} />{s.label}
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
                  { Icon: FaPhone, text: "+216 29 524 360", href: "tel:+21629524360" },
                  { Icon: FaMapMarkerAlt, text: "Tunis, Tunisie", href: "#" }
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

          {/* Bas du footer — copyright minimaliste */}
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

// ─── COMPOSANT ARTICLE ROW (avec traduction et date formatée) ───────────────────────────
function ArticleRow({ art, delay, onClick, tr, formatDate }: { art: any; delay: number; onClick: () => void; tr: Record<string, string>; formatDate: (date: string) => string }) {
  const cat = art.categorie || art.type || "Article";
  const dateStr = formatDate(art.createdAt);

  return (
    <div className="art-row" onClick={onClick} style={{ animation: `fadeUp .55s cubic-bezier(.22,1,.36,1) ${delay}s both` }}>
      {/* Image */}
      <div style={{ width: 220, height: 165, flexShrink: 0, position: "relative", background: "linear-gradient(135deg,#0A2540,#1a3f6f)", overflow: "hidden" }}>
        {art.image ? (
          <img src={`${BASE}/uploads/articles-img/${art.image}`} alt={art.titre} className="art-thumb" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "rgba(247,181,0,.4)" }}>📝</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "3px 10px", fontSize: 10.5, fontWeight: 700 }}>{cat}</span>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: "18px 20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FaCalendarAlt size={10} style={{ color: "#9CA3AF" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{dateStr}</span>
          </div>
          {art.duree_lecture && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <FaClock size={10} style={{ color: "#9CA3AF" }} />
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{art.duree_lecture}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
            <FaEye size={10} style={{ color: "#9CA3AF" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{art.vues || 0}</span>
          </div>
        </div>

        <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 8, lineHeight: 1.35 }}>{art.titre}</h3>

        <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.68, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {art.description}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0A2540", fontSize: 12.5, fontWeight: 700, background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: 99, padding: "5px 14px", transition: "all .18s" }}>
            {tr.read} <FaArrowRight size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}