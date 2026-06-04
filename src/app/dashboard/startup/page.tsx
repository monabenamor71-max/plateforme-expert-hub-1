"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaGraduationCap, FaSearch, FaPaperPlane,
  FaCheck, FaCamera, FaComments, FaCalendar, FaStar, FaCheckCircle,
  FaChartLine, FaSearchPlus, FaDesktop, FaPlay,
  FaUsers, FaClock, FaCertificate, FaExternalLinkAlt, FaTimes,
  FaMobile, FaLaptopCode, FaEdit, FaTrash, FaSave,
  FaBriefcase, FaCheckDouble, FaArrowLeft,
  FaBuilding, FaCalendarAlt, FaTag, FaMedal,
  FaInfoCircle, FaPlayCircle, FaDownload, FaChevronDown, FaPhone,
  FaVideo, FaBell, FaEnvelope, FaNewspaper, FaEye, FaEyeSlash,
  FaUser, FaLaptop, FaFilter, FaSync, FaFileAlt, FaArrowUp,
  FaHeadset, FaExclamationTriangle, FaSpinner, FaPlus,
  FaWhatsapp, FaFacebook, FaLinkedin, FaTwitter, FaGlobe,
  FaHeart, FaThumbsUp, FaThumbsDown, FaReply, FaCog, FaSignOutAlt,
  FaHome
} from "react-icons/fa";

const BASE = "http://localhost:3001";

// ============================================
// CONFIGURATION DES SERVICES
// ============================================

const SERVICES_INFO: Record<string, any> = {
  consulting: {
    label: "Consulting Stratégique", icon: <FaChartLine />, color: "#3B82F6",
    desc: "Structurez et optimisez votre entreprise pour améliorer votre performance globale.",
    duree: "2 à 8 semaines",
    points: ["Audit stratégique complet", "Business model review", "Roadmap actionnable", "Suivi mensuel inclus"],
  },
  "audit-sur-site": {
    label: "Audit sur Site", icon: <FaSearchPlus />, color: "#8B5CF6",
    desc: "Nos experts se déplacent dans vos locaux pour un diagnostic terrain approfondi.",
    duree: "1 à 5 jours",
    points: ["Diagnostic terrain", "Analyse processus", "Rapport détaillé", "Plan d'action prioritaire"],
  },
  "nos-plateformes": {
    label: "Nos Plateformes", icon: <FaDesktop />, color: "#10B981",
    desc: "Solutions digitales sur mesure : applications web et mobile.",
    duree: "4 à 16 semaines",
    points: ["Application Web", "Application Mobile", "Support & maintenance"],
  },
  "formation-sur-mesure": {
    label: "Formation", icon: <FaGraduationCap />, color: "#F59E0B",
    desc: "Programmes certifiants animés par nos experts.",
    duree: "1 jour à 3 mois",
    points: ["Contenu sur mesure", "Formateurs certifiés", "Certification incluse"],
  },
  podcasts: {
    label: "Podcast", icon: <FaVideo />, color: "#7C3AED",
    desc: "Contenus vidéo exclusifs avec des experts reconnus dans leur domaine.",
    duree: "Disponible 24/7",
    points: ["Accès illimité", "Experts certifiés", "Nouveaux contenus réguliers"],
  },
};

const DOMAINES_LIST = [
  "Marketing Digital", "Finance / Comptabilité", "Ressources Humaines",
  "Développement Web / Mobile", "Design UI/UX", "Stratégie Commerciale",
  "Logistique / Supply Chain", "Intelligence Artificielle / Data", "Autre",
];

const DELAIS_LIST = ["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"];

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F59E0B", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

const S_COLOR: Record<string, string> = {
  en_attente: "#F59E0B", valide: "#10B981", refuse: "#EF4444",
  confirme: "#10B981", annule: "#EF4444", acceptee: "#10B981",
  en_cours: "#3B82F6", terminee: "#10B981", refusee: "#EF4444",
};

type ServiceSlug = "consulting" | "audit-sur-site" | "nos-plateformes" | "formation-sur-mesure" | "podcasts";
type Tab = "accueil" | "services" | "profil" | "experts" | "rdv" | "messages" | "temoignages" | "mes-demandes" | "mes-devis" | "notifications" | "contact_admin";

// ============================================
// COMPOSANTS UTILITAIRES
// ============================================

function RdvStatusBadge({ statut }: { statut: string }) {
  const c: Record<string, any> = {
    en_attente: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", icon: "⏳", label: "En attente" },
    confirme: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", icon: "✅", label: "Confirmé" },
    annule: { bg: "#FEF2F2", color: "#7F1D1D", border: "#FCA5A5", icon: "✕", label: "Annulé" },
  };
  const cfg = c[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", icon: "•", label: statut };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 700 }}><span>{cfg.icon}</span> {cfg.label}</span>;
}

function DevisStatusBadge({ statut }: { statut: string }) {
  const c: Record<string, any> = {
    en_attente: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", label: "En attente", dot: "#F59E0B" },
    accepte: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", label: "Accepté", dot: "#10B981" },
    refuse: { bg: "#FEF2F2", color: "#7F1D1D", border: "#FCA5A5", label: "Refusé", dot: "#EF4444" },
  };
  const cfg = c[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", label: statut, dot: "#94A3B8" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 700 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />{cfg.label}</span>;
}

function DemandStatutBadge({ statut }: { statut: string }) {
  const c: Record<string, any> = {
    en_attente: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", icon: "⏳", label: "En attente" },
    notifie_experts: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", icon: "📢", label: "Experts notifiés" },
    devis_envoye: { bg: "#FFF3E0", color: "#E65100", border: "#FFE0B2", icon: "📄", label: "Devis envoyé" },
    acceptee: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0", icon: "✅", label: "Acceptée" },
    en_cours: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", icon: "🔄", label: "En cours" },
    terminee: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0", icon: "🏁", label: "Terminée" },
    refusee: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", icon: "❌", label: "Refusée" },
  };
  const cfg = c[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", icon: "•", label: statut };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 700 }}><span>{cfg.icon}</span> {cfg.label}</span>;
}

function FL({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SF({ value, onChange, options, placeholder, required }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; required?: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <select className="inp" value={value} onChange={e => onChange(e.target.value)} required={required} style={{ appearance: "none", paddingRight: 36 }}>
        <option value="">{placeholder || "Sélectionner..."}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <FaChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 11, pointerEvents: "none" }} />
    </div>
  );
}

function AutoField({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }}>{icon}</span>
        <input className="inp" value={value} onChange={e => onChange(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>
    </div>
  );
}

// ============================================
// MODAL POUR MODIFIER UN TÉMOIGNAGE
// ============================================

function ModalEditTemoignage({ temoignage, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [texte, setTexte] = useState(temoignage?.texte || "");
  const [note, setNote] = useState(temoignage?.note || 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texte.trim()) {
      alert("Veuillez écrire votre témoignage");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/temoignages/${temoignage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          texte: texte,
          note: note,
        }),
      });

      if (res.ok) {
        alert("Témoignage modifié avec succès !");
        onSave();
        onClose();
      } else {
        const err = await res.text();
        alert(`Erreur: ${err}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 550 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{
          background: `linear-gradient(135deg, #1B3A4B, #F59E0B)`,
          padding: "22px 26px", borderRadius: "20px 20px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255,255,255,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff", fontWeight: 700
            }}>
              <FaEdit />
            </div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Modifier mon témoignage</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.15)", border: "none",
            borderRadius: 10, width: 36, height: 36, cursor: "pointer",
            color: "#fff", fontSize: 16
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 20 }}>
            <label className="lbl">Votre note</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNote(s)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: s <= note ? "#F59E0B" : "#F1F5F9",
                    color: s <= note ? "#fff" : "#94A3B8",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                    transition: "all .2s"
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: 14, fontWeight: 600, color: "#F59E0B", alignSelf: "center", marginLeft: 8 }}>
                {note}/5
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="lbl">Votre témoignage</label>
            <textarea
              className="inp"
              rows={5}
              required
              value={texte}
              onChange={e => setTexte(e.target.value)}
              placeholder="Partagez votre expérience avec BEH..."
              style={{ resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid #DDE3EA` }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MODAL EDIT RENDEZ-VOUS
// ============================================

function ModalEditRendezVous({ rendezVous, experts, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sujet: rendezVous?.sujet || "",
    date_rdv: rendezVous?.date_rdv ? new Date(rendezVous.date_rdv).toISOString().slice(0, 16) : "",
    expert_id: String(rendezVous?.expert_id || ""),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date_rdv) {
      alert("Veuillez sélectionner une date et heure");
      return;
    }
    if (!form.expert_id) {
      alert("Veuillez sélectionner un expert");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/rendez-vous/${rendezVous.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          sujet: form.sujet,
          date_rdv: form.date_rdv,
          expert_id: parseInt(form.expert_id, 10),
        }),
      });

      if (res.ok) {
        alert("Rendez-vous modifié avec succès !");
        onSave();
        onClose();
      } else {
        const err = await res.text();
        alert(`Erreur: ${err}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 550 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{
          background: `linear-gradient(135deg, #1B3A4B, #1E88E5)`,
          padding: "22px 26px", borderRadius: "20px 20px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255,255,255,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff", fontWeight: 700
            }}>
              <FaEdit />
            </div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Modifier le rendez-vous</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.15)", border: "none",
            borderRadius: 10, width: 36, height: 36, cursor: "pointer",
            color: "#fff", fontSize: 16
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Sujet *</label>
            <input className="inp" required value={form.sujet} onChange={e => setForm({ ...form, sujet: e.target.value })} placeholder="Ex: Réunion de suivi" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Expert *</label>
            <select className="inp" required value={form.expert_id} onChange={e => setForm({ ...form, expert_id: e.target.value })}>
              <option value="">Sélectionner un expert</option>
              {experts.filter((e: any) => e.statut === "valide").map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.user?.prenom} {e.user?.nom} - {e.domaine || "Expert"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="lbl">Date et heure *</label>
            <input className="inp" type="datetime-local" required value={form.date_rdv} onChange={e => setForm({ ...form, date_rdv: e.target.value })} min={new Date().toISOString().slice(0, 16)} />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid #DDE3EA` }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              {loading ? "Enregistrement..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MODALS SERVICE (ServiceFormModal, PlateformeFormModal, etc.)
// ============================================

function ServiceFormModal({ slug, startup, realUser, onClose, onSubmit, sending, demandeEdit }: any) {
  const svc = SERVICES_INFO[slug];
  const [domaine, setDomaine] = useState(demandeEdit?.domaine || "");
  const [domaineAutre, setDomaineAutre] = useState("");
  const [description, setDescription] = useState(demandeEdit?.description || "");
  const [objectif, setObjectif] = useState(demandeEdit?.objectif || "");
  const [delai, setDelai] = useState(demandeEdit?.delai || "");
  const [telephone, setTelephone] = useState(demandeEdit?.telephone || startup?.user?.telephone || startup?.telephone || "");
  const [email, setEmail] = useState(demandeEdit?.email || realUser?.email || "");
  const [secteur, setSecteur] = useState(demandeEdit?.secteur || startup?.secteur || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domaine) { alert("Veuillez sélectionner un domaine d'intervention"); return; }
    const finalDomaine = domaine === "Autre" ? domaineAutre : domaine;
    if (domaine === "Autre" && !domaineAutre.trim()) { alert("Veuillez préciser le domaine"); return; }
    if (!description.trim()) { alert("Veuillez décrire vos besoins"); return; }
    onSubmit({ 
      service: slug,
      domaine: finalDomaine, 
      description, 
      objectif, 
      delai, 
      telephone, 
      email, 
      secteur, 
      type_application: "",
      demande_id: demandeEdit?.id 
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,.78)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(10,37,64,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${svc.color},${svc.color}cc)`, padding: "22px 28px", borderRadius: "24px 24px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaArrowLeft size={16} /></button>
              <div>
                <div style={{ color: "rgba(255,255,255,.65)", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>{demandeEdit ? "Modifier la demande" : "Demande de service"}</div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>{svc.label}</div>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, marginTop: 2 }}>⏱ {svc.duree}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {svc.points.map((p: string) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.15)", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                <FaCheck size={7} /> {p}
              </span>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "26px 28px" }}>
          <div style={{ background: "linear-gradient(135deg,#F0F9FF,#EFF6FF)", border: "1.5px solid #BAE6FD", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheckCircle style={{ color: "#fff", fontSize: 10 }} /></div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "1.2px" }}>Informations</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <AutoField label="Téléphone" icon={<FaPhone />} value={telephone} onChange={setTelephone} />
              <AutoField label="Email" icon={<FaEnvelope />} value={email} onChange={setEmail} />
              <div style={{ gridColumn: "1 / -1" }}>
                <AutoField label="Secteur d'activité" icon={<FaBriefcase />} value={secteur} onChange={setSecteur} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px" }}>Votre demande</span>
            <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
          </div>
          <FL label="Domaine d'intervention" required hint="Sélectionnez le domaine principal de votre besoin">
            <SF value={domaine} onChange={v => { setDomaine(v); if (v !== "Autre") setDomaineAutre(""); }} options={DOMAINES_LIST} placeholder="Sélectionnez un domaine..." required />
            {domaine === "Autre" && (
              <input className="inp" style={{ marginTop: 8 }} placeholder="Précisez votre domaine..." value={domaineAutre} onChange={e => setDomaineAutre(e.target.value)} required />
            )}
          </FL>
          <FL label="Description détaillée" required hint="Décrivez votre contexte, vos besoins et vos attentes spécifiques">
            <textarea className="inp" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder={slug === "formation-sur-mesure" ? "Nombre de participants, niveau requis, thèmes prioritaires, format souhaité..." : "Contexte actuel, problématiques rencontrées, résultats attendus..."} style={{ resize: "none" }} required />
          </FL>
          <FL label="Objectif principal" hint="Quel résultat souhaitez-vous atteindre ?">
            <input className="inp" value={objectif} onChange={e => setObjectif(e.target.value)} placeholder={slug === "formation-sur-mesure" ? "Ex: Former mon équipe RH, maîtriser le marketing digital..." : "Ex: Optimiser mes coûts, développer un nouveau marché..."} />
          </FL>
          <FL label="Délai souhaité">
            <SF value={delai} onChange={setDelai} options={DELAIS_LIST} placeholder="Choisissez un délai..." />
          </FL>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 22 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><FaClock style={{ color: "#fff", fontSize: 10 }} /></div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>Réponse garantie sous 24h ouvrées</div><div style={{ fontSize: 11.5, color: "#B45309", marginTop: 2 }}>Notre équipe analysera votre demande et vous contactera directement.</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
            <button type="submit" disabled={sending} style={{ background: `linear-gradient(135deg,${svc.color},${svc.color}bb)`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", fontWeight: 800, fontSize: 13, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, opacity: sending ? .7 : 1, boxShadow: `0 4px 16px ${svc.color}44` }}>
              {sending ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.5)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Envoi...</> : <><FaPaperPlane size={11} /> {demandeEdit ? "Modifier" : "Envoyer"} ma demande</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlateformeFormModal({ startup, realUser, onClose, onSubmit, sending, demandeEdit }: any) {
  const [typeApp, setTypeApp] = useState<"web-app" | "mobile" | "">(demandeEdit?.type_application || "");
  const [description, setDescription] = useState(demandeEdit?.description || "");
  const [objectif, setObjectif] = useState(demandeEdit?.objectif || "");
  const [fonctionnalites, setFonctionnalites] = useState(demandeEdit?.fonctionnalites || "");
  const [delai, setDelai] = useState(demandeEdit?.delai || "");
  const [telephone, setTelephone] = useState(demandeEdit?.telephone || startup?.user?.telephone || startup?.telephone || "");
  const [email, setEmail] = useState(demandeEdit?.email || realUser?.email || "");
  const [secteur, setSecteur] = useState(demandeEdit?.secteur || startup?.secteur || "");

  const APPS = [
    { id: "web-app" as const, label: "Application Web", icon: <FaLaptopCode />, color: "#8B5CF6", desc: "Plateforme web, tableau de bord, portail client" },
    { id: "mobile" as const, label: "Application Mobile", icon: <FaMobile />, color: "#F59E0B", desc: "iOS & Android, native ou cross-platform" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeApp) { alert("Veuillez sélectionner un type d'application"); return; }
    if (!description.trim()) { alert("Veuillez décrire votre projet"); return; }
    onSubmit({ 
      service: "nos-plateformes", 
      domaine: "Développement Web / Mobile", 
      type_application: typeApp, 
      description, 
      objectif, 
      fonctionnalites, 
      delai, 
      telephone, 
      email, 
      secteur,
      demande_id: demandeEdit?.id 
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,.78)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(10,37,64,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#10B981,#059669)", padding: "22px 28px", borderRadius: "24px 24px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaArrowLeft size={16} /></button>
              <div>
                <div style={{ color: "rgba(255,255,255,.65)", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>{demandeEdit ? "Modifier la demande" : "Demande de développement"}</div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>Nos Plateformes</div>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, marginTop: 2 }}>⏱ 4 à 16 semaines</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "26px 28px" }}>
          <div style={{ background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)", border: "1.5px solid #A7F3D0", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheckCircle style={{ color: "#fff", fontSize: 10 }} /></div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "1.2px" }}>Informations</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <AutoField label="Téléphone" icon={<FaPhone />} value={telephone} onChange={setTelephone} />
              <AutoField label="Email" icon={<FaEnvelope />} value={email} onChange={setEmail} />
              <div style={{ gridColumn: "1 / -1" }}>
                <AutoField label="Secteur d'activité" icon={<FaBriefcase />} value={secteur} onChange={setSecteur} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px" }}>Votre projet</span>
            <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 12 }}>
              Type d'application <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {APPS.map(app => (
                <div key={app.id} onClick={() => setTypeApp(app.id)} style={{ border: `2px solid ${typeApp === app.id ? app.color : "#E2E8F0"}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", background: typeApp === app.id ? `${app.color}09` : "#FAFBFE", transition: "all .2s", position: "relative", overflow: "hidden" }}>
                  {typeApp === app.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${app.color},${app.color}88)` }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: `${app.color}15`, border: `1.5px solid ${app.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: app.color, fontSize: 18 }}>{app.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: typeApp === app.id ? app.color : "#0A2540" }}>{app.label}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{app.desc}</div>
                  {typeApp === app.id && (
                    <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", background: app.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaCheck style={{ color: "#fff", fontSize: 9 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <FL label="Objectif du projet" hint="Quel problème votre application doit-elle résoudre ?">
            <input className="inp" value={objectif} onChange={e => setObjectif(e.target.value)} placeholder="Ex: Automatiser la gestion des commandes, créer une marketplace..." />
          </FL>
          <FL label="Fonctionnalités souhaitées" hint="Listez les fonctionnalités clés attendues">
            <textarea className="inp" rows={3} value={fonctionnalites} onChange={e => setFonctionnalites(e.target.value)} placeholder="Ex: Authentification, paiement en ligne, tableau de bord, notifications push, chat..." style={{ resize: "none" }} />
          </FL>
          <FL label="Description du projet" required hint="Contexte métier, cible utilisateurs, contraintes techniques">
            <textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre projet : contexte, public cible, volume d'utilisateurs attendu, intégrations nécessaires..." style={{ resize: "none" }} required />
          </FL>
          <FL label="Délai de livraison souhaité">
            <SF value={delai} onChange={setDelai} options={DELAIS_LIST} placeholder="Choisissez un délai..." />
          </FL>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 12, padding: "12px 16px", marginBottom: 22 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><FaClock style={{ color: "#fff", fontSize: 10 }} /></div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>Devis détaillé fourni sous 24h ouvrées</div><div style={{ fontSize: 11.5, color: "#047857", marginTop: 2 }}>Un planning et une estimation complète vous seront proposés.</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
            <button type="submit" disabled={sending} style={{ background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", fontWeight: 800, fontSize: 13, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, opacity: sending ? .7 : 1, boxShadow: "0 4px 16px rgba(16,185,129,.4)" }}>
              {sending ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.5)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Envoi...</> : <><FaPaperPlane size={11} /> {demandeEdit ? "Modifier" : "Lancer mon projet"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormationDetailModal({ formationId, onClose }: { formationId: number; onClose: () => void }) {
  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/formations/public/${formationId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setFormation(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [formationId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,.8)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(10px)" }} onClick={onClose}>
      <div style={{ background: "#F8FAFC", borderRadius: 24, width: "100%", maxWidth: 760, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(10,37,64,.4)" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(248,250,252,.97)", borderBottom: "1px solid #E2E8F0" }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: "#475569" }}><FaArrowLeft size={10} /> Retour</button>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#64748B" }}><FaTimes /></button>
        </div>
        {loading ? <div style={{ padding: "80px 0", textAlign: "center" }}><div style={{ width: 36, height: 36, border: "4px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} /><p style={{ color: "#64748B", fontSize: 13 }}>Chargement...</p></div>
          : !formation ? <div style={{ padding: "80px 24px", textAlign: "center" }}><div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div><h2 style={{ fontWeight: 700, fontSize: 18, color: "#0A2540" }}>Formation introuvable</h2></div>
            : <>
              <div style={{ background: "linear-gradient(160deg,#0d2e52,#0A2540)", color: "#fff", padding: "28px 28px 24px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                  {(!formation.prix || formation.prix === 0) ? <span style={{ background: "rgba(16,185,129,.2)", color: "#6EE7B7", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✅ Gratuit</span> : <span style={{ background: "rgba(247,181,0,.15)", color: "#F7B500", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>💰 Payant</span>}
                  {formation.domaine && <span style={{ background: "rgba(255,255,255,.1)", borderRadius: 99, padding: "3px 10px", fontSize: 11 }}>{formation.domaine}</span>}
                  {formation.certifiante && <span style={{ background: "rgba(247,181,0,.15)", color: "#F7B500", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>🏅 Certifiante</span>}
                </div>
                <h1 style={{ fontWeight: 900, fontSize: "clamp(18px,2.5vw,26px)", lineHeight: 1.2, marginBottom: 10 }}>{formation.titre}</h1>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.8 }}>{formation.description}</p>
              </div>
              <div style={{ padding: "24px 28px" }}>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", padding: "18px 22px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontSize: 11, color: "#94A3B8", display: "block", marginBottom: 4 }}>Tarif</span><div style={{ fontSize: 26, fontWeight: 900, color: "#0A2540" }}>{(!formation.prix || formation.prix === 0) ? "Gratuit" : `${formation.prix} DT`}</div></div>
                    {formation.duree && <div><span style={{ fontSize: 11, color: "#94A3B8", display: "block", marginBottom: 4 }}>Durée</span><div style={{ fontSize: 15, fontWeight: 700, color: "#0A2540" }}>{formation.duree}</div></div>}
                    {formation.mode && <div><span style={{ fontSize: 11, color: "#94A3B8", display: "block", marginBottom: 4 }}>Mode</span><div style={{ fontSize: 15, fontWeight: 700, color: "#0A2540" }}>{formation.mode === "en_ligne" ? "En ligne" : formation.mode === "presentiel" ? "Présentiel" : formation.mode}</div></div>}
                  </div>
                </div>
                {formation.programme && <div style={{ marginTop: 16, background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", padding: "16px 20px" }}><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 10 }}>📚 Programme</div><div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: formation.programme }} /></div>}
                {formation.objectifs && <div style={{ marginTop: 12, background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", padding: "16px 20px" }}><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 10 }}>🎯 Objectifs</div><div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: formation.objectifs }} /></div>}
              </div>
            </>
        }
      </div>
    </div>
  );
}

function PodcastDetailModal({ podcast, onClose }: { podcast: any; onClose: () => void }) {
  let rawUrl = podcast.url_audio || podcast.url_video || podcast.video_url || podcast.url || podcast.lien || podcast.fichier || null;
  let videoUrl = rawUrl;
  if (rawUrl) {
    if (rawUrl.includes('youtube.com/watch?v=')) {
      const videoId = rawUrl.split('v=')[1]?.split('&')[0];
      if (videoId) videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } else if (rawUrl.includes('youtu.be/')) {
      const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    } else if (rawUrl.includes('vimeo.com/') && !rawUrl.includes('player.vimeo.com')) {
      const videoId = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) videoUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }
  const isLocalVideo = videoUrl && videoUrl.match(/\.(mp4|webm|ogg)$/i);
  const isEmbed = videoUrl && (videoUrl.includes('youtube.com/embed') || videoUrl.includes('player.vimeo.com') || videoUrl.includes('dailymotion.com/embed'));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 20, maxWidth: "90%", width: 800, maxHeight: "90%", overflow: "auto", padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{podcast.titre}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        {podcast.description && (
          <div style={{ padding: "12px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>{podcast.description}</p>
          </div>
        )}
        <div style={{ padding: 20 }}>
          {videoUrl ? (
            <div style={{ borderRadius: 12, overflow: "hidden", background: "#000" }}>
              {isLocalVideo ? (
                <video controls src={videoUrl} style={{ width: "100%", maxHeight: 450 }} />
              ) : isEmbed ? (
                <iframe 
                  src={videoUrl} 
                  style={{ width: "100%", height: 400, border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p>Lien : <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a></p>
                  <video controls src={videoUrl} style={{ width: "100%", maxHeight: 400 }} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 60, background: "#F3F0FF", borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Aucune vidéo trouvée</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Ce podcast n'a pas de fichier vidéo associé.</div>
            </div>
          )}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function FormationCard({ f, demanderFormation, demandeExiste, annulerDemandeFormation, onVoirDetail }: any) {
  const full = f.places_limitees && f.places_disponibles <= 0;
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEF6", overflow: "hidden", cursor: "pointer", transition: "all .25s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 14px 36px rgba(10,37,64,.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,158,11,.3)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "#E8EEF6"; }}>
      <div onClick={() => onVoirDetail(f.id)}>
        <div style={{ height: 120, position: "relative", background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden" }}>
          {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.85),rgba(10,37,64,.15))" }} />
          <div style={{ position: "absolute", top: 9, left: 9 }}>{f.certifiante && <span style={{ background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>CERTIF.</span>}</div>
          <div style={{ position: "absolute", bottom: 9, right: 9 }}><span style={{ background: f.prix ? "rgba(10,37,64,.85)" : "rgba(16,185,129,.85)", color: f.prix ? "#F59E0B" : "#fff", borderRadius: 99, padding: "3px 9px", fontSize: 11, fontWeight: 800 }}>{f.prix ? `${f.prix} DT` : "Gratuit"}</span></div>
        </div>
        <div style={{ padding: "12px 14px 10px" }}>
          {f.domaine && <div style={{ fontSize: 9.5, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>{f.domaine}</div>}
          <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 13.5, lineHeight: 1.3, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.titre}</h3>
          {f.duree && <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}><FaClock size={9} style={{ marginRight: 4 }} />{f.duree}</div>}
        </div>
      </div>
      <div style={{ padding: "0 12px 12px", display: "flex", gap: 7 }}>
        <button onClick={() => onVoirDetail(f.id)} style={{ flex: 1, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "inherit" }}>
          <FaExternalLinkAlt size={8} /> Détails
        </button>
        {demandeExiste ? (
          <button onClick={() => annulerDemandeFormation(f.id)} style={{ flex: 1, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "inherit" }}>
            <FaTimes size={8} /> Annuler
          </button>
        ) : (
          <button disabled={full} onClick={() => demanderFormation(f.id, f.titre)} style={{ flex: 1, background: full ? "#E2E8F0" : "#F59E0B", color: full ? "#64748B" : "#0A2540", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 11, cursor: full ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "inherit" }}>
            {full ? "Complet" : <><FaCheck size={8} /> S'inscrire</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL DASHBOARD STARTUP
// ============================================

export default function DashboardStartup() {
  const router = useRouter();
  const [realUser, setRealUser] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("accueil");
  const [activeService, setActiveService] = useState<ServiceSlug>("consulting");
  const [isOnline, setIsOnline] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Modals demandes
  const [showConsultingModal, setShowConsultingModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPlateformeModal, setShowPlateformeModal] = useState(false);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [sendingDemande, setSendingDemande] = useState(false);
  const [editingDemande, setEditingDemande] = useState<any>(null);

  // Témoignages - AJOUT DES ÉTATS POUR MODIFICATION/SUPPRESSION
  const [editingTemoignage, setEditingTemoignage] = useState<any>(null);

  // Experts
  const [experts, setExperts] = useState<any[]>([]);
  const [pubExperts, setPubExperts] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [expertFilter, setExpertFilter] = useState("");

  // RDV
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [propositions, setPropositions] = useState<any[]>([]);
  const [propositionsVues, setPropositionsVues] = useState<Set<number>>(new Set());
  const [rdvForm, setRdvForm] = useState({ expert_id: "", date_rdv: "", sujet: "" });
  const [editingRdv, setEditingRdv] = useState<any>(null);

  // Messages
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Témoignages
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [newTemo, setNewTemo] = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const [sendingTemo, setSendingTemo] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);

  // Demandes & Devis
  const [demandes, setDemandes] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);

  // Formations & Podcasts
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [formSearch, setFormSearch] = useState("");
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);

  // Profil
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ nom_startup: "", secteur: "", taille: "", site_web: "", description: "", fonction: "", localisation: "" });

  // Newsletter & Notifications
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readNewsIds, setReadNewsIds] = useState<Set<number>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Contact Admin
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminNewReplyCount, setAdminNewReplyCount] = useState(0);
  const [contactAdminForm, setContactAdminForm] = useState({ sujet: "", message: "" });
  const [sendingContactAdmin, setSendingContactAdmin] = useState(false);
  const [contactAdminStatus, setContactAdminStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactInfo, setContactInfo] = useState<{ email?: string; telephone?: string } | null>(null);

  // Scroll top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  useEffect(() => {
    const ho = () => setIsOnline(true), hf = () => setIsOnline(false);
    window.addEventListener("online", ho); window.addEventListener("offline", hf);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener("online", ho); window.removeEventListener("offline", hf); };
  }, []);

  function notify(text: string, ok = true) {
    const toastDiv = document.createElement("div");
    toastDiv.style.position = "fixed";
    toastDiv.style.top = "20px";
    toastDiv.style.right = "20px";
    toastDiv.style.zIndex = "9999";
    toastDiv.style.background = ok ? "#ECFDF5" : "#FEF2F2";
    toastDiv.style.border = `1.5px solid ${ok ? "#A7F3D0" : "#FECACA"}`;
    toastDiv.style.borderLeft = `4px solid ${ok ? "#059669" : "#DC2626"}`;
    toastDiv.style.color = ok ? "#059669" : "#DC2626";
    toastDiv.style.borderRadius = "11px";
    toastDiv.style.padding = "12px 18px";
    toastDiv.style.fontWeight = "700";
    toastDiv.style.fontSize = "13px";
    toastDiv.style.boxShadow = "0 8px 28px rgba(0,0,0,.1)";
    toastDiv.innerText = text;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 3500);
  }
  
  const forceLogout = useCallback(() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = "/connexion"; }, []);

  // Chargement des actualités
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE}/news/startup`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.canView === false) {
        setNotifications([]);
      } else {
        setNotifications(data.news || []);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const markNewsAsRead = (id: number) => {
    if (!readNewsIds.has(id)) {
      setReadNewsIds(prev => new Set(prev).add(id));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNewsIds(new Set(allIds));
    notify("✅ Toutes les actualités ont été marquées comme lues");
  };

  useEffect(() => {
    const stored = localStorage.getItem("startup_news_read");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        setReadNewsIds(new Set(arr));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("startup_news_read", JSON.stringify([...readNewsIds]));
  }, [readNewsIds]);

  useEffect(() => {
    const newUnread = notifications.filter(n => !readNewsIds.has(n.id)).length;
    setUnreadCount(newUnread);
  }, [notifications, readNewsIds]);

  // Newsletter
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) { notify("Veuillez saisir votre email", false); return; }
    setNlLoading(true);
    setNlError("");
    try {
      const r = await fetch(`${BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail, nom: startup?.nom_startup || `${realUser?.prenom} ${realUser?.nom}` })
      });
      const result = await r.json();
      if (r.ok && result.success) {
        setNlSent(true);
        setNlEmail("");
        notify("✅ Inscription newsletter réussie !");
        setTimeout(() => setNlSent(false), 5000);
        setTimeout(() => loadNotifications(), 1000);
      } else {
        setNlError(result.message || "Erreur lors de l'inscription.");
      }
    } catch {
      setNlError("Erreur réseau.");
    } finally {
      setNlLoading(false);
    }
  };

  // Chargement des données startup
  const loadStartupData = useCallback(async (token: string) => {
    const aHdr = { Authorization: `Bearer ${token}` };
    const ts = `?_=${Date.now()}`;
    const res = await fetch(`${BASE}/startups/moi${ts}`, { headers: aHdr });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const s = await res.json(); if (!s) throw new Error("NO_STARTUP");
    setStartup(s);
    setEditProfil({ nom_startup: s.nom_startup || "", secteur: s.secteur || "", taille: s.taille || "", site_web: s.site_web || "", description: s.description || "", fonction: s.fonction || "", localisation: s.localisation || "" });
    const [r1, r2, r3] = await Promise.all([
      fetch(`${BASE}/rendez-vous/startup${ts}`, { headers: aHdr }),
      fetch(`${BASE}/demandes-service/mes-demandes${ts}`, { headers: aHdr }),
      fetch(`${BASE}/temoignages/mes-temoignages${ts}`, { headers: aHdr }),
    ]);
    setRdvs(r1.ok ? await r1.json() : []);
    setDemandes(r2.ok ? await r2.json() : []);
    setTemoignages(r3.ok ? await r3.json() : []);
    return s;
  }, []);

  // Experts recommandés
  const loadRecommendedExperts = useCallback(async () => {
    setLoadingExperts(true);
    let list: any[] = [];
    try {
      if (!startup?.secteur) {
        const fb = await fetch(`${BASE}/experts/liste`);
        if (fb.ok) list = await fb.json();
      } else {
        const r = await fetch(`${BASE}/startups/experts-recommandes`, { headers: hdr() });
        if (r.ok) { list = await r.json(); if (!Array.isArray(list)) list = []; }
      }
    } catch {
      try {
        const fb = await fetch(`${BASE}/experts/liste`);
        if (fb.ok) list = await fb.json();
      } catch { setLoadingExperts(false); return; }
    }
    if (startup?.secteur && list.length) {
      const s = startup.secteur.toLowerCase().trim();
      const m = list.filter(ex => (ex.domaine || "").toLowerCase().includes(s) || s.includes((ex.domaine || "").toLowerCase()));
      list = [...m, ...list.filter(ex => !m.find((mm: any) => mm.id === ex.id))];
    }
    setExperts(list);
    setPubExperts(list.slice(0, 4));
    setLoadingExperts(false);
  }, [hdr, startup?.secteur]);

  // Messages avec experts
  const loadAllMessages = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() }); if (!r.ok) return;
      const msgs = await r.json();
      const chat = msgs.filter((m: any) => !m.contenu?.startsWith("__RDV_PROPOSAL__"));
      setAllMessages(chat);
      if (selectedExpert) {
        const eid = selectedExpert.user_id || selectedExpert.user?.id;
        setConversation(chat.filter((m: any) => (m.sender_id === eid && m.receiver_id === realUser?.id) || (m.sender_id === realUser?.id && m.receiver_id === eid)).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    } catch { }
  }, [hdr, realUser?.id, selectedExpert]);

  const loadConversation = useCallback(async (expertUserId: number) => {
    const ex = experts.find(e => (e.user_id || e.user?.id) === expertUserId);
    if (ex) { setSelectedExpert(ex); await loadAllMessages(); }
  }, [experts, loadAllMessages]);

  // Propositions de RDV
  const loadPropositions = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() }); if (!r.ok) return;
      const msgs = await r.json(); const props: any[] = [];
      for (const m of msgs) {
        if (m.contenu?.startsWith("__RDV_PROPOSAL__") && m.receiver_id === realUser?.id) {
          try {
            const lines = m.contenu.split("\n"); const obj: any = { id: m.id, createdAt: m.createdAt };
            for (const line of lines) {
              if (line.startsWith("rdv_id:")) obj.rdv_id = parseInt(line.replace("rdv_id:", "").trim());
              if (line.startsWith("nouvelle_date:")) obj.nouvelle_date = line.replace("nouvelle_date:", "").trim();
              if (line.startsWith("date_formatted:")) obj.date_formatted = line.replace("date_formatted:", "").trim();
              if (line.startsWith("raison:")) obj.raison = line.replace("raison:", "").trim();
            }
            obj.expert_name = m.sender ? `${m.sender.prenom || ""} ${m.sender.nom || ""}`.trim() : "Expert";
            obj.sender_id = m.sender_id;
            if (obj.rdv_id && obj.nouvelle_date) props.push(obj);
          } catch { }
        }
      }
      setPropositions(props);
    } catch { }
  }, [hdr, realUser?.id]);

  const repondreProposition = useCallback(async (p: any, accepter: boolean) => {
    if (!confirm(accepter ? "Accepter ce créneau ?" : "Refuser cette proposition ?")) return;
    if (accepter) {
      try {
        const r = await fetch(`${BASE}/rendez-vous/${p.rdv_id}/accepter-proposition`, { method: "PUT", headers: hdrJ(), body: JSON.stringify({ nouvelle_date: p.nouvelle_date }) });
        if (r.ok) { notify("✅ Créneau accepté !"); await loadStartupData(tk()); }
        else { await fetch(`${BASE}/rendez-vous/${p.rdv_id}`, { method: "PUT", headers: hdrJ(), body: JSON.stringify({ date_rdv: p.nouvelle_date }) }); notify("✅ Créneau accepté !"); await loadStartupData(tk()); }
      } catch { notify("Erreur réseau", false); }
    } else {
      try { await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: p.sender_id, contenu: `❌ Proposition refusée pour RDV #${p.rdv_id}.` }) }); notify("Proposition refusée."); } catch { notify("Erreur réseau", false); }
    }
    setPropositions(prev => prev.filter(x => x.id !== p.id));
    setPropositionsVues(prev => { const n = new Set(prev); n.add(p.id); return n; });
  }, [hdrJ, tk, loadStartupData]);

  // Demandes service
  const envoyerDemande = async (payload: any) => {
    setSendingDemande(true);
    try {
      let url = `${BASE}/demandes-service`;
      let method = "POST";
      if (payload.demande_id) {
        url = `${BASE}/demandes-service/client/${payload.demande_id}`;
        method = "PUT";
      }
      const r = await fetch(url, { method, headers: hdrJ(), body: JSON.stringify(payload) });
      if (r.ok) {
        notify(payload.demande_id ? "✅ Demande modifiée avec succès !" : "✅ Demande envoyée avec succès !");
        setShowConsultingModal(false); setShowAuditModal(false); setShowPlateformeModal(false); setShowFormationModal(false);
        setEditingDemande(null);
        const nd = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() });
        if (nd.ok) setDemandes(await nd.json());
        setTimeout(() => setTab("mes-demandes"), 800);
      } else notify("❌ Erreur lors de l'envoi", false);
    } catch { notify("❌ Erreur réseau", false); }
    finally { setSendingDemande(false); }
  };

  const ouvrirModificationDemande = (demande: any) => {
    setEditingDemande(demande);
    if (demande.service === "nos-plateformes") setShowPlateformeModal(true);
    else if (demande.service === "consulting") setShowConsultingModal(true);
    else if (demande.service === "audit-sur-site") setShowAuditModal(true);
    else if (demande.service === "formation-sur-mesure") setShowFormationModal(true);
  };

  const supprimerDemande = async (id: number) => {
    if (!confirm("Supprimer cette demande ?")) return;
    const r = await fetch(`${BASE}/demandes-service/client/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) { notify("✅ Supprimée"); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); } else notify("❌ Erreur", false);
  };

  // RDV
  const prendreRdv = async () => {
    if (!rdvForm.expert_id || !rdvForm.date_rdv || !rdvForm.sujet) { notify("Remplissez tous les champs", false); return; }
    let expertId = parseInt(rdvForm.expert_id, 10);
    if (isNaN(expertId)) {
      const expert = experts.find(e => e.user_id === parseInt(rdvForm.expert_id, 10));
      if (expert) expertId = expert.id;
      else { notify("Expert invalide", false); return; }
    }
    const r = await fetch(`${BASE}/rendez-vous`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_id: expertId, date_rdv: rdvForm.date_rdv, sujet: rdvForm.sujet }) });
    if (r.ok) { notify("✅ RDV demandé !"); setRdvForm({ expert_id: "", date_rdv: "", sujet: "" }); await loadStartupData(tk()); } else notify("❌ Erreur", false);
  };

  const annulerRdv = async (id: number) => {
    if (!confirm("Annuler ce RDV ?")) return;
    const r = await fetch(`${BASE}/rendez-vous/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) { notify("✅ RDV annulé"); await loadStartupData(tk()); } else notify("❌ Erreur", false);
  };

  const handleRdvUpdated = async () => {
    await loadStartupData(tk());
    notify("Liste des rendez-vous mise à jour");
  };

  // Témoignages - FONCTIONS CORRIGÉES
  const envoyerTemoignage = async () => {
    if (!newTemo.trim()) { notify("Veuillez écrire votre témoignage", false); return; }
    setSendingTemo(true);
    try {
      const r = await fetch(`${BASE}/temoignages`, { 
        method: "POST", 
        headers: hdrJ(), 
        body: JSON.stringify({ texte: newTemo, note: newTemoNote }) 
      });
      if (r.ok) { 
        notify("⭐ Témoignage envoyé !"); 
        setNewTemo(""); 
        setNewTemoNote(5); 
        await loadStartupData(tk()); 
        await loadPublicTestimonials();
      } else {
        const err = await r.text();
        notify(`❌ Erreur: ${err}`, false);
      }
    } catch { notify("❌ Erreur réseau", false); } 
    finally { setSendingTemo(false); }
  };

  // SUPPRIMER UN TÉMOIGNAGE
  const supprimerTemoignage = async (id: number) => {
    if (!confirm("Supprimer ce témoignage ? Cette action est irréversible.")) return;
    try {
      const r = await fetch(`${BASE}/temoignages/${id}`, { 
        method: "DELETE", 
        headers: hdr() 
      });
      if (r.ok) {
        notify("✅ Témoignage supprimé avec succès !");
        await loadStartupData(tk());
        await loadPublicTestimonials();
      } else {
        notify("❌ Erreur lors de la suppression", false);
      }
    } catch {
      notify("❌ Erreur réseau", false);
    }
  };

  // MODIFIER UN TÉMOIGNAGE
  const modifierTemoignage = async (id: number, data: { texte: string; note: number }) => {
    try {
      const r = await fetch(`${BASE}/temoignages/${id}`, { 
        method: "PUT", 
        headers: hdrJ(),
        body: JSON.stringify(data)
      });
      if (r.ok) {
        notify("✅ Témoignage modifié avec succès !");
        await loadStartupData(tk());
        await loadPublicTestimonials();
        return true;
      } else {
        notify("❌ Erreur lors de la modification", false);
        return false;
      }
    } catch {
      notify("❌ Erreur réseau", false);
      return false;
    }
  };

  const loadPublicTestimonials = useCallback(async () => { 
    const r = await fetch(`${BASE}/temoignages/publics`); 
    if (r.ok) setPubTemos(await r.json()); 
  }, []);

  // Formations & Podcasts
  const loadFormationsData = useCallback(async () => {
    setFormationsLoading(true);
    try {
      const f = await fetch(`${BASE}/formations/public`);
      if (f.ok) setFormations(await f.json());
      else setFormations([]);
      const p = await fetch(`${BASE}/podcasts/public`);
      if (p.ok) {
        let podcastsData = await p.json();
        podcastsData = podcastsData.map((pod: any) => {
          let rawUrl = pod.url_audio || pod.url_video || pod.video_url || pod.url || '';
          if (rawUrl && !rawUrl.startsWith('http')) {
            if (rawUrl.startsWith('/')) rawUrl = `${BASE}${rawUrl}`;
            else rawUrl = `${BASE}/uploads/podcasts-audio/${rawUrl}`;
          }
          return { ...pod, url_audio: rawUrl };
        });
        setPodcasts(podcastsData);
      } else {
        setPodcasts([]);
      }
    } catch (err) {
      setFormations([]);
      setPodcasts([]);
    } finally {
      setFormationsLoading(false);
    }
  }, []);

  const demanderFormation = async (id: number, titre: string) => {
    const r = await fetch(`${BASE}/demandes-service/formation/${id}`, { method: "POST", headers: hdr() });
    if (r.ok) { notify(`✅ Inscription à "${titre}" !`); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); loadFormationsData(); }
    else { const err = await r.json(); notify(`❌ ${err.message}`, false); }
  };

  const annulerDemandeFormation = async (formationId: number) => {
    const d = demandes.find(x => x.service === "formation" && (x.formationId === formationId || x.formation?.id === formationId));
    if (!d || !confirm("Annuler l'inscription ?")) return;
    const r = await fetch(`${BASE}/demandes-service/client/${d.id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) { notify("✅ Annulée !"); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); loadFormationsData(); }
  };

  const demandeExistePourFormation = (id: number) => demandes.some(d => d.service === "formation" && (d.formationId === id || d.formation?.id === id));

  // Devis
  const loadMesDevis = useCallback(async () => {
    try { const r = await fetch(`${BASE}/devis/client/mes-devis`, { headers: hdr() }); setMesDevis(r.ok ? await r.json() : []); } catch { setMesDevis([]); }
  }, [hdr]);

  const accepterDevis = async (id: number, expertData?: any) => {
    try {
      const r = await fetch(`${BASE}/devis/${id}/client-statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "accepte" }) });
      if (r.ok) {
        notify("✅ Devis accepté !");
        await loadMesDevis();
        await loadStartupData(tk());
        setTimeout(() => {
          if (confirm("Souhaitez-vous contacter l'expert pour démarrer la collaboration ?")) {
            if (expertData) {
              setSelectedExpert(expertData);
              setTab("messages");
              loadConversation(expertData.user_id || expertData.user?.id);
            }
          }
        }, 500);
      } else notify("❌ Erreur", false);
    } catch (err) { notify("❌ Erreur réseau", false); }
  };

  const refuserDevis = async (id: number) => {
    if (!confirm("Refuser ce devis ?")) return;
    const r = await fetch(`${BASE}/devis/${id}/client-statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
    if (r.ok) { notify("Devis refusé"); await loadMesDevis(); } else notify("Erreur", false);
  };

  // Profil
  const saveProfil = async () => {
    const r = await fetch(`${BASE}/startups/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(editProfil) });
    if (r.ok) { notify("✅ Profil sauvegardé !"); await loadStartupData(tk()); } else notify("❌ Erreur", false);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    const fd = new FormData(); fd.append("photo", photoFile);
    const r = await fetch(`${BASE}/startups/photo`, { method: "POST", headers: hdr(), body: fd });
    if (r.ok) { notify("✅ Photo mise à jour !"); await loadStartupData(tk()); setPhotoFile(null); setPhotoPreview(""); } else notify("Erreur upload", false);
  };

  // Messages admin
  const loadAdminMessages = useCallback(async () => {
    if (!realUser?.email) return;
    try {
      const r = await fetch(`${BASE}/contact/messages`, { headers: hdr() });
      if (r.ok) {
        const all = await r.json();
        const userEmail = realUser.email;
        const filtered = all.filter((msg: any) => msg.email === userEmail);
        setAdminMessages(filtered);
        const unreadReplies = filtered.filter((msg: any) => msg.admin_reply && !msg.is_read).length;
        setAdminNewReplyCount(unreadReplies);
      }
    } catch (err) {
      console.error("Erreur chargement messages admin", err);
    }
  }, [realUser?.email, hdr]);

  const envoyerMessageAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactAdminForm.message.trim()) return;
    setSendingContactAdmin(true);
    try {
      const r = await fetch(`${BASE}/contact/message`, {
        method: "POST",
        headers: hdrJ(),
        body: JSON.stringify({
          nom: startup?.nom_startup || "",
          prenom: realUser?.prenom || "",
          email: realUser?.email || "",
          subject: contactAdminForm.sujet || "Message d'une startup",
          message: contactAdminForm.message,
          client_type: "startup"
        })
      });
      if (r.ok) {
        setContactAdminStatus("success");
        setContactAdminForm({ sujet: "", message: "" });
        setTimeout(() => setContactAdminStatus("idle"), 5000);
        await loadAdminMessages();
        notify("✅ Message envoyé à l'administrateur");
      } else {
        setContactAdminStatus("error");
        notify("❌ Erreur lors de l'envoi", false);
      }
    } catch {
      setContactAdminStatus("error");
      notify("❌ Erreur réseau", false);
    } finally {
      setSendingContactAdmin(false);
    }
  };

  const loadContactInfo = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/histoire`);
      if (r.ok) {
        const d = await r.json();
        setContactInfo({ email: d.email_contact || "plateformebeh@gmail.com", telephone: d.telephone_contact || "29524360" });
      } else setContactInfo({ email: "plateformebeh@gmail.com", telephone: "29524360" });
    } catch { setContactInfo({ email: "plateformebeh@gmail.com", telephone: "29524360" }); }
  }, []);

  // Changement d'onglet
  const handleTabChange = useCallback((t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (t === "messages") { fetch(`${BASE}/messages/mark-all-read`, { method: "PATCH", headers: hdr() }).catch(() => {}); setAllMessages(prev => prev.map(m => ({ ...m, lu: true }))); }
    if (t === "rdv") { setPropositionsVues(prev => { const n = new Set(prev); propositions.forEach(p => n.add(p.id)); return n; }); }
    if (t === "notifications") loadNotifications();
    if (t === "contact_admin") { loadContactInfo(); loadAdminMessages(); }
  }, [hdr, propositions, loadNotifications, loadContactInfo, loadAdminMessages]);

  // Initialisation
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error("Auth failed");
        const user = await r.json();
        const normalizedRole = user.role?.toLowerCase();
        if (normalizedRole !== "startup") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          if (normalizedRole === "expert") router.replace("/dashboard/expert");
          else if (normalizedRole === "admin") router.replace("/dashboard/admin");
          else router.replace("/connexion");
          return;
        }
        setRealUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        await loadStartupData(token);
      })
      .catch(err => {
        setError("Impossible de charger vos données. Vérifiez votre connexion ou reconnectez-vous.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoadingAuth(false));
  }, []);

  useEffect(() => { if (realUser) loadNotifications(); }, [realUser]);
  useEffect(() => { if (startup?.secteur) loadRecommendedExperts(); }, [startup?.secteur, loadRecommendedExperts]);
  useEffect(() => { if (realUser?.id) loadPropositions(); }, [realUser?.id, loadPropositions]);
  useEffect(() => { if (tab === "messages") { loadAllMessages(); const i = setInterval(() => loadAllMessages(), 5000); return () => clearInterval(i); } }, [tab, loadAllMessages]);
  useEffect(() => { loadFormationsData(); loadPublicTestimonials(); loadMesDevis(); }, []);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  const unreadMsgCount = allMessages.filter(m => m.receiver_id === realUser?.id && !m.lu).length;
  const unreadPropositions = propositions.filter(p => !propositionsVues.has(p.id)).length;
  const pendingRdvCount = rdvs.filter(r => r.statut === "en_attente").length;
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const demandesEnCours = demandes.filter(d => d.statut === "en_cours").length;
  const mesDevisEnAttente = mesDevis.filter(d => d.statut === "en_attente").length;
  const secteurNorm = (startup?.secteur || "").toLowerCase().trim();
  const filteredExperts = experts.filter(e => !expertFilter || e.user?.nom?.toLowerCase().includes(expertFilter.toLowerCase()) || e.domaine?.toLowerCase().includes(expertFilter.toLowerCase())).map(e => ({ ...e, _sm: secteurNorm && ((e.domaine || "").toLowerCase().includes(secteurNorm) || secteurNorm.includes((e.domaine || "").toLowerCase())) }));
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];
  const domainesDisponibles = ["Tous", ...Array.from(new Set(formations.map(f => f.domaine || "Autres"))).filter(Boolean).sort()];
  const filteredFormations = formations.filter(f => (domaineFilter === "Tous" || f.domaine === domaineFilter) && (!formSearch || f.titre?.toLowerCase().includes(formSearch.toLowerCase())));
  const formsByDomaine: Record<string, any[]> = {};
  filteredFormations.forEach(f => { const d = f.domaine || "Autres"; if (!formsByDomaine[d]) formsByDomaine[d] = []; formsByDomaine[d].push(f); });
  const filteredPodcasts = podcasts.filter(p => (domaineFilter === "Tous" || p.domaine === domaineFilter) && (!formSearch || p.titre?.toLowerCase().includes(formSearch.toLowerCase())));

  const SERVICE_TABS: ServiceSlug[] = ["consulting", "audit-sur-site", "nos-plateformes", "formation-sur-mesure", "podcasts"];
  const TABS: { id: Tab; label: string }[] = [
    { id: "accueil", label: "Accueil" },
    { id: "services", label: "Services" },
    { id: "experts", label: "Experts" },
    { id: "rdv", label: "Rendez-vous" },
    { id: "messages", label: "Messages" },
    { id: "temoignages", label: "Témoignages" },
    { id: "mes-demandes", label: "Mes Demandes" },
    { id: "mes-devis", label: "Mes Devis" },
    { id: "notifications", label: "News" },
    { id: "profil", label: "Profil" },
    { id: "contact_admin", label: "Contacter administrateur" },
  ];

  const photoUrl = startup?.photo ? `${BASE}/uploads/photos/${startup.photo}` : null;
  const initials = realUser ? (realUser.prenom?.[0] || "") + (realUser.nom?.[0] || "") : "?";
  const showMsgBadge = tab !== "messages" && unreadMsgCount > 0;
  const showRdvBadge = tab !== "rdv" && (unreadPropositions > 0 || pendingRdvCount > 0);
  const showNotifBadge = tab !== "notifications" && unreadCount > 0;
  const showAdminReplyBadge = tab !== "contact_admin" && adminNewReplyCount > 0;

  if (loadingAuth) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div style={{ textAlign: "center" }}><div style={{ width: 44, height: 44, border: "4px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} /><div style={{ color: "#0A2540", fontWeight: 600, fontSize: 14 }}>Vérification des accès...</div></div></div>;
  if (error) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, textAlign: "center" }}><div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div><div style={{ fontSize: 17, fontWeight: 700, color: "#DC2626", marginBottom: 7 }}>Erreur</div><div style={{ color: "#64748B", marginBottom: 22 }}>{error}</div><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><button onClick={() => window.location.reload()} style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button><button onClick={() => { localStorage.removeItem("access_token"); window.location.href = "/connexion"; }} style={{ background: "#0A2540", color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Se reconnecter</button></div></div></div>;
  if (!realUser || !startup) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s,box-shadow .2s;}
        .inp:focus{border-color:#F59E0B;box-shadow:0 0 0 3px rgba(245,158,11,.08);}
        textarea.inp{resize:vertical;min-height:80px;}
        select.inp{appearance:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes scrollTopIn{from{opacity:0;transform:translateY(12px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}
        .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;border:none;border-radius:10px;cursor:pointer;padding:8px 16px;font-size:13px;transition:all .16s;display:inline-flex;align-items:center;gap:6px;line-height:1.4;}
        .btn-teal{background:#00BFA5;color:#fff;}.btn-teal:hover{background:#00897B;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:24px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 70px rgba(10,37,64,.22);}
        .scroll-top-btn{
          position:fixed;
          bottom:28px;
          right:28px;
          z-index:200;
          width:46px;
          height:46px;
          border-radius:50%;
          background:linear-gradient(135deg,#0A2540,#1a3f6f);
          border:2px solid rgba(245,158,11,.5);
          color:#F59E0B;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          box-shadow:0 6px 24px rgba(10,37,64,.28);
          transition:transform .2s,box-shadow .2s,border-color .2s;
          animation:scrollTopIn .25s ease;
        }
        .scroll-top-btn:hover{
          transform:translateY(-3px) scale(1.07);
          box-shadow:0 10px 32px rgba(10,37,64,.38);
          border-color:rgba(245,158,11,.9);
        }
        .scroll-top-btn:active{transform:scale(.95);}
        .admin-message-item{transition:all .18s;}
        .admin-message-item:hover{transform:translateX(5px);background:#FEFCE8;}
        .fade-up{animation:fadeInUp .4s ease-out;}
      `}</style>

      {showScrollTop && <button className="scroll-top-btn" onClick={scrollToTop} title="Retour en haut"><FaArrowUp size={16} /></button>}

      {/* Modals */}
      {selectedFormationId !== null && <FormationDetailModal formationId={selectedFormationId} onClose={() => setSelectedFormationId(null)} />}
      {selectedPodcast && <PodcastDetailModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} />}
      {showConsultingModal && <ServiceFormModal slug="consulting" startup={startup} realUser={realUser} onClose={() => { setShowConsultingModal(false); setEditingDemande(null); }} onSubmit={envoyerDemande} sending={sendingDemande} demandeEdit={editingDemande} />}
      {showAuditModal && <ServiceFormModal slug="audit-sur-site" startup={startup} realUser={realUser} onClose={() => { setShowAuditModal(false); setEditingDemande(null); }} onSubmit={envoyerDemande} sending={sendingDemande} demandeEdit={editingDemande} />}
      {showPlateformeModal && <PlateformeFormModal startup={startup} realUser={realUser} onClose={() => { setShowPlateformeModal(false); setEditingDemande(null); }} onSubmit={envoyerDemande} sending={sendingDemande} demandeEdit={editingDemande} />}
      {showFormationModal && <ServiceFormModal slug="formation-sur-mesure" startup={startup} realUser={realUser} onClose={() => { setShowFormationModal(false); setEditingDemande(null); }} onSubmit={envoyerDemande} sending={sendingDemande} demandeEdit={editingDemande} />}
      
      {/* Modal Edit Rendez-vous */}
      {editingRdv && (
        <ModalEditRendezVous 
          rendezVous={editingRdv}
          experts={experts}
          onClose={() => setEditingRdv(null)}
          onSave={handleRdvUpdated}
        />
      )}

      {/* Modal Edit Témoignage - AJOUTÉ */}
      {editingTemoignage && (
        <ModalEditTemoignage 
          temoignage={editingTemoignage}
          onClose={() => setEditingTemoignage(null)}
          onSave={() => {
            setEditingTemoignage(null);
            loadStartupData(tk());
            loadPublicTestimonials();
          }}
        />
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg,#0A2540 0%,#0c2d50 100%)", height: 64, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 rgba(255,255,255,.06),0 4px 20px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#0A2540", boxShadow: "0 2px 10px rgba(245,158,11,.35)" }}>BEH</div>
            <div style={{ lineHeight: 1.15 }}><div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5 }}>Business <span style={{ color: "#F59E0B" }}>Expert</span> Hub</div><div style={{ color: "rgba(255,255,255,.4)", fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>Espace Startup</div></div>
          </Link>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#F59E0B" }}>{initials}</div>
            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{startup?.nom_startup || `${realUser?.prenom} ${realUser?.nom}`}</div>{startup?.secteur && <div style={{ color: "rgba(255,255,255,.4)", fontSize: 10, lineHeight: 1 }}>{startup.secteur}</div>}</div>
          </div>
          <button 
            onClick={() => router.push("/")} 
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, color: "#fff" }}
          >
            <FaHome size={12} /> Retour au site
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 99, padding: "5px 11px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: isOnline ? "rgba(255,255,255,.65)" : "#FCA5A5" }}>{isOnline ? "En ligne" : "Hors ligne"}</span>
          </div>
          <button onClick={forceLogout} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12 }}>Déconnexion</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EEF2F8", position: "sticky", top: 64, zIndex: 90, boxShadow: "0 1px 6px rgba(10,37,64,.04)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 28px", display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map(t => {
            let badge: number | null = null;
            if (t.id === "messages" && showMsgBadge) badge = unreadMsgCount;
            if (t.id === "rdv" && showRdvBadge) badge = unreadPropositions + pendingRdvCount;
            if (t.id === "mes-demandes" && tab !== "mes-demandes" && (demandesEnAttente > 0 || demandesEnCours > 0)) badge = demandesEnAttente + demandesEnCours;
            if (t.id === "mes-devis" && tab !== "mes-devis" && mesDevisEnAttente > 0) badge = mesDevisEnAttente;
            if (t.id === "notifications" && showNotifBadge) badge = unreadCount;
            if (t.id === "contact_admin" && showAdminReplyBadge) badge = adminNewReplyCount;
            const isOn = tab === t.id;
            return (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: `2.5px solid ${isOn ? "#F59E0B" : "transparent"}`, cursor: "pointer", padding: "14px 14px", fontSize: 12.5, fontWeight: isOn ? 800 : 500, color: isOn ? "#0A2540" : "#8A9AB5", fontFamily: "inherit", transition: "all .18s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                {t.label}{badge !== null && badge > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 9.5, fontWeight: 900 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 28px" }}>
        
        {/* ==================== ACCUEIL ==================== */}
        {tab === "accueil" && (
          <div className="fade-up">
            {/* Hero Section */}
            <section style={{ position: "relative", overflow: "hidden", minHeight: 400, borderRadius: 18, marginBottom: 20 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.97) 0%,rgba(10,30,60,.84) 45%,rgba(10,37,64,.18) 100%)" }} />
              </div>
              <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "68px 32px 76px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 20, background: "rgba(245,158,11,.09)", border: "1px solid rgba(245,158,11,.22)", borderRadius: 99, padding: "5px 14px 5px 9px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", animation: "pulse 2s infinite", display: "inline-block" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F59E0B" }}>Bienvenue, {realUser?.prenom}</span>
                </div>
                <h1 style={{ fontSize: "clamp(26px,3.5vw,48px)", fontWeight: 900, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>Propulsez votre <span style={{ color: "#F59E0B" }}>startup</span><br />vers l'excellence</h1>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.62)", maxWidth: 460, lineHeight: 1.9, marginBottom: 28 }}>Accédez à nos experts certifiés, services exclusifs et ressources réservées aux membres BEH.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => handleTabChange("services")}>Explorer les services <FaArrowRight size={11} /></button>
                  <button style={{ background: "rgba(255,255,255,.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,.18)", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => handleTabChange("experts")}>Nos experts <FaArrowRight size={11} /></button>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
                  {[{ label: "Demandes", value: demandes.length, sub: "envoyées" }, { label: "RDV", value: rdvs.length, sub: "planifiés" }, { label: "Devis", value: mesDevis.length, sub: "reçus" }].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, padding: "10px 16px", backdropFilter: "blur(8px)" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>{s.value}</div>
                      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>{s.label} {s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ADN Section */}
            <section style={{ padding: "52px 0", background: "#F8FAFC", borderRadius: 18, marginBottom: 20 }}>
              <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(26px,4vw,42px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F59E0B" }}>ADN</span></h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                  {ADN_ITEMS.map((card, i) => (
                    <div key={i} onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(10,37,64,.06)", overflow: "hidden", cursor: "pointer" }}>
                      <div style={{ height: 3, background: `linear-gradient(90deg,${card.color},${card.color}55)` }} />
                      <div style={{ padding: "20px 20px 18px" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${card.color}13`, border: `1.5px solid ${card.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 17, color: card.color }}>{i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}</div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#0A2540", fontSize: 19, marginBottom: 7 }}>{card.title}</h3>
                        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.8, marginBottom: 10 }}>{card.body}</p>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: card.color }}>En savoir plus <FaArrowRight size={8} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Experts recommandés */}
            <section style={{ padding: "52px 0", background: "#fff", borderRadius: 18, marginBottom: 20 }}>
              <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(22px,3vw,36px)", color: "#0A2540" }}>Experts <span style={{ fontStyle: "italic", color: "#F59E0B" }}>recommandés</span></h2>
                    {startup?.secteur && <p style={{ fontSize: 12.5, color: "#64748B", marginTop: 3 }}>Sélectionnés pour : <strong style={{ color: "#0A2540" }}>{startup.secteur}</strong></p>}
                  </div>
                  <button style={{ background: "#0A2540", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={() => handleTabChange("experts")}>Tous les experts <FaArrowRight size={10} /></button>
                </div>
                {loadingExperts ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ width: 36, height: 36, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
                  : pubExperts.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>Aucun expert trouvé.</div>
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                        {pubExperts.map((ex) => {
                          const d = (ex.domaine || "").toLowerCase();
                          const isMatch = secteurNorm && (d.includes(secteurNorm) || secteurNorm.includes(d));
                          return (
                            <div key={ex.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", border: isMatch ? "1.5px solid rgba(245,158,11,.4)" : "1.5px solid #E8EEF6" }}>
                              {isMatch && <div style={{ position: "absolute", top: 9, left: 9, zIndex: 5, background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "2px 8px", fontSize: 9.5, fontWeight: 800 }}>⭐ Recommandé</div>}
                              <div style={{ height: 3, background: "linear-gradient(90deg,#0A2540,#F59E0B)" }} />
                              <div style={{ position: "relative", height: 140, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {ex.photo ? <img src={`${BASE}/uploads/photos/${ex.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => (ev.currentTarget.style.display = "none")} /> : <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(245,158,11,.2)", border: "3px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", fontWeight: 800, fontSize: 20 }}>{ex.user?.prenom?.[0]}{ex.user?.nom?.[0]}</div>}
                              </div>
                              <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540", marginBottom: 4 }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "2px 7px", display: "inline-block", marginBottom: 7 }}>{ex.domaine || "Expert"}</div>
                                {ex.description && <p style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.65, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ex.description}</p>}
                                <div style={{ display: "flex", gap: 7, marginTop: "auto" }}>
                                  <button style={{ flex: 1, background: "#0A2540", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => { setSelectedExpert(ex); setTab("messages"); loadConversation(ex.user_id || ex.user?.id); }}><FaComments size={11} /> Message</button>
                                  <button style={{ flex: 1, background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(ex.id), sujet: "" }); setTab("rdv"); }}><FaCalendar size={11} /> Rendez-vous</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                }
              </div>
            </section>

            {/* Témoignages publics */}
            {pubTemos.length > 0 && (
              <section style={{ padding: "52px 0", background: "#F8FAFC", borderRadius: 18, marginBottom: 20 }}>
                <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px" }}>
                  <div style={{ textAlign: "center", marginBottom: 32 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(22px,4vw,36px)", color: "#0A2540" }}>Ce que disent nos <span style={{ fontStyle: "italic", color: "#F59E0B" }}>clients</span></h2></div>
                  {curTemo && (
                    <div>
                      <div style={{ background: "#0A2540", borderRadius: 20, padding: "32px 40px", position: "relative", opacity: tAnim ? 0 : 1, transition: "opacity .3s" }}>
                        <FaQuoteLeft style={{ position: "absolute", top: 20, left: 26, fontSize: 28, color: "rgba(245,158,11,.13)" }} />
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F59E0B" : "#334155", fontSize: 18 }}>★</span>)}</div>
                        <p style={{ fontStyle: "italic", color: "#fff", lineHeight: 1.8, textAlign: "center", marginBottom: 22, fontSize: "clamp(14px,2vw,17px)" }}>&ldquo;{curTemo.texte}&rdquo;</p>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0A2540", margin: "0 auto 8px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                          <div style={{ color: "#F59E0B", fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginTop: 3 }}>{curTemo.startup?.nom_startup || "Startup BEH"}</div>
                        </div>
                      </div>
                      {pubTemos.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 18 }}>
                          <button onClick={() => { if (!tAnim) { setTAnim(true); setTimeout(() => { setTIdx((tIdx - 1 + pubTemos.length) % pubTemos.length); setTAnim(false); }, 280); } }} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(245,158,11,.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FaChevronLeft size={11} /></button>
                          <div style={{ display: "flex", gap: 5 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => { if (!tAnim) { setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280); } }} style={{ height: 5, width: i === tIdx ? 20 : 5, borderRadius: 99, border: "none", cursor: "pointer", background: i === tIdx ? "#F59E0B" : "rgba(10,37,64,.18)", transition: "all .3s" }} />)}</div>
                          <button onClick={() => { if (!tAnim) { setTAnim(true); setTimeout(() => { setTIdx((tIdx + 1) % pubTemos.length); setTAnim(false); }, 280); } }} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(245,158,11,.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FaChevronRight size={11} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Newsletter */}
            <section style={{ padding: "44px 0", background: "#fff", borderRadius: 18, marginTop: 20 }}>
              <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ borderRadius: 22, background: "#FFF8E1", border: "1px solid rgba(245,158,11,.2)", position: "relative", padding: "40px 44px", textAlign: "center", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(245,158,11,.07) 1px,transparent 1px)", backgroundSize: "34px 34px", pointerEvents: "none" }} />
                  <div style={{ position: "relative", zIndex: 10 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 15, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#0A2540", margin: "0 auto 18px" }}><FaEnvelope /></div>
                    <h2 style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 800, color: "#0A2540", marginBottom: 10 }}>Restez <span style={{ color: "#F59E0B" }}>informé</span></h2>
                    <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.85, maxWidth: 460, margin: "0 auto 28px" }}>Recevez nos actualités, formations et ressources exclusives pour accélérer votre croissance.</p>
                    {nlSent ? (
                      <div style={{ maxWidth: 380, margin: "0 auto", borderRadius: 12, padding: "16px 22px", color: "#059669", fontSize: 14, fontWeight: 700, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}><FaCheck size={14} /> Inscrit avec succès !</div>
                    ) : (
                      <form onSubmit={handleNewsletter} style={{ maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ position: "relative" }}>
                          <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                          <input type="email" value={nlEmail} onChange={e => { setNlEmail(e.target.value); setNlError(""); }} placeholder="Votre adresse e-mail" required style={{ width: "100%", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 11, padding: "13px 14px 13px 38px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, color: "#0A2540", outline: "none" }} />
                        </div>
                        <button type="submit" disabled={nlLoading} style={{ background: "#0A2540", color: "#F59E0B", border: "none", borderRadius: 11, padding: "14px", fontWeight: 800, fontSize: 14, cursor: nlLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: nlLoading ? .7 : 1 }}>
                          {nlLoading ? "⏳ Inscription..." : <><span>S'inscrire</span><FaArrowRight size={11} /></>}
                        </button>
                        {nlError && <div style={{ color: "#DC2626", fontSize: 12.5, textAlign: "center", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px" }}>{nlError}</div>}
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== SERVICES ==================== */}
        {tab === "services" && (
          <div className="fade-up">
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", padding: "6px 8px", marginBottom: 24, display: "flex", gap: 4, overflowX: "auto", flexWrap: "wrap" }}>
              {SERVICE_TABS.map(slug => {
                const svc = SERVICES_INFO[slug];
                const isOn = activeService === slug;
                return <button key={slug} onClick={() => setActiveService(slug)} style={{ background: isOn ? svc.color : "transparent", color: isOn ? "#fff" : "#64748B", border: `1.5px solid ${isOn ? svc.color : "#E8EEF6"}`, borderRadius: 9, padding: "8px 16px", fontSize: 12.5, fontWeight: isOn ? 800 : 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><span style={{ fontSize: 13 }}>{svc.icon}</span> {svc.label}</button>;
              })}
            </div>
            
            {/* Consulting */}
            {activeService === "consulting" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(59,130,246,.18)", overflow: "hidden" }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg,#3B82F6,#93C5FD)" }} />
                  <div style={{ padding: "28px 28px 24px" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(59,130,246,.1)", border: "1.5px solid rgba(59,130,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#3B82F6", marginBottom: 18 }}><FaChartLine /></div>
                    <h2 style={{ fontWeight: 900, color: "#0A2540", fontSize: 22, marginBottom: 10 }}>Consulting Stratégique</h2>
                    <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>Structurez et optimisez votre entreprise. Nos consultants certifiés vous accompagnent à chaque étape.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                      {["Audit stratégique complet", "Business model review", "Roadmap actionnable", "Suivi mensuel inclus"].map(p => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#334155" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheck style={{ fontSize: 8, color: "#3B82F6" }} /></div>{p}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#1D4ED8", fontWeight: 600 }}>⏱ Durée estimée : 2 à 8 semaines</div>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(59,130,246,.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", background: "rgba(59,130,246,.03)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>Faire une demande</div>
                    <div style={{ fontSize: 12, color: "#8A9AB5", marginTop: 2 }}>Réponse garantie sous 24h ouvrées</div>
                  </div>
                  <div style={{ padding: "24px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "#F0F9FF", border: "1.5px solid #BAE6FD", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Pré-rempli automatiquement</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#1D4ED8" }}><FaPhone size={10} /> {startup?.user?.telephone || startup?.telephone || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#1D4ED8" }}><FaEnvelope size={10} /> {realUser?.email || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#1D4ED8" }}><FaBriefcase size={10} /> {startup?.secteur || "Non renseigné"}</div>
                      </div>
                    </div>
                    <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.7 }}>Le formulaire complet comprend : domaine, description, objectif et délai souhaité.</div>
                    <div style={{ marginTop: "auto" }}>
                      <button onClick={() => setShowConsultingModal(true)} style={{ width: "100%", background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(59,130,246,.4)" }}>
                        <FaPaperPlane size={12} /> Soumettre ma demande
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Audit sur site */}
            {activeService === "audit-sur-site" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(139,92,246,.18)", overflow: "hidden" }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg,#8B5CF6,#C4B5FD)" }} />
                  <div style={{ padding: "28px 28px 24px" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(139,92,246,.1)", border: "1.5px solid rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#8B5CF6", marginBottom: 18 }}><FaSearchPlus /></div>
                    <h2 style={{ fontWeight: 900, color: "#0A2540", fontSize: 22, marginBottom: 10 }}>Audit sur Site</h2>
                    <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>Nos experts se déplacent directement dans vos locaux pour un diagnostic terrain approfondi.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                      {["Diagnostic terrain", "Analyse des processus", "Rapport détaillé", "Plan d'action prioritaire"].map(p => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#334155" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(139,92,246,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheck style={{ fontSize: 8, color: "#8B5CF6" }} /></div>{p}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#F3F0FF", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#7C3AED", fontWeight: 600 }}>⏱ Durée estimée : 1 à 5 jours</div>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(139,92,246,.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", background: "rgba(139,92,246,.03)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>Faire une demande</div>
                    <div style={{ fontSize: 12, color: "#8A9AB5", marginTop: 2 }}>Réponse garantie sous 24h ouvrées</div>
                  </div>
                  <div style={{ padding: "24px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "#F3F0FF", border: "1.5px solid #DDD6FE", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Pré-rempli automatiquement</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6D28D9" }}><FaPhone size={10} /> {startup?.user?.telephone || startup?.telephone || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6D28D9" }}><FaEnvelope size={10} /> {realUser?.email || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6D28D9" }}><FaBriefcase size={10} /> {startup?.secteur || "Non renseigné"}</div>
                      </div>
                    </div>
                    <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.7 }}>Le formulaire complet comprend : domaine, description, objectif et délai souhaité.</div>
                    <div style={{ marginTop: "auto" }}>
                      <button onClick={() => setShowAuditModal(true)} style={{ width: "100%", background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(139,92,246,.4)" }}>
                        <FaPaperPlane size={12} /> Soumettre ma demande
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Nos Plateformes */}
            {activeService === "nos-plateformes" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(16,185,129,.18)", overflow: "hidden" }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg,#10B981,#6EE7B7)" }} />
                  <div style={{ padding: "28px 28px 24px" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(16,185,129,.1)", border: "1.5px solid rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#10B981", marginBottom: 18 }}><FaDesktop /></div>
                    <h2 style={{ fontWeight: 900, color: "#0A2540", fontSize: 22, marginBottom: 10 }}>Nos Plateformes</h2>
                    <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>Solutions digitales sur mesure développées par nos ingénieurs experts.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      {[{ id: "web-app", label: "Application Web", icon: <FaLaptopCode />, color: "#8B5CF6", desc: "Dashboard, portail, marketplace" }, { id: "mobile", label: "Application Mobile", icon: <FaMobile />, color: "#F59E0B", desc: "iOS & Android, native ou cross-platform" }].map(app => (
                        <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 12, background: `${app.color}08`, border: `1px solid ${app.color}22`, borderRadius: 12, padding: "12px 14px" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${app.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: app.color, fontSize: 16 }}>{app.icon}</div>
                          <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>{app.label}</div><div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>{app.desc}</div></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#ECFDF5", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#047857", fontWeight: 600 }}>⏱ Durée estimée : 4 à 16 semaines</div>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(16,185,129,.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", background: "rgba(16,185,129,.03)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>Faire une demande</div>
                    <div style={{ fontSize: 12, color: "#8A9AB5", marginTop: 2 }}>Devis complet fourni sous 24h ouvrées</div>
                  </div>
                  <div style={{ padding: "24px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Pré-rempli automatiquement</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#047857" }}><FaPhone size={10} /> {startup?.user?.telephone || startup?.telephone || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#047857" }}><FaEnvelope size={10} /> {realUser?.email || "Non renseigné"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#047857" }}><FaBriefcase size={10} /> {startup?.secteur || "Non renseigné"}</div>
                      </div>
                    </div>
                    <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.7 }}>Choisissez le type d'application, décrivez vos fonctionnalités et objectifs.</div>
                    <div style={{ marginTop: "auto" }}>
                      <button onClick={() => setShowPlateformeModal(true)} style={{ width: "100%", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(16,185,129,.4)" }}>
                        <FaPaperPlane size={12} /> Lancer mon projet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Formations */}
            {activeService === "formation-sur-mesure" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 19, color: "#0A2540" }}>Formations disponibles</h2><p style={{ fontSize: 12.5, color: "#64748B" }}>{filteredFormations.length} formation(s)</p></div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => setShowFormationModal(true)} style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}><FaPaperPlane size={10} /> Formation sur mesure</button>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8EEF6", padding: "14px 16px", marginBottom: 18 }}>
                  <div style={{ position: "relative", marginBottom: 12 }}><FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 12 }} /><input className="inp" placeholder="Rechercher une formation..." style={{ paddingLeft: 34 }} value={formSearch} onChange={e => setFormSearch(e.target.value)} /></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{domainesDisponibles.map(d => <button key={d} onClick={() => setDomaineFilter(d)} style={{ border: `1.5px solid ${domaineFilter === d ? "#F59E0B" : "#E2E8F0"}`, borderRadius: 99, padding: "5px 13px", fontSize: 11.5, fontWeight: domaineFilter === d ? 700 : 600, cursor: "pointer", background: domaineFilter === d ? "#FEF3C7" : "#fff", color: domaineFilter === d ? "#92400E" : "#64748B", fontFamily: "inherit" }}>{d}</button>)}</div>
                </div>
                {formationsLoading ? <div style={{ textAlign: "center", padding: "56px 0" }}><div style={{ width: 36, height: 36, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
                  : filteredFormations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "56px 0" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>🎓</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 12 }}>Aucune formation trouvée</div>
                      <button onClick={() => setShowFormationModal(true)} style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><FaPaperPlane size={10} /> Demander une formation sur mesure</button>
                    </div>
                  ) : domaineFilter === "Tous" ? Object.entries(formsByDomaine).map(([domaine, fList]) => (
                    <div key={domaine} style={{ marginBottom: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, borderBottom: "1.5px solid #F1F5F9", paddingBottom: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FaGraduationCap size={13} /></div>
                        <h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540" }}>{domaine}</h3>
                        <span style={{ background: "#E8EEF6", borderRadius: 99, padding: "1px 8px", fontSize: 10.5, color: "#64748B" }}>{fList.length}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                        {fList.map(f => <FormationCard key={f.id} f={f} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} annulerDemandeFormation={annulerDemandeFormation} onVoirDetail={id => setSelectedFormationId(id)} />)}
                      </div>
                    </div>
                  )) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                      {filteredFormations.map(f => <FormationCard key={f.id} f={f} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} annulerDemandeFormation={annulerDemandeFormation} onVoirDetail={id => setSelectedFormationId(id)} />)}
                    </div>
                  )}
              </div>
            )}
            
            {/* Podcasts */}
            {activeService === "podcasts" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 19, color: "#0A2540" }}>Vidéos exclusives</h2><p style={{ fontSize: 12.5, color: "#64748B" }}>{filteredPodcasts.length} vidéo(s) disponibles</p></div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8EEF6", padding: "14px 16px", marginBottom: 18 }}>
                  <div style={{ position: "relative", marginBottom: 12 }}><FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 12 }} /><input className="inp" placeholder="Rechercher une vidéo..." style={{ paddingLeft: 34 }} value={formSearch} onChange={e => setFormSearch(e.target.value)} /></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Tous", ...Array.from(new Set(podcasts.map(p => p.domaine || ""))).filter(Boolean).sort()].map(d => <button key={d} onClick={() => setDomaineFilter(d)} style={{ border: `1.5px solid ${domaineFilter === d ? "#7C3AED" : "#E2E8F0"}`, borderRadius: 99, padding: "5px 13px", fontSize: 11.5, fontWeight: domaineFilter === d ? 700 : 600, cursor: "pointer", background: domaineFilter === d ? "#F3F0FF" : "#fff", color: domaineFilter === d ? "#7C3AED" : "#64748B", fontFamily: "inherit" }}>{d}</button>)}
                  </div>
                </div>
                {filteredPodcasts.length === 0 ? <div style={{ textAlign: "center", padding: "56px 0" }}><div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Aucune vidéo disponible</div></div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                      {filteredPodcasts.map(p => (
                        <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E8EEF6", overflow: "hidden", cursor: "pointer", transition: "all .25s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(124,58,237,.12)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                          onClick={() => setSelectedPodcast(p)}>
                          <div style={{ display: "flex" }}>
                            <div style={{ width: 120, flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 110 }}>
                              {p.image && <img src={`${BASE}/uploads/podcasts-images/${p.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .6, position: "absolute", inset: 0 }} />}
                              <div style={{ position: "relative", zIndex: 2, width: 44, height: 44, borderRadius: "50%", background: "rgba(139,92,246,.3)", border: "2px solid rgba(139,92,246,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaPlay style={{ color: "#C4B5FD", fontSize: 16, marginLeft: 2 }} /></div>
                            </div>
                            <div style={{ flex: 1, padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
                                <span style={{ background: "#F3F0FF", color: "#7C3AED", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🎬 Vidéo</span>
                                {p.domaine && <span style={{ background: "#F8FAFC", color: "#64748B", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>{p.domaine}</span>}
                              </div>
                              <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 13.5, lineHeight: 1.3, marginBottom: 6 }}>{p.titre}</h3>
                              {p.description && <p style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10 }}>{p.description}</p>}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                {p.auteur && <div style={{ fontSize: 11, color: "#8A9AB5" }}>{p.auteur}</div>}
                                <button style={{ background: "#8B5CF6", color: "#fff", border: "none", borderRadius: 8, padding: "6px 13px", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }} onClick={e => { e.stopPropagation(); setSelectedPodcast(p); }}><FaPlay size={9} /> Regarder</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}
          </div>
        )}

        {/* ==================== EXPERTS ==================== */}
        {tab === "experts" && (
          <div className="fade-up">
            <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}><FaSearch style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#B8C4D6", fontSize: 12 }} /><input className="inp" placeholder="Rechercher par nom ou domaine..." style={{ paddingLeft: 36 }} value={expertFilter} onChange={e => setExpertFilter(e.target.value)} /></div>
              <div style={{ color: "#8A9AB5", fontSize: 13, fontWeight: 600 }}>{filteredExperts.length} expert(s)</div>
            </div>
            {loadingExperts ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ width: 36, height: 36, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
              : filteredExperts.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>Aucun expert trouvé.</div>
                : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {filteredExperts.map(e => (
                    <div key={e.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: e._sm ? "1.5px solid rgba(245,158,11,.4)" : "1.5px solid #E8EEF6", transition: "transform .28s,box-shadow .28s" }}>
                      <div style={{ height: 3, background: "linear-gradient(90deg,#0A2540,#F59E0B)" }} />
                      <div style={{ position: "relative", height: 140, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {e._sm && <div style={{ position: "absolute", top: 9, left: 9, background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "2px 8px", fontSize: 9.5, fontWeight: 800 }}>⭐ Recommandé</div>}
                        {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => (ev.currentTarget.style.display = "none")} /> : <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(245,158,11,.2)", border: "3px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", fontWeight: 800, fontSize: 20 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div>}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>{e.user?.prenom} {e.user?.nom}</div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "2px 7px", display: "inline-block", marginBottom: 8 }}>{e.domaine || "Expert"}</div>
                        {e.description && <p style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.65, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.description}</p>}
                        <div style={{ display: "flex", gap: 7 }}>
                          <button style={{ flex: 1, background: "#0A2540", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => { setSelectedExpert(e); setTab("messages"); loadConversation(e.user_id || e.user?.id); }}><FaComments size={11} /> Message</button>
                          <button style={{ flex: 1, background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id), sujet: "" }); setTab("rdv"); }}><FaCalendar size={11} /> Rendez-vous</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ==================== RENDEZ-VOUS ==================== */}
        {tab === "rdv" && (
          <div className="fade-up">
            {/* Propositions de créneaux */}
            {propositions.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
                  <div><h3 style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>Propositions de nouveau créneau</h3><div style={{ fontSize: 11.5, color: "#8A9AB5" }}>{propositions.length} proposition(s)</div></div>
                </div>
                {propositions.map(p => (
                  <div key={p.id} style={{ background: "#fff", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "16px 18px", marginBottom: 12, borderLeft: "4px solid #F59E0B" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0A2540", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{p.expert_name?.[0] || "E"}</div>
                          <div><div style={{ fontWeight: 700, fontSize: 13.5, color: "#0A2540" }}>{p.expert_name}</div><div style={{ fontSize: 10.5, color: "#92400E" }}>{new Date(p.createdAt).toLocaleDateString("fr-FR")}</div></div>
                        </div>
                        <div style={{ background: "#FFFBEB", borderRadius: 9, padding: "11px 13px", border: "1px solid #FDE68A" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#92400E", marginBottom: 3 }}>Nouveau créneau proposé</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#0A2540" }}>📅 {p.date_formatted || new Date(p.nouvelle_date).toLocaleString("fr-FR")}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700 }} onClick={() => repondreProposition(p, true)}>✅ Accepter</button>
                        <button style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontWeight: 700 }} onClick={() => repondreProposition(p, false)}>❌ Refuser</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 1, background: "#E8EEF6", margin: "6px 0 20px" }} />
              </div>
            )}

            {/* Formulaire et liste des RDV */}
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 18 }}>
              {/* Formulaire de prise de RDV */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>Prendre un RDV</div></div>
                <div style={{ padding: "20px" }}>
                  <FL label="Expert" required>
                    <select className="inp" value={rdvForm.expert_id} onChange={e => setRdvForm({ ...rdvForm, expert_id: e.target.value })} required style={{ appearance: "none" }}>
                      <option value="">Sélectionner un expert...</option>
                      {experts.map(e => <option key={e.id} value={String(e.id)}>{e.user?.prenom} {e.user?.nom} — {e.domaine || "Expert"}</option>)}
                    </select>
                  </FL>
                  <FL label="Sujet" required><input className="inp" type="text" placeholder="Ex: Stratégie commerciale..." value={rdvForm.sujet} onChange={e => setRdvForm({ ...rdvForm, sujet: e.target.value })} /></FL>
                  <FL label="Date & heure" required><input className="inp" type="datetime-local" value={rdvForm.date_rdv} onChange={e => setRdvForm({ ...rdvForm, date_rdv: e.target.value })} min={new Date().toISOString().slice(0, 16)} /></FL>
                  <button style={{ width: "100%", background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={prendreRdv}><FaCalendar size={12} /> Confirmer le RDV</button>
                </div>
              </div>

              {/* Liste des RDV avec bouton MODIFIER */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 13 }}>Mes rendez-vous ({rdvs.length})</div>
                {rdvs.length === 0 ? (
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", padding: "40px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                    <div style={{ fontWeight: 600, color: "#8A9AB5" }}>Aucun rendez-vous planifié</div>
                  </div>
                ) : (
                  rdvs.map(r => (
                    <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E8EEF6", overflow: "hidden", marginBottom: 10 }}>
                      <div style={{ height: 3, background: r.statut === "en_attente" ? "#F59E0B" : r.statut === "confirme" ? "#10B981" : "#EF4444" }} />
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}><FaCalendar size={14} /></div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14, color: "#0A2540" }}>{r.expert?.user?.prenom} {r.expert?.user?.nom}</div>
                              <div style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", borderRadius: 99, padding: "1px 8px", display: "inline-block", marginTop: 2 }}>{r.expert?.domaine}</div>
                            </div>
                          </div>
                          {r.sujet && <div style={{ fontSize: 12.5, color: "#475569", fontWeight: 600, marginBottom: 5 }}>📌 {r.sujet}</div>}
                          <div style={{ fontSize: 12, color: "#64748B" }}><FaClock size={10} style={{ marginRight: 5 }} />{new Date(r.date_rdv).toLocaleString("fr-FR")}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
                          <RdvStatusBadge statut={r.statut} />
                          <div style={{ display: "flex", gap: 5 }}>
                            <button 
                              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 7, padding: "5px 11px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }} 
                              onClick={() => setEditingRdv(r)}
                            >
                              <FaEdit size={9} /> Modifier
                            </button>
                            {r.statut === "en_attente" && (
                              <button 
                                style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 7, padding: "5px 11px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }} 
                                onClick={() => annulerRdv(r.id)}
                              >
                                <FaTimes size={9} /> Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MESSAGES ==================== */}
        {tab === "messages" && (
          <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, height: "calc(100vh - 210px)" }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "13px 15px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 13.5, color: "#0A2540", background: "#FAFBFE" }}>Experts ({experts.length})</div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {experts.map(e => {
                  const eid = e.user_id || e.user?.id;
                  const unread = allMessages.filter(m => m.sender_id === eid && m.receiver_id === realUser?.id && !m.lu).length;
                  return (
                    <div key={e.id} onClick={() => { setSelectedExpert(e); loadConversation(eid); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", cursor: "pointer", background: selectedExpert?.id === e.id ? "#FFFBEB" : "transparent", borderLeft: `3px solid ${selectedExpert?.id === e.id ? "#F59E0B" : "transparent"}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F59E0B" }}>{e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 11 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</span>}</div>
                      <div style={{ overflow: "hidden", flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12.5, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 10.5, color: "#8A9AB5" }}>{e.domaine || "Expert"}</div></div>
                      {unread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 5px", fontSize: 9.5, fontWeight: 900 }}>{unread}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EEF6", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {!selectedExpert ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}><div style={{ fontSize: 42, marginBottom: 12 }}>💬</div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540", marginBottom: 4 }}>Sélectionnez un expert</div><div style={{ fontSize: 12.5 }}>pour démarrer une conversation</div></div>
              ) : (
                <>
                  <div style={{ padding: "13px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 11, background: "#FAFBFE" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #F59E0B" }}>{selectedExpert.photo ? <img src={`${BASE}/uploads/photos/${selectedExpert.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 12 }}>{selectedExpert.user?.prenom?.[0]}{selectedExpert.user?.nom?.[0]}</span>}</div>
                    <div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 13.5 }}>{selectedExpert.user?.prenom} {selectedExpert.user?.nom}</div><div style={{ fontSize: 11.5, color: "#8A9AB5" }}>{selectedExpert.domaine || "Expert"}</div></div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "13px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "32px 0", fontSize: 12.5 }}>Démarrez la conversation !</div>}
                    {conversation.map(m => {
                      const isMe = m.sender_id === realUser?.id;
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                          <div style={{ background: isMe ? "linear-gradient(135deg,#0A2540,#1a4080)" : "#F0F4FA", color: isMe ? "#fff" : "#0A2540", borderRadius: isMe ? "16px 16px 3px 16px" : "16px 16px 16px 3px", padding: "9px 14px", maxWidth: 400, fontSize: 13, lineHeight: 1.65 }}>
                            {m.contenu}<div style={{ fontSize: 10, opacity: .5, marginTop: 3, textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ padding: "11px 14px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 8, background: "#FAFBFE" }}>
                    <input className="inp" placeholder="Votre message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newMsg.trim()) { const rid = selectedExpert.user_id || selectedExpert.user?.id; fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) }).then(r => { if (r.ok) { setNewMsg(""); loadAllMessages(); } }); } }} style={{ flex: 1 }} />
                    <button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontWeight: 700 }} onClick={() => { if (!newMsg.trim()) return; const rid = selectedExpert.user_id || selectedExpert.user?.id; fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) }).then(r => { if (r.ok) { setNewMsg(""); loadAllMessages(); } }); }}><FaPaperPlane size={13} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================== TEMOIGNAGES ==================== */}
        {tab === "temoignages" && (
          <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Partager mon expérience</div></div>
              <div style={{ padding: "22px" }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 8 }}>Votre note</label>
                  <div style={{ display: "flex", gap: 3 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} onClick={() => setNewTemoNote(s)} style={{ fontSize: 28, cursor: "pointer", color: s <= newTemoNote ? "#F59E0B" : "#E2E8F0", transition: "color .2s" }}>★</span>)}<span style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, marginLeft: 8, alignSelf: "center" }}>{newTemoNote}/5</span></div>
                </div>
                <FL label="Votre témoignage"><textarea className="inp" rows={4} placeholder="Partagez votre expérience avec BEH..." value={newTemo} onChange={e => setNewTemo(e.target.value)} style={{ resize: "none" }} /></FL>
                <button style={{ width: "100%", background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={envoyerTemoignage} disabled={sendingTemo}>{sendingTemo ? "Envoi..." : <><FaPaperPlane size={11} /> Envoyer</>}</button>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Mes témoignages ({temoignages.length})</div></div>
              <div style={{ padding: "14px", maxHeight: 440, overflowY: "auto" }}>
                {temoignages.length === 0 ? <div style={{ padding: "36px 0", textAlign: "center", color: "#8A9AB5" }}>Aucun témoignage</div>
                  : temoignages.map(t => (
                    <div key={t.id} style={{ background: "#F8FAFC", borderRadius: 11, padding: "13px 15px", marginBottom: 9, border: "1px solid #E8EEF6" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F59E0B" : "#E2E8F0", fontSize: 14 }}>★</span>)}<span style={{ fontSize: 10.5, color: "#94A3B8", marginLeft: 5 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <span style={{ background: t.statut === "valide" ? "#ECFDF5" : t.statut === "refuse" ? "#FEF2F2" : "#FFF8E1", color: t.statut === "valide" ? "#059669" : t.statut === "refuse" ? "#DC2626" : "#B45309", borderRadius: 99, padding: "2px 9px", fontSize: 10.5, fontWeight: 700 }}>{t.statut === "valide" ? "✅ Publié" : t.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                          <button 
                            className="btn btn-blue" 
                            style={{ fontSize: 10, padding: "4px 7px" }} 
                            onClick={() => setEditingTemoignage(t)}
                          >
                            <FaEdit size={9} /> Modifier
                          </button>
                          <button 
                            className="btn btn-red" 
                            style={{ fontSize: 10, padding: "4px 7px" }} 
                            onClick={() => supprimerTemoignage(t.id)}
                          >
                            <FaTrash size={9} /> Supprimer
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MES DEMANDES ==================== */}
        {tab === "mes-demandes" && (
          <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>Mes demandes de service</h2><div style={{ fontSize: 12.5, color: "#8A9AB5", marginTop: 3 }}>{demandes.length} demande(s)</div></div>
              <button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={() => { setTab("services"); setActiveService("consulting"); }}><FaPaperPlane size={11} /> Nouvelle demande</button>
            </div>
            {demandes.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", padding: "72px 0", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📋</div><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 7 }}>Aucune demande</div><button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 9, padding: "11px 22px", fontWeight: 800, cursor: "pointer" }} onClick={() => setTab("services")}>Voir les services</button></div>
            ) : demandes.map(d => (
              <div key={d.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E8EEF6", marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: 3, background: `linear-gradient(90deg,${S_COLOR[d.statut] || "#94A3B8"},${S_COLOR[d.statut] || "#94A3B8"}44)` }} />
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540", marginBottom: 3 }}>{SERVICES_INFO[d.service]?.label || d.service}</div>
                      <div style={{ fontSize: 11.5, color: "#64748B", marginBottom: 7 }}>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</div>
                      {d.domaine && <div style={{ marginBottom: 6 }}><span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>🎯 {d.domaine}</span></div>}
                      {d.type_application && <div style={{ marginBottom: 6 }}><span style={{ background: "#F0FDF4", color: "#059669", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>📱 {d.type_application === "web-app" ? "Application Web" : "Application Mobile"}</span></div>}
                      <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>{d.description}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
                      <DemandStatutBadge statut={d.statut} />
                      <div style={{ display: "flex", gap: 5 }}>
                        {d.statut === "en_attente" && d.service !== "formation" && (
                          <>
                            <button style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 8, padding: "5px 11px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }} onClick={() => ouvrirModificationDemande(d)}><FaEdit size={9} /> Modifier</button>
                            <button style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 8, padding: "5px 11px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }} onClick={() => supprimerDemande(d.id)}><FaTrash size={9} /> Supprimer</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {mesDevis.filter(dv => dv.demande_id === d.id || dv.demandeId === d.id).length > 0 && (
                    <div style={{ marginTop: 16, borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 8 }}>📄 Devis reçus</div>
                      {mesDevis.filter(dv => dv.demande_id === d.id || dv.demandeId === d.id).map(dv => (
                        <div key={dv.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 8, border: "1px solid #E8EEF6" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{dv.montant?.toLocaleString()} DT</div><div style={{ fontSize: 11, color: "#64748B" }}>{dv.expert?.user?.prenom} {dv.expert?.user?.nom}</div></div>
                            <DevisStatusBadge statut={dv.statut} />
                            {dv.statut === "en_attente" && <div style={{ display: "flex", gap: 6 }}><button style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", borderRadius: 7, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }} onClick={() => accepterDevis(dv.id, dv.expert)}>Accepter</button><button style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 7, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }} onClick={() => refuserDevis(dv.id)}>Refuser</button></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== MES DEVIS ==================== */}
        {tab === "mes-devis" && (
          <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>Devis reçus</h2><div style={{ fontSize: 12.5, color: "#8A9AB5", marginTop: 3 }}>{mesDevis.length} devis</div></div>
              <button style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }} onClick={loadMesDevis}>🔄 Actualiser</button>
            </div>
            {mesDevis.length === 0 ? <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", padding: "72px 0", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📄</div><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 6 }}>Aucun devis reçu</div></div>
              : mesDevis.map(dv => (
                <div key={dv.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEF6", overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: 3, background: dv.statut === "en_attente" ? "#F59E0B" : dv.statut === "accepte" ? "#10B981" : "#EF4444" }} />
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 10, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(245,158,11,.4)" }}><span style={{ color: "#F59E0B", fontWeight: 900, fontSize: 16 }}>{dv.expert?.user?.prenom?.[0]}{dv.expert?.user?.nom?.[0]}</span></div>
                      <div><div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{dv.expert?.user?.prenom} {dv.expert?.user?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{dv.expert?.domaine}</div></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 5 }}>Montant proposé</div><div style={{ fontSize: 24, fontWeight: 900, color: "#0A2540" }}>{dv.montant?.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>DT</span></div></div>
                      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 5 }}>Statut</div><DevisStatusBadge statut={dv.statut} /></div>
                    </div>
                    {dv.description && <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}><p style={{ fontSize: 13, color: "#334155", lineHeight: 1.75, margin: 0 }}>{dv.description}</p></div>}
                    {dv.delai && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 99, padding: "4px 11px", marginBottom: 12, fontSize: 11.5, color: "#1D4ED8", fontWeight: 600 }}><FaClock size={9} /> Délai : {dv.delai}</div>}
                    
                    {dv.statut === "en_attente" && (
                      <div style={{ display: "flex", gap: 9 }}>
                        <button style={{ flex: 1, background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, cursor: "pointer" }} onClick={() => accepterDevis(dv.id, dv.expert)}><FaCheckDouble style={{ marginRight: 6 }} /> Accepter</button>
                        <button style={{ flex: 1, background: "#fff", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer" }} onClick={() => refuserDevis(dv.id)}><FaTimes style={{ marginRight: 6 }} /> Refuser</button>
                      </div>
                    )}
                    
                    {dv.statut === "accepte" && dv.expert && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ background: "#ECFDF5", borderRadius: 12, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>✅ Devis accepté — Vous pouvez maintenant contacter l'expert</div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button 
                            style={{ flex: 1, background: "#0A2540", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                            onClick={() => {
                              setSelectedExpert(dv.expert);
                              setTab("messages");
                              loadConversation(dv.expert.user_id || dv.expert.user?.id);
                            }}
                          >
                            <FaComments size={14} /> Envoyer un message
                          </button>
                          <button 
                            style={{ flex: 1, background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                            onClick={() => {
                              setRdvForm({ 
                                expert_id: String(dv.expert.id), 
                                date_rdv: "", 
                                sujet: `Suite au devis #${dv.id} - ${dv.expert.domaine || "Collaboration"}` 
                              });
                              setTab("rdv");
                            }}
                          >
                            <FaCalendar size={14} /> Rendez-vous
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ==================== NOTIFICATIONS (NEWS) ==================== */}
        {tab === "notifications" && (
          <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaBell style={{ color: "#0A2540", fontSize: 16 }} />
                  </div>
                  Actualités & Annonces
                  {unreadCount > 0 && (
                    <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 12, fontWeight: 700, marginLeft: 8 }}>
                      {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ background: "#F3F4F6", color: "#1F2937", border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <FaCheckDouble size={12} /> Tout marquer comme lu
                  </button>
                )}
                <button onClick={loadNotifications} style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <FaSync size={11} /> Actualiser
                </button>
              </div>
            </div>

            {notifLoading && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ width: 36, height: 36, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
                <div style={{ color: "#64748B", fontSize: 13 }}>Chargement...</div>
              </div>
            )}

            {!notifLoading && notifications.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", border: "1px solid #E8EEF6" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 6 }}>Aucune actualité</div>
                <p style={{ color: "#64748B", fontSize: 13 }}>Aucune news disponible pour le moment.</p>
              </div>
            )}

            {!notifLoading && notifications.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {notifications.map((notif) => {
                  const isRead = readNewsIds.has(notif.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNewsAsRead(notif.id)}
                      style={{
                        background: isRead ? "#fff" : "#FFFBEB",
                        border: `1.5px solid ${isRead ? "#E8EEF6" : "#FDE68A"}`,
                        borderRadius: 16,
                        padding: 20,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isRead ? "none" : "0 2px 8px rgba(245,158,11,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {notif.image && (
                          <img
                            src={`${BASE}/uploads/news/${notif.image}`}
                            style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover" }}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
                              {notif.categorie || "Actualité"}
                            </span>
                            <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>
                              {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            {!isRead && (
                              <span style={{ background: "#FEF3C7", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                                Nouveau
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540", marginBottom: 8 }}>{notif.titre}</h3>
                          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{notif.description}</p>
                          {notif.attachment && (
                            <div style={{ marginTop: 12 }}>
                              <a
                                href={`${BASE}/uploads/news/${notif.attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F3F4F6", color: "#1F2937", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                              >
                                <FaFileAlt size={12} /> Télécharger le document joint
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== PROFIL ==================== */}
        {tab === "profil" && (
          <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8EEF6", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "24px 22px", display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "rgba(245,158,11,.15)", border: "3px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={e => (e.currentTarget.style.display = "none")} /> : <span style={{ color: "#F59E0B", fontWeight: 900, fontSize: 24 }}>{initials}</span>}
                  </div>
                  <label style={{ position: "absolute", bottom: -1, right: -1, width: 24, height: 24, background: "#F59E0B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #0A2540" }}>
                    <FaCamera style={{ fontSize: 10, color: "#0A2540" }} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{realUser?.prenom} {realUser?.nom}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{startup?.nom_startup} · {realUser?.email}</div>
                  {photoFile && <button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 8, padding: "6px 13px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", marginTop: 10 }} onClick={uploadPhoto}><FaCheck size={10} /> Sauvegarder</button>}
                </div>
              </div>
              <div style={{ padding: "22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[{ k: "nom_startup", l: "Nom startup" }, { k: "secteur", l: "Secteur" }, { k: "fonction", l: "Fonction" }, { k: "localisation", l: "Localisation" }, { k: "site_web", l: "Site web" }].map(f => (
                    <div key={f.k}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>{f.l}</label>
                      <input className="inp" value={(editProfil as any)[f.k] || ""} onChange={e => setEditProfil({ ...editProfil, [f.k]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Taille équipe</label>
                    <SF value={editProfil.taille || ""} onChange={v => setEditProfil({ ...editProfil, taille: v })} options={["1-5 personnes", "6-15 personnes", "16-50 personnes", "51-100 personnes", "100+ personnes"]} placeholder="Sélectionner" />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Description</label>
                  <textarea className="inp" rows={3} value={editProfil.description || ""} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} style={{ resize: "none" }} />
                </div>
                <button style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={saveProfil}><FaCheck size={12} /> Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CONTACTER ADMINISTRATEUR ==================== */}
        {tab === "contact_admin" && (
          <div className="fade-up">
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 20, padding: "36px 40px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
              <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaHeadset style={{ color: "#F59E0B", fontSize: 28 }} /></div>
                <div>
                  <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 5 }}>Support et Assistance</div>
                  <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)", marginBottom: 8 }}>Contacter l'Administrateur</h1>
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 520 }}>Besoin d'aide, d'une information ou d'un signalement ? Notre équipe vous répond rapidement.</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                { icon: <FaEnvelope size={22} />, title: "Envoyer un e-mail", subtitle: "Email direct", value: contactInfo?.email || "plateformebeh@gmail.com", href: `mailto:${contactInfo?.email || "plateformebeh@gmail.com"}?subject=${encodeURIComponent("Message Startup - " + (startup?.nom_startup || ""))}&body=${encodeURIComponent("Bonjour,\n\nJe suis " + (realUser?.prenom || "") + " " + (realUser?.nom || "") + " (" + (realUser?.email || "") + "), représentant la startup " + (startup?.nom_startup || "") + ".\n\n")}`, color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
                { icon: <FaPhone size={22} />, title: "Appeler l'équipe", subtitle: "Téléphone direct", value: `+216 ${contactInfo?.telephone || "29524360"}`, href: `tel:+216${(contactInfo?.telephone || "29524360").replace(/\s/g, "")}`, color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
              ].map((card, i) => (
                <a key={i} href={card.href} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", border: `1.5px solid ${card.border}`, borderRadius: 18, padding: "24px", display: "flex", alignItems: "center", gap: 20, textDecoration: "none", transition: "all .22s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = card.color; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 32px ${card.color}20`; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = card.border; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>{card.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{card.subtitle}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: card.color, fontWeight: 600 }}>{card.value}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: card.color }}><FaArrowRight size={14} /></div>
                </a>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Formulaire d'envoi de message */}
              <div className="card">
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><FaPaperPlane style={{ color: "#F59E0B" }} size={16} /> Envoyer un message</div>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Votre message sera transmis à l'administrateur.</div>
                </div>
                <div style={{ padding: "24px" }}>
                  {contactAdminStatus === "success" && <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#059669" }}><FaCheckCircle size={16} /> Message envoyé avec succès !</div>}
                  {contactAdminStatus === "error" && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#DC2626" }}><FaExclamationTriangle size={16} /> Erreur. Essayez par email directement.</div>}
                  <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Vos informations</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>Nom startup</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{startup?.nom_startup || "—"}</div>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>Email</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{realUser?.email || "—"}</div>
                      </div>
                    </div>
                  </div>
                  <form onSubmit={envoyerMessageAdmin}>
                    <div style={{ marginBottom: 16 }}>
                      <FL label="Sujet">
                        <select className="inp" value={contactAdminForm.sujet} onChange={e => setContactAdminForm({ ...contactAdminForm, sujet: e.target.value })}>
                          <option value="">— Sélectionnez un sujet —</option>
                          <option value="Demande d'information">Demande d'information</option>
                          <option value="Problème technique">Problème technique</option>
                          <option value="Signalement">Signalement</option>
                          <option value="Formation ou podcast">Formation / Podcast</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </FL>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <FL label="Message *">
                        <textarea className="inp" rows={6} required placeholder="Décrivez votre demande en détail..." value={contactAdminForm.message} onChange={e => setContactAdminForm({ ...contactAdminForm, message: e.target.value })} />
                      </FL>
                    </div>
                    <button type="submit" style={{ width: "100%", background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={sendingContactAdmin}>
                      {sendingContactAdmin ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi en cours...</> : <><FaPaperPlane size={14} /> Envoyer le message</>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Historique des échanges */}
              <div className="card">
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><FaComments style={{ color: "#F59E0B" }} size={16} /> Historique des échanges</div>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Vos messages et les réponses de l'administrateur.</div>
                </div>
                <div style={{ padding: "16px", maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                  {adminMessages.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                      <FaEnvelope size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
                      <div>Aucun message échangé.</div>
                      <div style={{ fontSize: 12 }}>Utilisez le formulaire pour contacter l'administrateur.</div>
                    </div>
                  ) : (
                    adminMessages
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((msg) => (
                        <div key={msg.id} className="admin-message-item" style={{ background: msg.admin_reply ? "#F0FDF4" : "#FFF8E1", borderRadius: 12, padding: "14px 16px", border: `1px solid ${msg.admin_reply ? "#DCFCE7" : "#FDE68A"}`, transition: "all .2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.admin_reply ? "#10B981" : "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                              {msg.admin_reply ? "A" : "S"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: msg.admin_reply ? "#065F46" : "#92400E" }}>{msg.admin_reply ? "Administrateur BEH" : startup?.nom_startup || "Votre startup"}</div>
                              <div style={{ fontSize: 10, color: "#94A3B8" }}>{new Date(msg.createdAt).toLocaleString("fr-FR")}</div>
                            </div>
                            {!msg.is_read && msg.admin_reply && (
                              <span style={{ marginLeft: "auto", background: "#FEF3C7", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Nouvelle réponse</span>
                            )}
                          </div>
                          <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, marginBottom: 6 }}>{msg.message}</div>
                          {msg.admin_reply && (
                            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #DCFCE7" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", marginBottom: 3 }}>📨 Réponse de l'administrateur :</div>
                              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{msg.admin_reply}</div>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", background: "#FAFBFE", fontSize: 11, color: "#94A3B8", textAlign: "center" }}>
                  Les réponses apparaîtront ici dès que l'administrateur vous répondra.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: "#0A2540", color: "#fff", padding: "24px 28px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 40 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 9, color: "#0A2540" }}>BEH</div>
          <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,.35)" }}>© 2026 Business Expert Hub · Tous droits réservés</p>
        </div>
      </footer>
    </>
  );
}