"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaChevronDown, FaGlobe, FaCheck, FaPaperPlane,
  FaCheckCircle, FaArrowRight, FaFacebookF, FaInstagram, FaLinkedinIn,
} from "react-icons/fa";

// ==================== TRADUCTIONS ====================

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, any>> = {
  fr: {
    nav_home: "Accueil",
    nav_about: "À propos",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Connexion",
    btn_signup: "S'inscrire",
    hero_title: "Contactez-nous",
    hero_desc: "Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.",
    form_title: "Envoyez-nous un message",
    form_nom: "Nom",
    form_prenom: "Prénom",
    form_email: "Adresse e-mail",
    form_phone: "Numéro de téléphone",
    form_client_type: "Type de client",
    form_subject: "Sujet de votre demande",
    form_message: "Message",
    form_message_placeholder: "Décrivez votre projet ou votre demande...",
    form_btn_send: "Envoyer le message",
    form_sending: "Envoi en cours...",
    form_success: "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
    form_error: "Une erreur est survenue. Veuillez réessayer.",
    client_type_options: [
      { value: "", label: "— Choisissez un type —" },
      { value: "startup", label: "Startup" },
      { value: "expert", label: "Expert" },
      { value: "autre", label: "Autre" },
    ],
    subject_options: [
      { value: "", label: "— Sélectionnez un sujet —" },
      { value: "diagnostic_gratuit", label: "Diagnostic gratuit" },
      { value: "audit_sur_site", label: "Audit sur site" },
      { value: "demo_plateforme", label: "Démo plateforme" },
      { value: "conseil", label: "Conseil" },
      { value: "reclamation", label: "Réclamation" },
      { value: "formation", label: "Formation" },
      { value: "contact_expert", label: "Contact avec un expert" },
    ],
    info_title: "Informations de contact",
    info_email: "contact@beh.com",
    info_phone: "+216 29 524 360",
    info_address: "Tunis, Tunisie",
    info_hours: "Lun - Ven : 9h00 - 18h00",
    cta_title: "Vous êtes expert ou startup ?",
    cta_desc: "Rejoignez notre écosystème et bénéficiez d'un accompagnement sur mesure.",
    cta_btn_expert: "Devenir expert",
    cta_btn_startup: "Inscrire ma startup",
    foot_desc: "Plateforme de mise en relation entre startups ambitieuses et experts certifiés.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Mentions légales",
    foot_privacy: "Confidentialité",
    foot_copy: "© 2026 Business Expert Hub · Tous droits réservés",
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
    hero_title: "Contact us",
    hero_desc: "A question? A project? Our team is here to listen and support you.",
    form_title: "Send us a message",
    form_nom: "Last name",
    form_prenom: "First name",
    form_email: "Email address",
    form_phone: "Phone number",
    form_client_type: "Client type",
    form_subject: "Subject of your request",
    form_message: "Message",
    form_message_placeholder: "Describe your project or request...",
    form_btn_send: "Send message",
    form_sending: "Sending...",
    form_success: "Message sent successfully! We will get back to you shortly.",
    form_error: "An error occurred. Please try again.",
    client_type_options: [
      { value: "", label: "— Select a type —" },
      { value: "startup", label: "Startup" },
      { value: "expert", label: "Expert" },
      { value: "autre", label: "Other" },
    ],
    subject_options: [
      { value: "", label: "— Select a subject —" },
      { value: "diagnostic_gratuit", label: "Free diagnostic" },
      { value: "audit_sur_site", label: "On-site audit" },
      { value: "demo_plateforme", label: "Platform demo" },
      { value: "conseil", label: "Advice" },
      { value: "reclamation", label: "Complaint" },
      { value: "formation", label: "Training" },
      { value: "contact_expert", label: "Contact an expert" },
    ],
    info_title: "Contact information",
    info_email: "contact@beh.com",
    info_phone: "+216 29 524 360",
    info_address: "Tunis, Tunisia",
    info_hours: "Mon - Fri: 9:00 AM - 6:00 PM",
    cta_title: "Are you an expert or a startup?",
    cta_desc: "Join our ecosystem and benefit from personalized support.",
    cta_btn_expert: "Become an expert",
    cta_btn_startup: "Register my startup",
    foot_desc: "Matching platform connecting ambitious startups with certified experts.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Legal notice",
    foot_privacy: "Privacy policy",
    foot_copy: "© 2026 Business Expert Hub · All rights reserved",
  },
};

// ==================== SÉLECTEUR DE LANGUE ====================

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
          background: "transparent", border: "none", padding: "6px 8px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600, color: "#374151",
          borderRadius: 8, transition: "color .18s, background .18s", outline: "none",
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
          border: "1px solid #E5E7EB", overflow: "hidden",
          minWidth: 140, zIndex: 400,
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
                fontFamily: "'DM Sans', sans-serif", fontSize: 13.5,
                fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? "#0A2540" : "#6B7280",
                transition: "background .12s, color .12s", textAlign: "left",
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

const SERVICES = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

interface IContactConfig {
  email?: string;
  telephone?: string;
  adresse?: string;
  horaires?: string;
  description_hero?: string;
  latitude?: string;
  longitude?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ==================== PAGE PRINCIPALE ====================

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [navOpen, setNavOpen] = useState(false);
  const [contactConfig, setContactConfig] = useState<IContactConfig | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    client_type: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    async function fetchContactConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/contact/config`);
        if (res.ok) {
          const data = await res.json();
          setContactConfig(data);
        } else {
          console.warn("Impossible de charger la configuration de contact");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du config contact:", error);
      }
    }
    fetchContactConfig();
  }, []);

  const tr = T[lang];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch(`${API_BASE_URL}/contact/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: `${formData.prenom} ${formData.nom}`,
          client_type: formData.client_type,
        }),
      });
      if (response.ok) {
        setStatus("success");
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          phone: "",
          client_type: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const displayEmail = contactConfig?.email || tr.info_email;
  const displayPhone = contactConfig?.telephone || tr.info_phone;
  const displayAddress = contactConfig?.adresse || tr.info_address;
  const displayHours = contactConfig?.horaires || tr.info_hours;
  const heroDescription = contactConfig?.description_hero || tr.hero_desc;
  const displayLatitude = contactConfig?.latitude || "36.8065";
  const displayLongitude = contactConfig?.longitude || "10.1815";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #F7B500; color: #0A2540; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes langDrop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .nav-l { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .18s; }
        .nav-l:hover { color: #F7B500; }
        .nav-l.act { color: #0A2540; font-weight: 700; }
        .drp-i { display: block; padding: 9px 16px; color: #374151; text-decoration: none; font-size: 13.5px; font-weight: 500; transition: background .12s, color .12s; }
        .drp-i:hover { background: #FFFBEB; color: #F7B500; }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
          background: #fff;
          appearance: none;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: #0A2540;
          box-shadow: 0 0 0 3px rgba(10,37,64,.07);
        }
        .form-input::placeholder, .form-textarea::placeholder {
          color: #B0B8C4;
        }
        .form-textarea { resize: vertical; min-height: 120px; }

        .select-wrapper {
          position: relative;
        }
        .select-wrapper::after {
          content: '';
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #6B7280;
          pointer-events: none;
        }
        .form-select {
          padding-right: 36px;
          cursor: pointer;
        }
        .form-select option[value=""] { color: #B0B8C4; }

        .info-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #E5E7EB;
          transition: transform .28s, box-shadow .28s;
        }
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(10,37,64,.08);
          border-color: rgba(247,181,0,.3);
        }

        .btn-primary {
          background: #0A2540;
          color: #F7B500;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all .22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover {
          background: #F7B500;
          color: #0A2540;
          transform: translateY(-2px);
        }
        .btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .btn-outline {
          background: transparent;
          border: 2px solid #0A2540;
          color: #0A2540;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all .22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover {
          background: #F7B500;
          border-color: #F7B500;
          transform: translateY(-2px);
        }

        .field-icon-wrap {
          position: relative;
        }
        .field-icon-wrap .field-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          font-size: 14px;
          pointer-events: none;
        }
        .field-icon-wrap .form-input,
        .field-icon-wrap .form-select {
          padding-left: 38px;
        }

        .map-container {
          margin-top: 24px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 16px rgba(10,37,64,.08);
          transition: transform .3s, box-shadow .3s;
        }
        .map-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(10,37,64,.12);
        }
      `}</style>

      {/* HEADER */}
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
              <span className="nav-l" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                {tr.nav_services} <FaChevronDown size={9} />
              </span>
              {navOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "6px", margin: 0, zIndex: 200, minWidth: 200, boxShadow: "0 12px 44px rgba(10,37,64,.12)", border: "1px solid #F1F5F9" }}>
                  {SERVICES.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drp-i">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-l">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-l">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-l act">{tr.nav_contact}</Link>
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
      <section style={{ position: "relative", background: "#0A2540", overflow: "hidden", minHeight: 220 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: .18 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,37,64,.95) 0%,rgba(10,37,64,.8) 100%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 28px 56px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, opacity: .7 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none", fontSize: 12.5 }}>{tr.nav_home}</Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            <span style={{ color: "#F7B500", fontSize: 12.5, fontWeight: 600 }}>{tr.nav_contact}</span>
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(32px,4.5vw,48px)", fontWeight: 800, color: "#F7B500", lineHeight: 1.2, marginBottom: 12 }}>
            {tr.hero_title}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", maxWidth: 520, lineHeight: 1.75 }}>
            {heroDescription}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px 80px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48 }}>

        {/* FORMULAIRE + CARTE */}
        <div>
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", padding: "32px 36px", boxShadow: "0 4px 20px rgba(10,37,64,.04)" }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>{tr.form_title}</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              {lang === "fr"
                ? "Remplissez le formulaire ci-dessous, nous vous répondrons sous 48h."
                : "Fill in the form below, we will respond within 48 hours."}
            </p>

            {status === "success" && (
              <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "#059669", fontSize: 14 }}>
                <FaCheckCircle size={18} /> {tr.form_success}
              </div>
            )}
            {status === "error" && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "#DC2626", fontSize: 14 }}>
                ⚠️ {tr.form_error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                    {tr.form_nom} *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                    {tr.form_prenom} *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                  {tr.form_email} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="exemple@email.com"
                  autoComplete="email"
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                  {tr.form_phone}
                </label>
                <div className="field-icon-wrap">
                  <FaPhone className="field-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+216 XX XXX XXX"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* TYPE DE CLIENT - SANS ICÔNES */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                  {tr.form_client_type} *
                </label>
                <select
                  name="client_type"
                  value={formData.client_type}
                  onChange={handleChange}
                  required
                  className="form-select"
                  style={{ color: formData.client_type === "" ? "#B0B8C4" : "#374151" }}
                >
                  {tr.client_type_options.map((opt: { value: string; label: string }) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === ""}
                      style={{ color: opt.value === "" ? "#B0B8C4" : "#374151" }}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                  {tr.form_subject} *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-select"
                  style={{ color: formData.subject === "" ? "#B0B8C4" : "#374151" }}
                >
                  {tr.subject_options.map((opt: { value: string; label: string }) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === ""}
                      style={{ color: opt.value === "" ? "#B0B8C4" : "#374151" }}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>
                  {tr.form_message} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  placeholder={tr.form_message_placeholder}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {status === "sending"
                  ? <>{tr.form_sending}</>
                  : <><FaPaperPlane size={13} /> {tr.form_btn_send}</>
                }
              </button>
            </form>

            {/* CARTE GOOGLE MAPS */}
            <div className="map-container">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${displayLatitude},${displayLongitude}&zoom=15`}
                width="100%"
                height="280"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Business Expert Hub"
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR INFOS */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: "#F7B500" }}>
              <FaEnvelope />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0A2540", marginBottom: 6 }}>Email</h3>
            <a href={`mailto:${displayEmail}`} style={{ color: "#6B7280", textDecoration: "none", fontSize: 14, transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F7B500")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
              {displayEmail}
            </a>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: "#F7B500" }}>
              <FaPhone />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0A2540", marginBottom: 6 }}>Téléphone</h3>
            <a href={`tel:${displayPhone.replace(/\s/g, "")}`} style={{ color: "#6B7280", textDecoration: "none", fontSize: 14, transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F7B500")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
              {displayPhone}
            </a>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: "#F7B500" }}>
              <FaMapMarkerAlt />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0A2540", marginBottom: 6 }}>Adresse</h3>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{displayAddress}</p>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: "#F7B500" }}>
              <FaClock />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0A2540", marginBottom: 6 }}>Horaires</h3>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{displayHours}</p>
          </div>
        </aside>
      </main>

      {/* CTA SECTION */}
      <section style={{ background: "#0A2540", padding: "64px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>
            {tr.cta_title}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.75, marginBottom: 32 }}>
            {tr.cta_desc}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/inscription-expert">
              <button className="btn-primary" style={{ background: "#F7B500", color: "#0A2540" }}>
                {tr.cta_btn_expert} <FaArrowRight size={12} />
              </button>
            </Link>
            <Link href="/inscription-startup">
              <button className="btn-outline" style={{ borderColor: "#F7B500", color: "#F7B500" }}>
                {tr.cta_btn_startup} <FaArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>
      </section>

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
                  { Icon: FaEnvelope, text: displayEmail, href: `mailto:${displayEmail}` },
                  { Icon: FaPhone, text: displayPhone, href: `tel:${displayPhone.replace(/\s/g, "")}` },
                  { Icon: FaMapMarkerAlt, text: displayAddress, href: "#" }
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