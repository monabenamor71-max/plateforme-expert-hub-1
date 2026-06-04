"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaStar, FaPaperPlane,
  FaCheck, FaCamera, FaCalendar, FaCheckCircle,
  FaTimes, FaEdit, FaTrash, FaSave, FaHeadphones,
  FaPlus, FaFileAudio, FaImage, FaInfoCircle, FaSync,
  FaSpinner, FaArrowLeft, FaMicrophone, FaUser, FaEnvelope,
  FaPhone, FaBuilding, FaTag, FaClock, FaBriefcase,
  FaTimesCircle, FaEye, FaExclamationTriangle, FaCertificate,
  FaDownload, FaMedal, FaGraduationCap, FaBell, FaNewspaper,
  FaCalendarAlt, FaHome, FaUserCircle, FaBook, FaPodcast,
  FaClipboardList, FaFileInvoiceDollar, FaComments, FaCalendarCheck,
  FaBullhorn, FaHeadset, FaSignOutAlt, FaChevronLeft as FaLeft,
  FaChartLine, FaLaptopCode, FaCog, FaSearch, FaFilter,
  FaChevronDown, FaCheckDouble, FaVideo, FaYoutube, FaLink,
  FaFilePdf, FaUpload, FaFileAlt,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F7B500", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

const DOMAINES_LIST = [
  "Marketing Digital", "Finance / Comptabilité", "Ressources Humaines",
  "Développement Web / Mobile", "Design UI/UX", "Stratégie Commerciale",
  "Logistique / Supply Chain", "Intelligence Artificielle / Data",
  "Management", "Communication", "Juridique", "Autre",
];
const NIVEAUX_LIST = ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"];
const MODES_LIST = [
  { value: "en_ligne", label: "En ligne" },
  { value: "presentiel", label: "Présentiel" },
  { value: "hybride", label: "Hybride" },
];

type Tab = "accueil" | "profil" | "formations" | "podcasts" | "demandes" | "devis" | "messages" | "rdv" | "contact_admin" | "notifications";

function useInView(thr = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
  }, []);
  return [ref, v] as const;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>{children}</label>;
}

// Composant FL (Field Label) utilisé dans contact_admin
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

// ==================== MODAL CERTIFICATION ====================
function CertificationModal({ formation, clientInfo, expertInfo, onClose, onSend }: {
  formation: any; clientInfo: any; expertInfo: any;
  onClose: () => void; onSend: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({ 
    nom_beneficiaire: `${clientInfo?.prenom || ""} ${clientInfo?.nom || ""}`.trim(), 
    titre_formation: formation?.titre || "", 
    date_completion: new Date().toISOString().split("T")[0], 
    mention: "Très bien", 
    duree: formation?.duree || "", 
    note: "", 
    message_personnalise: "",
    email_client: clientInfo?.email || "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState("");
  const [sending, setSending] = useState(false);
  const MENTIONS = ["Passable", "Assez bien", "Bien", "Très bien", "Excellent", "Félicitations du jury"];

  const handleSend = async () => {
    if (!form.nom_beneficiaire.trim() || !form.titre_formation.trim()) { 
      alert("Veuillez remplir tous les champs obligatoires."); 
      return; 
    }
    if (!form.email_client.trim()) {
      alert("L'email du client est requis pour l'envoi de la certification.");
      return;
    }
    setSending(true);
    try { 
      const formData = new FormData();
      formData.append("nom_beneficiaire", form.nom_beneficiaire);
      formData.append("titre_formation", form.titre_formation);
      formData.append("date_completion", form.date_completion);
      formData.append("mention", form.mention);
      formData.append("duree", form.duree);
      formData.append("note", form.note);
      formData.append("message_personnalise", form.message_personnalise);
      formData.append("email_client", form.email_client);
      formData.append("formation_id", formation?.id || "");
      formData.append("client_id", clientInfo?.id || "");
      if (pdfFile) {
        formData.append("certificat_pdf", pdfFile);
      }
      
      await onSend(formData); 
      onClose(); 
    }
    catch (err) { 
      alert("Erreur lors de l'envoi de la certification."); 
    }
    finally { setSending(false); }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a4a8a)", padding: "22px 28px", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaCertificate style={{ color: "#F7B500", fontSize: 22 }} />
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Espace Expert</div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>Envoyer une certification</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
          </div>
        </div>
        <div style={{ padding: "24px 28px", maxHeight: "62vh", overflowY: "auto" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><Lbl>Email du client *</Lbl><input className="inp" type="email" value={form.email_client} onChange={e => setForm({ ...form, email_client: e.target.value })} placeholder="client@email.com" required /></div>
              <div><Lbl>Nom du bénéficiaire *</Lbl><input className="inp" value={form.nom_beneficiaire} onChange={e => setForm({ ...form, nom_beneficiaire: e.target.value })} /></div>
              <div><Lbl>Titre de la formation *</Lbl><input className="inp" value={form.titre_formation} onChange={e => setForm({ ...form, titre_formation: e.target.value })} /></div>
              <div><Lbl>Date de complétion</Lbl><input className="inp" type="date" value={form.date_completion} onChange={e => setForm({ ...form, date_completion: e.target.value })} /></div>
              <div><Lbl>Durée</Lbl><input className="inp" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="Ex: 2 jours, 16 heures" /></div>
              <div><Lbl>Mention</Lbl><select className="inp" value={form.mention} onChange={e => setForm({ ...form, mention: e.target.value })}>{MENTIONS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              <div><Lbl>Note (optionnelle)</Lbl><input className="inp" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ex: 18/20" /></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Lbl>Fichier PDF de certification (optionnel)</Lbl>
              <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); setPdfPreview(f.name); } }} style={{ display: "none" }} />
                {pdfPreview ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaFilePdf style={{ color: "#EF4444", fontSize: 24 }} />
                    <span style={{ fontSize: 13, color: "#0A2540" }}>{pdfPreview}</span>
                    <button type="button" onClick={() => { setPdfFile(null); setPdfPreview(""); }} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer" }}><FaTimes /></button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <FaUpload style={{ fontSize: 28, color: "#94A3B8", marginBottom: 6 }} />
                    <div style={{ fontSize: 12, color: "#64748B" }}>Cliquer pour importer un PDF personnalisé</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Si aucun fichier, un PDF sera généré automatiquement</div>
                  </div>
                )}
              </label>
            </div>
            <div><Lbl>Message personnalisé</Lbl><textarea className="inp" rows={4} value={form.message_personnalise} onChange={e => setForm({ ...form, message_personnalise: e.target.value })} placeholder="Félicitations ! Vous avez brillamment complété cette formation..." /></div>
          </div>
        </div>
        <div style={{ padding: "16px 28px 22px", borderTop: "1px solid #F1F5F9", background: "#FAFBFE", borderRadius: "0 0 24px 24px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
          <button onClick={handleSend} disabled={sending || !form.nom_beneficiaire.trim() || !form.titre_formation.trim() || !form.email_client.trim()} style={{ background: sending ? "#E2E8F0" : "linear-gradient(135deg,#059669,#047857)", color: sending ? "#94A3B8" : "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 14, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
            {sending ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi...</> : <><FaCertificate size={14} /> Envoyer par email</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL MISSION DETAIL ====================
function MissionDetailModal({ mission, onClose, onAccepter, onRefuser }: {
  mission: any; onClose: () => void;
  onAccepter: (mission: any) => void; onRefuser: (id: number) => void;
}) {
  const client = mission?.user;
  const startup = client?.startup;
  const isActionnable = ["en_attente", "notifie", "notifie_experts", "devis_envoye"].includes(mission?.statut);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a4a8a)", padding: "24px 28px", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaClipboardList style={{ color: "#F7B500", fontSize: 22 }} />
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Détail de la mission</div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{mission?.service}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ background: "rgba(247,181,0,.2)", color: "#F7B500", border: "1px solid rgba(247,181,0,.3)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                    {mission?.statut === "devis_envoye" ? "Devis envoyé" : isActionnable ? "En attente de réponse" : mission?.statut === "en_cours" ? "En cours" : mission?.statut === "terminee" ? "Terminée" : "Refusée"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
          </div>
        </div>
        <div style={{ padding: "24px 28px", maxHeight: "65vh", overflowY: "auto" }}>
          {mission?.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #E8EEF6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Description de la demande</div>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, margin: 0 }}>{mission.description}</p>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0A2540", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 2, background: "#F7B500", borderRadius: 2 }} />Informations du client
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: <FaUser size={12} />, label: "Nom complet", val: `${client?.prenom || "—"} ${client?.nom || ""}`, color: "#3B82F6" },
                { icon: <FaEnvelope size={12} />, label: "Email", val: client?.email || "—", color: "#10B981" },
                { icon: <FaPhone size={12} />, label: "Téléphone", val: mission?.telephone || client?.telephone || "Non renseigné", color: "#F7B500" },
                { icon: <FaTag size={12} />, label: "Service demandé", val: mission?.service || "—", color: "#8B5CF6" },
              ].map((row, i) => (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #E8EEF6", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${row.color}12`, color: row.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{row.icon}</div>
                  <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{row.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540", wordBreak: "break-all" }}>{row.val}</div></div>
                </div>
              ))}
            </div>
          </div>
          {startup && (
            <div style={{ marginBottom: 20, background: "linear-gradient(135deg,#0A2540,#0f3060)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Informations de la startup</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaRocket style={{ color: "#F7B500", fontSize: 20 }} /></div>
                <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{startup.nom_startup || "—"}</div><div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 2 }}>{startup.secteur || "Secteur non précisé"}</div></div>
              </div>
            </div>
          )}
          {(mission?.delai || mission?.objectif) && (
            <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Attentes du client</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {mission.delai && <div style={{ background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #A7F3D0" }}><div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Délai souhaité</div><div style={{ fontWeight: 700, color: "#059669" }}>{mission.delai}</div></div>}
                {mission.objectif && <div style={{ background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #A7F3D0", flex: 1, minWidth: 200 }}><div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Objectif principal</div><div style={{ fontWeight: 700, color: "#059669" }}>{mission.objectif}</div></div>}
              </div>
            </div>
          )}
        </div>
        {isActionnable && (
          <div style={{ padding: "18px 28px 24px", borderTop: "1px solid #F1F5F9", background: "#FAFBFE", borderRadius: "0 0 24px 24px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { onRefuser(mission.id); onClose(); }} style={{ flex: 1, padding: "13px", background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaTimesCircle size={14} /> Refuser la mission
              </button>
              <button onClick={() => { onAccepter(mission); onClose(); }} style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaCheck size={14} /> Accepter — Créer un devis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MODAL PROPOSER FORMATION ====================
interface Formateur {
  prenom: string;
  nom: string;
  domaine: string;
  bio: string;
  imageFile: File | null;
  imagePreview: string;
}

function ProposerFormationModal({ onClose, onSuccess, expertData, user, tk }: { onClose: () => void; onSuccess: () => void; expertData: any; user: any; tk: () => string; }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formateurs, setFormateurs] = useState<Formateur[]>([
    { prenom: "", nom: "", domaine: "", bio: "", imageFile: null, imagePreview: "" }
  ]);
  const [form, setForm] = useState({ 
    titre: "", description: "", domaine: expertData?.domaine || "", 
    mode: "en_ligne", duree: "", localisation: "", niveau: "", 
    lien_formation: "", dateDebut: "", dateFin: "", 
    type: "payant", gratuit: false, prix: "", 
    places_limitees: false, places_disponibles: "", certifiante: false 
  });
  
  const upd = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const step1Valid = form.titre.trim().length >= 2 && form.description.trim().length >= 5 && !!form.domaine;
  const steps = [{ num: 1, label: "Informations" }, { num: 2, label: "Formateurs" }, { num: 3, label: "Modalités" }, { num: 4, label: "Tarification" }, { num: 5, label: "Visuel" }];

  const addFormateur = () => {
    setFormateurs(prev => [...prev, { prenom: "", nom: "", domaine: "", bio: "", imageFile: null, imagePreview: "" }]);
  };

  const removeFormateur = (index: number) => {
    if (formateurs.length === 1) return;
    setFormateurs(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormateur = (index: number, field: keyof Formateur, value: any) => {
    setFormateurs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const handleFormateurImage = (index: number, file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      updateFormateur(index, "imageFile", file);
      updateFormateur(index, "imagePreview", preview);
    } else {
      updateFormateur(index, "imageFile", null);
      updateFormateur(index, "imagePreview", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!step1Valid) { alert("Veuillez remplir tous les champs requis (titre, description, domaine)"); return; }
    
    const hasValidFormateur = formateurs.some(f => f.prenom.trim() && f.nom.trim());
    if (!hasValidFormateur) {
      alert("Veuillez ajouter au moins un formateur valide (prénom et nom requis)");
      return;
    }
    
    setSubmitting(true);
    try {
      const fd = new FormData(); 
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          fd.append(k, String(v));
        }
      });
      fd.append("a_la_une", "false"); 
      fd.append("statut", "en_attente"); 
      if (!form.gratuit && form.prix) fd.append("prix", form.prix); 
      if (imageFile) fd.append("image", imageFile);
      
      const formateursData = formateurs.map(f => ({
        prenom: f.prenom,
        nom: f.nom,
        domaine: f.domaine,
        bio: f.bio
      }));
      fd.append("formateur_details", JSON.stringify(formateursData));
      
      formateurs.forEach((f, idx) => {
        if (f.imageFile) {
          fd.append(`formateur_image_${idx}`, f.imageFile);
        }
      });
      
      const res = await fetch(`${BASE}/formations/expert/proposer`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${tk()}` }, 
        body: fd 
      });
      
      if (res.ok) { 
        onSuccess(); 
        onClose(); 
      } else { 
        const err = await res.json().catch(() => ({ message: "Erreur serveur" })); 
        alert(`Erreur : ${err.message || "Impossible de soumettre"}`); 
      }
    } catch (err) { 
      console.error(err);
      alert("Erreur réseau"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "20px 28px 0", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaGraduationCap style={{ color: "#F7B500", fontSize: 20 }} /></div>
                <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Espace Expert</div><div style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>Proposer une formation</div></div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {steps.map((s, i) => (
                <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }} onClick={() => { if (s.num < step || (s.num === step + 1 && step1Valid)) setStep(s.num); }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: step > s.num ? "#10B981" : step === s.num ? "#F7B500" : "rgba(255,255,255,.12)", border: step === s.num ? "2px solid #F7B500" : step > s.num ? "2px solid #10B981" : "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: step >= s.num ? "#0A2540" : "rgba(255,255,255,.4)", fontWeight: 800, fontSize: 12 }}>
                      {step > s.num ? <FaCheck size={10} /> : s.num}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: step >= s.num ? "#fff" : "rgba(255,255,255,.35)", whiteSpace: "nowrap", paddingBottom: 12 }}>{s.label}</div>
                  </div>
                  {i < steps.length - 1 && <div style={{ height: 2, flex: 1, maxWidth: 50, background: step > s.num ? "#10B981" : "rgba(255,255,255,.15)", marginBottom: 22 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px", maxHeight: "58vh", overflowY: "auto" }}>
            {/* Étape 1: Informations générales */}
            {step === 1 && (
              <div>
                <div style={{ marginBottom: 16 }}><Lbl>Titre *</Lbl><input className="inp" placeholder="Ex: Maîtriser le Marketing Digital" value={form.titre} onChange={e => upd("titre", e.target.value)} maxLength={150} required /></div>
                <div style={{ marginBottom: 16 }}><Lbl>Description *</Lbl><textarea className="inp" rows={4} value={form.description} onChange={e => upd("description", e.target.value)} required /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div><Lbl>Domaine *</Lbl><select className="inp" value={form.domaine} onChange={e => upd("domaine", e.target.value)} required><option value="">Sélectionner...</option>{DOMAINES_LIST.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                  <div><Lbl>Niveau</Lbl><select className="inp" value={form.niveau} onChange={e => upd("niveau", e.target.value)}><option value="">Sélectionner...</option>{NIVEAUX_LIST.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
                  <div onClick={() => upd("certifiante", !form.certifiante)} style={{ width: 44, height: 24, background: form.certifiante ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: form.certifiante ? 22 : 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                  </div>
                  <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", display: "flex", alignItems: "center", gap: 6 }}><FaCertificate style={{ color: "#F7B500" }} size={13} /> Formation certifiante</div><div style={{ fontSize: 11, color: "#64748B" }}>Une certification sera délivrée aux participants</div></div>
                </div>
              </div>
            )}
            
            {/* Étape 2: Formateurs */}
            {step === 2 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Lbl>Formateur(s) *</Lbl>
                  <button type="button" onClick={addFormateur} style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <FaPlus size={10} /> Ajouter un formateur
                  </button>
                </div>
                {formateurs.map((f, idx) => (
                  <div key={idx} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>Formateur {idx + 1}</span>
                      {formateurs.length > 1 && (
                        <button type="button" onClick={() => removeFormateur(idx)} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>
                          <FaTrash size={10} /> Supprimer
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><Lbl>Prénom *</Lbl><input className="inp" value={f.prenom} onChange={e => updateFormateur(idx, "prenom", e.target.value)} placeholder="Prénom" /></div>
                      <div><Lbl>Nom *</Lbl><input className="inp" value={f.nom} onChange={e => updateFormateur(idx, "nom", e.target.value)} placeholder="Nom" /></div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Lbl>Domaine d'expertise</Lbl>
                      <select className="inp" value={f.domaine} onChange={e => updateFormateur(idx, "domaine", e.target.value)}>
                        <option value="">Sélectionner...</option>
                        {DOMAINES_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Lbl>Biographie</Lbl>
                      <textarea className="inp" rows={3} value={f.bio} onChange={e => updateFormateur(idx, "bio", e.target.value)} placeholder="Présentation du formateur (expérience, parcours...)" />
                    </div>
                    <div>
                      <Lbl>Photo du formateur</Lbl>
                      <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0]; if (file) handleFormateurImage(idx, file); }} style={{ display: "none" }} />
                        {f.imagePreview ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <img src={f.imagePreview} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} alt="aperçu" />
                            <button type="button" onClick={() => handleFormateurImage(idx, null)} style={{ background: "transparent", color: "#DC2626", border: "none", fontSize: 11, cursor: "pointer" }}>Supprimer</button>
                          </div>
                        ) : (
                          <div style={{ textAlign: "center" }}>
                            <FaUser style={{ fontSize: 28, color: "#94A3B8", marginBottom: 4 }} />
                            <div style={{ fontSize: 12, color: "#64748B" }}>Cliquer pour ajouter une photo</div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0369A1", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaInfoCircle style={{ flexShrink: 0 }} /> Les formateurs seront affichés sur la page de la formation.
                </div>
              </div>
            )}
            
            {/* Étape 3: Modalités */}
            {step === 3 && (
              <div>
                <div style={{ marginBottom: 18 }}><Lbl>Mode *</Lbl>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {MODES_LIST.map(m => <div key={m.value} onClick={() => upd("mode", m.value)} style={{ border: `2px solid ${form.mode === m.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 11, padding: "12px 10px", cursor: "pointer", background: form.mode === m.value ? "#FFFBEB" : "#fff", textAlign: "center", fontWeight: 700, fontSize: 13 }}>{m.label}</div>)}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div><Lbl>Durée</Lbl><input className="inp" placeholder="Ex: 2 jours" value={form.duree} onChange={e => upd("duree", e.target.value)} /></div>
                  <div><Lbl>Localisation {form.mode === "presentiel" ? "*" : ""}</Lbl><input className="inp" placeholder="Ex: Tunis..." value={form.localisation} onChange={e => upd("localisation", e.target.value)} required={form.mode === "presentiel"} disabled={form.mode === "en_ligne"} /></div>
                </div>
                <div style={{ marginBottom: 16 }}><Lbl>Lien formation (optionnel)</Lbl><input className="inp" type="url" placeholder="https://..." value={form.lien_formation} onChange={e => upd("lien_formation", e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div><Lbl>Date début</Lbl><input className="inp" type="date" value={form.dateDebut} onChange={e => upd("dateDebut", e.target.value)} /></div>
                  <div><Lbl>Date fin</Lbl><input className="inp" type="date" value={form.dateFin} onChange={e => upd("dateFin", e.target.value)} /></div>
                </div>
              </div>
            )}
            
            {/* Étape 4: Tarification */}
            {step === 4 && (
              <div>
                <div style={{ marginBottom: 18 }}><Lbl>Tarif</Lbl>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[{ value: "gratuit", label: "Gratuit" }, { value: "payant", label: "Payant" }].map(t => <div key={t.value} onClick={() => { upd("type", t.value); upd("gratuit", t.value === "gratuit"); }} style={{ border: `2px solid ${form.type === t.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", background: form.type === t.value ? "#FFFBEB" : "#fff", fontWeight: 700, fontSize: 14 }}>{t.label}</div>)}
                  </div>
                </div>
                {form.type === "payant" && <div style={{ marginBottom: 18 }}><Lbl>Prix (DT)</Lbl><input className="inp" type="number" min="0" value={form.prix} onChange={e => upd("prix", e.target.value)} /></div>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                  <div onClick={() => upd("places_limitees", !form.places_limitees)} style={{ width: 44, height: 24, background: form.places_limitees ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: form.places_limitees ? 22 : 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>Places limitées</div>
                </div>
                {form.places_limitees && <div><Lbl>Nombre de places *</Lbl><input className="inp" type="number" min="1" value={form.places_disponibles} onChange={e => upd("places_disponibles", e.target.value)} /></div>}
              </div>
            )}
            
            {/* Étape 5: Visuel */}
            {step === 5 && (
              <div>
                <Lbl>Image de couverture de la formation (optionnelle)</Lbl>
                <label className="upload-zone" style={{ minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
                  {imagePreview ? <img src={imagePreview} alt="" style={{ maxWidth: "100%", maxHeight: 140, borderRadius: 10, objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><FaImage style={{ fontSize: 40, color: "#94A3B8", marginBottom: 10 }} /><div style={{ fontWeight: 700, fontSize: 14, color: "#475569" }}>Cliquer pour uploader (optionnel)</div></div>}
                </label>
                <div style={{ marginTop: 20, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0369A1", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaInfoCircle style={{ flexShrink: 0 }} />Votre formation sera soumise en statut "En attente" et examinée par l'administrateur.
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "14px 28px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Étape {step} / {steps.length}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && <button type="button" style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setStep(s => s - 1)}><FaArrowLeft size={11} /> Précédent</button>}
              {step < steps.length ? (
                <button type="button" style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { if (step === 1 && !step1Valid) { alert("Remplissez titre, description et domaine"); return; } if (step === 2 && !formateurs.some(f => f.prenom.trim() && f.nom.trim())) { alert("Veuillez ajouter au moins un formateur valide (prénom et nom requis)"); return; } setStep(s => s + 1); }}>Suivant</button>
              ) : (
                <button type="submit" style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} disabled={submitting}>{submitting ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi...</> : <><FaCheck size={12} /> Soumettre</>}</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== CREATE PODCAST MODAL ====================
function CreatePodcastModal({ onClose, onSuccess, expertData }: { onClose: () => void; onSuccess: () => void; expertData: any }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [auteur, setAuteur] = useState("");
  const [domaine, setDomaine] = useState(expertData?.domaine || "");
  const [useExternalLink, setUseExternalLink] = useState(false);
  const [externalLink, setExternalLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError("Titre requis");
      return;
    }
    if (!useExternalLink && !videoFile) {
      setError("Veuillez sélectionner un fichier vidéo");
      return;
    }
    if (useExternalLink && !externalLink.trim()) {
      setError("Veuillez saisir un lien valide");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("titre", titre);
    if (description) fd.append("description", description);
    if (auteur) fd.append("auteur", auteur);
    if (domaine) fd.append("domaine", domaine);
    if (useExternalLink) {
      fd.append("video_url", externalLink);
    } else if (videoFile) {
      fd.append("video_file", videoFile);
    }
    if (imageFile) {
      fd.append("image_file", imageFile);
    }
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE}/podcasts/expert/proposer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        alert("✅ Podcast proposé avec succès !");
        onSuccess();
        onClose();
      } else {
        const responseText = await res.text();
        setError(responseText || "Erreur lors de l'envoi");
      }
    } catch (err: any) {
      console.error("Erreur réseau:", err);
      setError("Erreur réseau: " + (err.message || "Impossible de contacter le serveur"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "20px 28px", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(139,92,246,.2)", border: "1.5px solid rgba(139,92,246,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone style={{ color: "#C4B5FD", fontSize: 20 }} /></div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Espace Expert</div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>Proposer un podcast / vidéo</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", maxHeight: "80vh", overflowY: "auto" }}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "12px", marginBottom: 16, fontSize: 13, color: "#DC2626" }}>
              <FaExclamationTriangle style={{ display: "inline", marginRight: 6 }} /> {error}
            </div>
          )}
          <div style={{ marginBottom: 16 }}><Lbl>Titre *</Lbl><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de votre vidéo/podcast" maxLength={150} /></div>
          <div style={{ marginBottom: 16 }}><Lbl>Description</Lbl><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de votre contenu..." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><Lbl>Auteur</Lbl><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} placeholder="Votre nom" /></div>
            <div><Lbl>Domaine</Lbl><select className="inp" value={domaine} onChange={e => setDomaine(e.target.value)}><option value="">Sélectionner...</option>{DOMAINES_LIST.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 20, display: "flex", gap: 16, background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}><input type="radio" checked={!useExternalLink} onChange={() => setUseExternalLink(false)} /> Uploader un fichier (MP4)</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}><input type="radio" checked={useExternalLink} onChange={() => setUseExternalLink(true)} /> Lien externe (YouTube, Vimeo, etc.)</label>
          </div>
          {!useExternalLink ? (
            <div style={{ marginBottom: 16 }}>
              <Lbl>Fichier vidéo *</Lbl>
              <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} style={{ display: "none" }} />
                {videoFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaVideo style={{ color: "#7C3AED", fontSize: 24 }} />
                    <span style={{ fontSize: 12, color: "#0A2540" }}>{videoFile.name}</span>
                    <button type="button" onClick={() => setVideoFile(null)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer" }}><FaTimes /></button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <FaVideo style={{ fontSize: 32, color: "#94A3B8", marginBottom: 6 }} />
                    <div style={{ fontSize: 12, color: "#64748B" }}>Cliquer pour sélectionner un fichier vidéo (MP4)</div>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <Lbl>Lien externe *</Lbl>
              <div style={{ position: "relative" }}>
                <FaLink style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                <input className="inp" placeholder="https://www.youtube.com/watch?v=..." value={externalLink} onChange={e => setExternalLink(e.target.value)} style={{ paddingLeft: 34 }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>Supporte YouTube, Vimeo, Dailymotion, etc.</div>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <Lbl>Image de couverture (optionnelle)</Lbl>
            <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
              {imagePreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={imagePreview} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} alt="" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer" }}>Supprimer</button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <FaImage style={{ fontSize: 32, color: "#94A3B8", marginBottom: 6 }} />
                  <div style={{ fontSize: 12, color: "#64748B" }}>Cliquer pour ajouter une image de couverture</div>
                </div>
              )}
            </label>
          </div>
          <div style={{ marginTop: 20, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0369A1", display: "flex", alignItems: "center", gap: 8 }}>
            <FaInfoCircle style={{ flexShrink: 0 }} /> Votre vidéo sera soumise en statut "En attente" et examinée par l'administrateur.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button type="button" style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={onClose}>Annuler</button>
            <button type="submit" disabled={loading} style={{ background: loading ? "#E2E8F0" : "#7C3AED", color: loading ? "#94A3B8" : "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              {loading ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi...</> : <><FaPaperPlane size={12} /> Proposer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== EDIT PODCAST MODAL ====================
function EditPodcastModal({ podcast, onClose, onSuccess }: { podcast: any; onClose: () => void; onSuccess: () => void }) {
  const [titre, setTitre] = useState(podcast.titre || "");
  const [description, setDescription] = useState(podcast.description || "");
  const [auteur, setAuteur] = useState(podcast.auteur || "");
  const [domaine, setDomaine] = useState(podcast.domaine || "");
  const [useExternalLink, setUseExternalLink] = useState(podcast.url_audio?.startsWith("http") || false);
  const [externalLink, setExternalLink] = useState(podcast.url_audio?.startsWith("http") ? podcast.url_audio : "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(podcast.image ? `${BASE}/uploads/podcasts-images/${podcast.image}` : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) { alert("Titre requis"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("titre", titre);
    fd.append("description", description);
    fd.append("auteur", auteur);
    fd.append("domaine", domaine);
    if (useExternalLink && externalLink.trim()) {
      fd.append("url_audio", externalLink);
    } else if (videoFile) {
      fd.append("video_file", videoFile);
    }
    if (imageFile) fd.append("image_file", imageFile);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE}/podcasts/expert/modifier/${podcast.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) { onSuccess(); onClose(); } 
      else { alert("Erreur lors de la modification"); }
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "18px 24px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaVideo style={{ color: "#C4B5FD", fontSize: 18 }} /></div>
            <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11 }}>Modifier</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{podcast.titre}</div></div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, padding: "5px 10px", color: "#fff", cursor: "pointer" }}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}><Lbl>Titre *</Lbl><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><Lbl>Description</Lbl><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><Lbl>Auteur</Lbl><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} /></div>
            <div><Lbl>Domaine</Lbl><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 16, display: "flex", gap: 16, background: "#F8FAFC", padding: "12px 16px", borderRadius: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}><input type="radio" checked={!useExternalLink} onChange={() => setUseExternalLink(false)} /> Uploader un fichier MP4</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}><input type="radio" checked={useExternalLink} onChange={() => setUseExternalLink(true)} /> Lien externe (YouTube...)</label>
          </div>
          {!useExternalLink ? (
            <div style={{ marginBottom: 16 }}>
              <Lbl>Fichier vidéo (MP4)</Lbl>
              <label className="upload-zone" style={{ minHeight: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <input type="file" accept="video/mp4,video/*" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} style={{ display: "none" }} />
                {videoFile ? <span><FaCheck style={{ color: "#10B981" }} /> {videoFile.name}</span> : <><FaVideo style={{ color: "#94A3B8", fontSize: 22 }} /><span>Remplacer la vidéo</span></>}
              </label>
              {!videoFile && podcast.url_audio && !podcast.url_audio.startsWith("http") && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>Fichier actuel: {podcast.url_audio}</div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <Lbl>Lien externe</Lbl>
              <div style={{ position: "relative" }}>
                <FaLink style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input className="inp" placeholder="https://..." value={externalLink} onChange={e => setExternalLink(e.target.value)} style={{ paddingLeft: 34 }} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <Lbl>Image de couverture</Lbl>
            <label className="upload-zone" style={{ minHeight: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
              {imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage style={{ color: "#94A3B8", fontSize: 22 }} /><span>Modifier l'image</span></>}
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button type="button" style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={onClose}>Annuler</button>
            <button type="submit" disabled={loading} style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              {loading ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi...</> : <><FaSave size={11} /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== PODCAST DETAIL MODAL ====================
function PodcastDetailModal({ podcast, onClose }: { podcast: any; onClose: () => void }) {
  const isExternalLink = podcast.url_audio?.startsWith("http");
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };
  
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "20px 24px", borderRadius: "24px 24px 0 0", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes /></button>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {podcast.image ? <img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} alt="" /> : <div style={{ width: 70, height: 70, borderRadius: 12, background: "rgba(139,92,246,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaVideo style={{ fontSize: 32, color: "#C4B5FD" }} /></div>}
            <div><div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Vidéo</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{podcast.titre}</div>{podcast.auteur && <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 4 }}><FaMicrophone size={9} /> {podcast.auteur}</div>}</div>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {podcast.description && <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, marginBottom: 20 }}>{podcast.description}</p>}
          {isExternalLink ? (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", marginBottom: 16, borderRadius: 12, background: "#000" }}>
              <iframe src={getEmbedUrl(podcast.url_audio)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen title={podcast.titre} />
            </div>
          ) : (
            <video src={`${BASE}/uploads/podcasts-audio/${podcast.url_audio}`} controls style={{ width: "100%", marginBottom: 16, borderRadius: 12 }} />
          )}
          <button style={{ width: "100%", background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 9, padding: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ rdv, onClose, onSuccess, hdrJ }: { rdv: any; onClose: () => void; onSuccess: () => void; hdrJ: () => Record<string, string>; }) {
  const [newDate, setNewDate] = useState(""); const [reason, setReason] = useState(""); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newDate) return; setLoading(true);
    try {
      const res = await fetch(`${BASE}/rendez-vous/${rdv.id}/proposer-creneau`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ nouvelle_date: newDate, raison: reason }) });
      if (res.ok) { onSuccess(); onClose(); }
      else {
        const formattedDate = new Date(newDate).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const contenu = `__RDV_PROPOSAL__\nrdv_id:${rdv.id}\nnouvelle_date:${newDate}\ndate_formatted:${formattedDate}\nraison:${reason || "Non précisée"}\n__END__\n\nNouveau créneau proposé : ${formattedDate}${reason ? `\nRaison : ${reason}` : ""}`;
        const msgRes = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rdv.client_id || rdv.startup?.user_id || rdv.startup_id, contenu }) });
        if (msgRes.ok) { onSuccess(); onClose(); } else alert("Impossible d'envoyer");
      }
    } catch { alert("Erreur réseau"); } setLoading(false);
  };
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
      <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(247,181,0,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCalendarAlt style={{ color: "#F7B500", fontSize: 16 }} /></div>
          <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Rendez-vous</div><div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>Proposer un nouveau créneau</div></div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
      </div>
      <div style={{ padding: "14px 24px", background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}>
        <div style={{ fontSize: 13, color: "#92400E" }}><strong>RDV actuel :</strong> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
        {rdv.sujet && <div style={{ fontSize: 12, color: "#B45309", marginTop: 3 }}>{rdv.sujet}</div>}
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        <div style={{ marginBottom: 16 }}><Lbl>Nouvelle date et heure *</Lbl><input className="inp" type="datetime-local" required value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} /></div>
        <div style={{ marginBottom: 20 }}><Lbl>Raison (optionnelle)</Lbl><textarea className="inp" rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={onClose}>Annuler</button>
          <button type="submit" style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} disabled={loading || !newDate}>{loading ? "Envoi..." : <><FaPaperPlane size={11} /> Envoyer</>}</button>
        </div>
      </form>
    </div></div>
  );
}

// ==================== COMPOSANT PRINCIPAL (Dashboard Expert) ====================
export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("accueil");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const [newsNotifications, setNewsNotifications] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsNotificationsCount, setNewsNotificationsCount] = useState(0);
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState("");

  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [showCreatePodcastModal, setShowCreatePodcastModal] = useState(false);
  const [showEditPodcastModal, setShowEditPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certificationFormation, setCertificationFormation] = useState<any>(null);
  const [certificationClient, setCertificationClient] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ domaine: "", description: "", localisation: "", telephone: "", annee_debut_experience: "" });
  const [modificationEnAttente, setModificationEnAttente] = useState(false);
  const [devisMission, setDevisMission] = useState<any>(null);
  const [devisForm, setDevisForm] = useState({ montant: "", description: "", delai: "" });
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminNewReplyCount, setAdminNewReplyCount] = useState(0);
  const [contactAdminForm, setContactAdminForm] = useState({ sujet: "", message: "" });
  const [sendingContactAdmin, setSendingContactAdmin] = useState(false);
  const [contactAdminStatus, setContactAdminStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactInfo, setContactInfo] = useState<{ email?: string; telephone?: string } | null>(null);

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  useEffect(() => {
    const ho = () => setIsOnline(true), hf = () => setIsOnline(false);
    window.addEventListener("online", ho);
    window.addEventListener("offline", hf);
    setIsOnline(navigator.onLine);
    return () => { 
      window.removeEventListener("online", ho); 
      window.removeEventListener("offline", hf); 
    };
  }, []);

  function notify(text: string, ok = true) { 
    setToast({ text, ok }); 
    setTimeout(() => setToast({ text: "", ok: true }), 5000); 
  }

  const forceLogout = useCallback(() => { 
    localStorage.clear(); 
    window.location.href = "/connexion"; 
  }, []);

  const unreadMsgCount = allMessages.filter(m => m.receiver_id === user?.id && !m.lu).length;
  const pendingRdvCount = rdvs.filter(r => r.statut === "en_attente").length;
  const notificationsCount = notifications.length;

  // Charger les messages admin
  useEffect(() => {
    if (!user || tab !== "contact_admin") return;
    const loadAdminMessages = async () => {
      try {
        const res = await fetch(`${BASE}/contact/messages`, { headers: hdr() });
        if (res.ok) {
          const all = await res.json();
          const userEmail = user.email;
          const filtered = all.filter((msg: any) => msg.email === userEmail);
          setAdminMessages(filtered);
          const unreadReplies = filtered.filter((msg: any) => msg.admin_reply && !msg.is_read).length;
          setAdminNewReplyCount(unreadReplies);
        }
      } catch {}
    };
    loadAdminMessages();
  }, [tab, user, hdr]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) { 
      notify("Veuillez saisir votre email", false); 
      return; 
    }
    setNlLoading(true); 
    setNlError("");
    try {
      const r = await fetch(`${BASE}/newsletter/subscribe`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: nlEmail, 
          nom: `${user?.prenom || ""} ${user?.nom || ""}`.trim() || "Expert BEH" 
        })
      });
      const result = await r.json();
      if (r.ok && result.success) { 
        setNlSent(true); 
        setNlEmail(""); 
        notify("✅ Inscription newsletter réussie !"); 
        setTimeout(() => setNlSent(false), 5000); 
      } else { 
        setNlError(result.message || "Erreur lors de l'inscription."); 
      }
    } catch { 
      setNlError("Erreur réseau."); 
    } finally { 
      setNlLoading(false); 
    }
  };

  const loadNewsNotifications = useCallback(async () => {
    setNewsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE}/news/startup`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data.canView === true) {
          setNewsNotifications(data.news || []);
          const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
          setNewsNotificationsCount((data.news || []).filter((n: any) => new Date(n.createdAt).getTime() > cutoff).length);
        } else { 
          setNewsNotifications([]); 
          setNewsNotificationsCount(0); 
        }
      } else { 
        setNewsNotifications([]); 
      }
    } catch { 
      setNewsNotifications([]); 
    } finally { 
      setNewsLoading(false); 
    }
  }, []);

  const loadNotifications = useCallback(async (expertId?: number) => {
    const token = tk(); 
    const currentExpertId = expertId || expert?.id;
    if (!token || !currentExpertId) return;
    try {
      const res = await fetch(`${BASE}/demandes-service/expert/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { 
        const data = await res.json(); 
        setNotifications(Array.isArray(data) ? data : []); 
        return; 
      }
      const res2 = await fetch(`${BASE}/demandes-service/all`, { headers: { Authorization: `Bearer ${token}` } });
      if (res2.ok) {
        const allDemandes = await res2.json();
        const filtered = (Array.isArray(allDemandes) ? allDemandes : []).filter((d: any) => {
          let notifies = d.experts_notifies || [];
          if (notifies.length > 0 && typeof notifies[0] === 'object') notifies = notifies.map((n: any) => n.expert_id || n.id);
          let acceptes = d.experts_acceptes || [];
          if (acceptes.length > 0 && typeof acceptes[0] === 'object') acceptes = acceptes.map((a: any) => a.expert_id || a.id);
          return notifies.includes(currentExpertId) && !acceptes.includes(currentExpertId) && 
                 ["en_attente", "notifie_experts", "devis_envoye"].includes(d.statut);
        });
        setNotifications(filtered);
      } else { 
        setNotifications([]); 
      }
    } catch { 
      setNotifications([]); 
    }
  }, [tk, expert?.id]);

  const loadDemandesAssignees = useCallback(async () => {
    const token = tk(); 
    if (!token) return;
    try {
      const res = await fetch(`${BASE}/demandes-service/expert/assignees`, { headers: { Authorization: `Bearer ${token}` } });
      setDemandesAssignees(res.ok ? await res.json() : []);
    } catch { 
      setDemandesAssignees([]); 
    }
  }, [tk]);

  const loadExpertData = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [expertRes, formationsRes, podcastsRes, devisRes, pubTemosRes, rdvsRes] = await Promise.all([
        fetch(`${BASE}/experts/moi`, { headers: hdr() }),
        fetch(`${BASE}/formations/expert/mes-formations`, { headers: hdr() }),
        fetch(`${BASE}/podcasts/expert/mes-podcasts`, { headers: hdr() }),
        fetch(`${BASE}/devis/expert/mes-devis`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/publics`),
        fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() }),
      ]);
      
      if (!expertRes.ok) {
        throw new Error(`Erreur chargement expert: ${expertRes.status}`);
      }
      
      const exp = await expertRes.json();
      setExpert(exp);
      setEditProfil({ 
        domaine: exp.domaine || "", 
        description: exp.description || "", 
        localisation: exp.localisation || "", 
        telephone: exp.user?.telephone || "", 
        annee_debut_experience: exp.annee_debut_experience?.toString() || "" 
      });
      setModificationEnAttente(exp.modification_demandee === true);
      
      if (formationsRes.ok) setFormations(await formationsRes.json());
      if (podcastsRes.ok) setPodcasts(await podcastsRes.json());
      if (devisRes.ok) setMesDevis(await devisRes.json());
      if (pubTemosRes.ok) setPubTemos(await pubTemosRes.json());
      if (rdvsRes.ok) setRdvs(await rdvsRes.json());
      
      await Promise.all([
        loadNotifications(exp.id),
        loadDemandesAssignees(),
        loadNewsNotifications(),
        refreshAllMessages()
      ]);
      
    } catch (err: any) {
      console.error("Erreur chargement données:", err);
      setError(err.message || "Erreur lors du chargement des données");
      notify("Erreur chargement des données", false);
    } finally { 
      setLoading(false); 
    }
  }, [hdr, loadNotifications, loadDemandesAssignees, loadNewsNotifications]);

  const refreshAllMessages = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() }); 
      if (!res.ok) return;
      const messages = await res.json();
      setAllMessages(messages);
      const contactsMap = new Map();
      for (const m of messages) {
        const otherId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
        if (!contactsMap.has(otherId) && otherId) {
          const otherUser = m.sender_id === user?.id ? m.receiver : m.sender;
          if (otherUser) contactsMap.set(otherId, { 
            id: otherId, 
            prenom: otherUser.prenom, 
            nom: otherUser.nom, 
            email: otherUser.email, 
            service: "Client" 
          });
        }
      }
      demandesAssignees.forEach(d => { 
        const u = d.user; 
        if (u && u.id) contactsMap.set(u.id, { 
          id: u.id, 
          prenom: u.prenom, 
          nom: u.nom, 
          email: u.email, 
          service: d.service 
        }); 
      });
      setContacts(Array.from(contactsMap.values()));
      if (selectedContact) {
        const filtered = messages.filter((m: any) => 
          (m.sender_id === selectedContact.id && m.receiver_id === user?.id) || 
          (m.sender_id === user?.id && m.receiver_id === selectedContact.id)
        );
        setConversation(filtered.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
      }
    } catch (err) {
      console.error("Erreur refresh messages:", err);
    }
  }, [hdr, user?.id, demandesAssignees, selectedContact]);

  const loadConversation = useCallback(async (contactUserId: number) => {
    const contact = contacts.find(c => c.id === contactUserId); 
    if (!contact) return;
    setSelectedContact(contact);
    const filtered = allMessages.filter((m: any) => 
      (m.sender_id === contactUserId && m.receiver_id === user?.id) || 
      (m.sender_id === user?.id && m.receiver_id === contactUserId)
    );
    setConversation(filtered.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ));
    try { 
      await fetch(`${BASE}/messages/mark-read/${contactUserId}`, { 
        method: "PATCH", 
        headers: hdr() 
      }); 
      setAllMessages(prev => prev.map(m => 
        m.sender_id === contactUserId ? { ...m, lu: true } : m
      )); 
    } catch {}
  }, [contacts, allMessages, user?.id, hdr]);

  async function sendMessage() {
    if (!newMsg.trim() || !selectedContact) return;
    try { 
      const r = await fetch(`${BASE}/messages`, { 
        method: "POST", 
        headers: hdrJ(), 
        body: JSON.stringify({ receiver_id: selectedContact.id, contenu: newMsg }) 
      }); 
      if (r.ok) { 
        setNewMsg(""); 
        await refreshAllMessages(); 
      } else notify("Erreur envoi", false); 
    } catch { 
      notify("Erreur réseau", false); 
    }
  }
  
  async function deleteMessage(msgId: number) { 
    if (!confirm("Supprimer ?")) return; 
    const r = await fetch(`${BASE}/messages/${msgId}`, { 
      method: "DELETE", 
      headers: hdr() 
    }); 
    if (r.ok) { 
      notify("Supprimé"); 
      await refreshAllMessages(); 
    } else notify("Erreur", false); 
  }
  
  async function confirmerRdv(rdvId: number) { 
    const r = await fetch(`${BASE}/rendez-vous/${rdvId}/confirmer`, { 
      method: "PUT", 
      headers: hdrJ() 
    }); 
    if (r.ok) { 
      notify("✅ Confirmé"); 
      loadExpertData(user?.id); 
    } else notify("Erreur", false); 
  }
  
  async function annulerRdv(rdvId: number) { 
    if (!confirm("Annuler ?")) return; 
    const r = await fetch(`${BASE}/rendez-vous/${rdvId}/annuler`, { 
      method: "PUT", 
      headers: hdrJ() 
    }); 
    if (r.ok) { 
      notify("Annulé"); 
      loadExpertData(user?.id); 
    } else notify("Erreur", false); 
  }
  
  async function updatePhoto() { 
    if (!photoFile) return; 
    const fd = new FormData(); 
    fd.append("photo", photoFile); 
    const r = await fetch(`${BASE}/experts/photo`, { 
      method: "POST", 
      headers: { Authorization: `Bearer ${tk()}` }, 
      body: fd 
    }); 
    if (r.ok) { 
      notify("✅ Photo mise à jour"); 
      await loadExpertData(user?.id); 
      setPhotoFile(null); 
      setPhotoPreview(""); 
    } else notify("Erreur upload", false); 
  }
  
  async function updateProfile() {
    const payload: any = {};
    if (editProfil.domaine !== (expert?.domaine || "")) payload.domaine = editProfil.domaine;
    if (editProfil.description !== (expert?.description || "")) payload.description = editProfil.description;
    if (editProfil.localisation !== (expert?.localisation || "")) payload.localisation = editProfil.localisation;
    if (editProfil.telephone !== (expert?.user?.telephone || "")) payload.telephone = editProfil.telephone;
    const anneeNum = parseInt(editProfil.annee_debut_experience); 
    if (!isNaN(anneeNum) && anneeNum !== expert?.annee_debut_experience) payload.annee_debut_experience = anneeNum;
    if (Object.keys(payload).length === 0) { 
      notify("Aucune modification", false); 
      return; 
    }
    const res = await fetch(`${BASE}/experts/profil`, { 
      method: "PUT", 
      headers: hdrJ(), 
      body: JSON.stringify(payload) 
    });
    if (res.ok) { 
      notify("✅ Modification envoyée"); 
      await loadExpertData(user?.id); 
    } else notify("Erreur", false);
  }
  
  async function handleDeletePodcast(id: number) { 
    if (!confirm("Supprimer ?")) return; 
    try {
      const res = await fetch(`${BASE}/podcasts/expert/supprimer/${id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${tk()}` } 
      }); 
      if (res.ok) { 
        notify("✅ Podcast supprimé avec succès"); 
        await loadExpertData(user?.id); 
      } else { 
        notify("❌ Erreur lors de la suppression", false); 
      }
    } catch (error) {
      notify("❌ Erreur réseau", false);
    }
  }

  const envoyerMessageAdmin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!contactAdminForm.message.trim()) return; 
    setSendingContactAdmin(true);
    try {
      const r = await fetch(`${BASE}/contact/message`, { 
        method: "POST", 
        headers: hdrJ(), 
        body: JSON.stringify({ 
          nom: user?.nom || "", 
          prenom: user?.prenom || "", 
          email: user?.email || "", 
          subject: contactAdminForm.sujet || "Message d'un expert", 
          message: contactAdminForm.message,
          client_type: "expert"
        }) 
      });
      if (r.ok) { 
        setContactAdminStatus("success"); 
        setContactAdminForm({ sujet: "", message: "" }); 
        setTimeout(() => setContactAdminStatus("idle"), 5000);
        notify("✅ Message envoyé à l'administrateur");
        const res = await fetch(`${BASE}/contact/messages`, { headers: hdr() });
        if (res.ok) {
          const all = await res.json();
          const filtered = all.filter((msg: any) => msg.email === user?.email);
          setAdminMessages(filtered);
        }
      } else setContactAdminStatus("error");
    } catch { 
      setContactAdminStatus("error"); 
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

  // AUTHENTIFICATION
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const authenticateUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          router.replace("/connexion");
          return;
        }
        
        const response = await fetch(`${BASE}/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        if (!response.ok) {
          localStorage.clear();
          router.replace("/connexion");
          return;
        }
        
        const realUser = await response.json();
        
        const normalizedRole = realUser.role?.toLowerCase();
        
        if (normalizedRole !== "expert") {
          localStorage.clear();
          if (normalizedRole === "startup") {
            router.replace("/dashboard/startup");
          } else if (normalizedRole === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/");
          }
          return;
        }
        
        setUser(realUser);
        localStorage.setItem("user", JSON.stringify(realUser));
        
        await loadExpertData(realUser.id);
        
        try {
          const histoireRes = await fetch(`${BASE}/histoire`);
          if (histoireRes.ok) {
            const histoireData = await histoireRes.json();
            setContactInfo({
              email: histoireData.email_contact || "plateformebeh@gmail.com",
              telephone: histoireData.telephone_contact || "29524360"
            });
          }
        } catch (err) {
          console.error("Erreur chargement contact:", err);
          setContactInfo({
            email: "plateformebeh@gmail.com",
            telephone: "29524360"
          });
        }
        
      } catch (err) {
        console.error("Erreur d'authentification:", err);
        setError("Impossible de vérifier votre identité.");
      } finally {
        setLoadingAuth(false);
      }
    };
    
    authenticateUser();
  }, []);

  function openMissionDetail(mission: any) { 
    setSelectedMission(mission); 
    setShowMissionDetail(true); 
  }
  
  const refuserNotification = useCallback(async (demandeId: number) => {
    if (actionLoading[demandeId]) return;
    setActionLoading(prev => ({ ...prev, [demandeId]: true }));
    setNotifications(prev => prev.filter(n => n.id !== demandeId));
    try {
      const endpoints = [
        `${BASE}/demandes-service/${demandeId}/refuser-expert`, 
        `${BASE}/demandes-service/${demandeId}/refuser`, 
        `${BASE}/demandes-service/${demandeId}/expert/refuser`
      ];
      for (const url of endpoints) { 
        try { 
          const res = await fetch(url, { method: "PUT", headers: hdrJ() }); 
          if (res.ok) break; 
        } catch {} 
      }
      notify("Mission refusée");
    } catch { 
      notify("Erreur lors du refus", false); 
    } finally { 
      setActionLoading(prev => ({ ...prev, [demandeId]: false })); 
      await loadNotifications(); 
      await loadDemandesAssignees(); 
    }
  }, [hdrJ, actionLoading, loadNotifications, loadDemandesAssignees]);

  const handleAccepterMission = useCallback((mission: any) => { 
    setDevisMission(mission); 
    setShowDevisModal(true); 
  }, []);

  const acceptMissionAndCreateDevis = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!devisMission) return;
    if (!devisForm.montant || Number(devisForm.montant) <= 0) { 
      notify("Veuillez saisir un montant valide", false); 
      return; 
    }
    setActionLoading(prev => ({ ...prev, [devisMission.id]: true }));
    try {
      const devisRes = await fetch(`${BASE}/demandes-service/${devisMission.id}/soumettre-devis`, {
        method: "POST",
        headers: hdrJ(),
        body: JSON.stringify({
          montant: Number(devisForm.montant),
          description: devisForm.description,
          delai: devisForm.delai
        })
      });
      
      if (devisRes.ok) {
        notify("✅ Devis envoyé au client !");
        setNotifications(prev => prev.filter(n => n.id !== devisMission.id));
        setShowDevisModal(false);
        setDevisMission(null);
        setDevisForm({ montant: "", description: "", delai: "" });
        await loadExpertData(user?.id);
      } else {
        const err = await devisRes.json().catch(() => ({}));
        notify(`Erreur devis : ${err.message || "Erreur inconnue"}`, false);
      }
    } catch (err) {
      console.error(err);
      notify("Erreur réseau", false);
    }
    finally { 
      setActionLoading(prev => ({ ...prev, [devisMission?.id]: false })); 
      await loadNotifications(); 
      await loadDemandesAssignees(); 
    }
  };

  const updateMissionStatus = async (demandeId: number, statut: string) => {
    setActionLoading(prev => ({ ...prev, [demandeId]: true }));
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/statut-expert`, { 
        method: "PATCH", 
        headers: hdrJ(), 
        body: JSON.stringify({ statut }) 
      });
      if (r.ok) { 
        notify(`✅ Mission ${statut === "en_cours" ? "démarrée" : "terminée"}`); 
        setDemandesAssignees(prev => prev.map(d => d.id === demandeId ? { ...d, statut } : d)); 
      } else notify("Erreur", false);
    } catch { 
      notify("Erreur réseau", false); 
    } finally { 
      setActionLoading(prev => ({ ...prev, [demandeId]: false })); 
    }
  };

  const openDevisModal = (demande: any) => { 
    setDevisMission(demande); 
    setShowDevisModal(true); 
  };
  
  const openCertificationModal = (demande: any) => {
    const formationLiee = formations.find(f => 
      f.titre?.toLowerCase().includes(demande.service?.toLowerCase()) || 
      demande.service?.toLowerCase().includes("formation")
    ) || { titre: demande.service || "Formation", duree: demande.delai || "" };
    setCertificationFormation(formationLiee); 
    setCertificationClient(demande.user); 
    setShowCertificationModal(true);
  };
  
  const envoyerCertification = async (formData: FormData) => {
    try {
      const res = await fetch(`${BASE}/certifications/envoyer`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${tk()}` }, 
        body: formData 
      });
      if (res.ok) { 
        notify("✅ Certification envoyée par email au client !"); 
        return;
      }
      const error = await res.json().catch(() => ({}));
      notify(`❌ Erreur: ${error.message || "Erreur lors de l'envoi"}`, false);
    } catch (err) { 
      console.error(err);
      throw new Error("Erreur lors de l'envoi de la certification"); 
    }
  };

  useEffect(() => {
    if (!user || !expert) return;
    const interval = setInterval(async () => { 
      await loadNotifications(expert.id); 
      await loadDemandesAssignees(); 
      try { 
        const rdvRes = await fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() }); 
        if (rdvRes.ok) setRdvs(await rdvRes.json()); 
      } catch {} 
    }, 30000);
    return () => clearInterval(interval);
  }, [user, expert, hdr, loadNotifications, loadDemandesAssignees]);

  useEffect(() => { 
    if (tab === "messages") { 
      refreshAllMessages(); 
      const interval = setInterval(() => refreshAllMessages(), 10000); 
      return () => clearInterval(interval); 
    } 
  }, [tab, refreshAllMessages]);
  
  useEffect(() => { 
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [conversation]);
  
  useEffect(() => { 
    if (!pubTemos.length) return; 
    const t = setInterval(() => { 
      if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); 
    }, 5000); 
    return () => clearInterval(t); 
  }, [pubTemos.length, tAnim]);
  
  function goT(i: number) { 
    if (tAnim || !pubTemos.length) return; 
    setTAnim(true); 
    setTimeout(() => { 
      setTIdx(i); 
      setTAnim(false); 
    }, 280); 
  }
  
  useEffect(() => { 
    if (tab === "demandes" && user && expert) { 
      loadNotifications(expert.id); 
      loadDemandesAssignees(); 
    } 
  }, [tab, user, expert, loadNotifications, loadDemandesAssignees]);
  
  useEffect(() => { 
    if (tab === "notifications") { 
      loadNewsNotifications(); 
    } 
  }, [tab, loadNewsNotifications]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "accueil", label: "Tableau de bord", icon: <FaChartLine size={15} /> },
    { id: "profil", label: "Mon Profil", icon: <FaUserCircle size={15} /> },
    { id: "formations", label: "Mes Formations", icon: <FaBook size={15} /> },
    { id: "podcasts", label: "Mes Podcasts", icon: <FaMicrophone size={15} /> },
    { id: "demandes", label: "Missions", icon: <FaClipboardList size={15} />, badge: notificationsCount > 0 ? notificationsCount : undefined },
    { id: "devis", label: "Mes Devis", icon: <FaFileInvoiceDollar size={15} /> },
    { id: "messages", label: "Messagerie", icon: <FaComments size={15} />, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined },
    { id: "rdv", label: "Rendez-vous", icon: <FaCalendarCheck size={15} />, badge: pendingRdvCount > 0 ? pendingRdvCount : undefined },
    { id: "notifications", label: "Actualités", icon: <FaBullhorn size={15} />, badge: newsNotificationsCount > 0 ? newsNotificationsCount : undefined },
    { id: "contact_admin", label: "Contacter administrateur", icon: <FaHeadset size={15} /> },
  ];

  // ÉCRANS DE CHARGEMENT
  if (loadingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: "#0A2540", fontWeight: 600, marginTop: 16 }}>Chargement de votre espace expert...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <div style={{ padding: 32, maxWidth: 500, textAlign: "center", background: "#fff", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "#EF4444" }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Erreur de connexion</div>
          <div style={{ color: "#64748B", marginBottom: 20 }}>{error}</div>
          <div style={{ marginBottom: 16, fontSize: 13, color: "#94A3B8" }}>
            Vérifiez que le backend est démarré sur <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>http://localhost:3001</code>
          </div>
          <button 
            style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 9, padding: "11px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginRight: 10 }} 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
          <button 
            style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 9, padding: "11px 22px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} 
            onClick={() => router.push("/connexion")}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== "expert") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <div style={{ padding: 32, maxWidth: 500, textAlign: "center", background: "#fff", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "#EF4444" }}>⚠</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Accès refusé</div>
          <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 9, padding: "11px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={() => window.location.href = "/connexion"}>
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  const photoUrl = expert?.photo ? `${BASE}/uploads/photos/${expert?.photo}` : null;
  const initials = user ? (user.prenom?.[0] || "") + (user.nom?.[0] || "") : "?";
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];
  const ADMIN_EMAIL = contactInfo?.email || "plateformebeh@gmail.com";
  const ADMIN_PHONE = contactInfo?.telephone || "29524360";
  const MAILTO_HREF = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Message Expert - " + (user?.prenom || "") + " " + (user?.nom || ""))}&body=${encodeURIComponent("Bonjour,\n\nJe suis " + (user?.prenom || "") + " " + (user?.nom || "") + " (" + (user?.email || "") + "), expert sur la plateforme BEH.\n\n")}`;
  const TEL_HREF = `tel:+216${ADMIN_PHONE.replace(/\s/g, "")}`;

  // Rendu principal
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s,box-shadow .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.08);}
        textarea.inp{resize:vertical;min-height:90px;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.65);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:720px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        .upload-zone{display:block;border:2px dashed #D1D5DB;border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:#F7B500;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .status-badge{border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:5px;}
        .sb-green{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;}
        .sb-red{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}
        .sb-yellow{background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;}
        .sb-blue{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;}
        .sb-purple{background:#F3E8FF;color:#7C3AED;border:1px solid #DDD6FE;}
        .sidebar-item{width:100%;display:flex;align-items:center;gap:11px;padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,.5);background:transparent;transition:all .18s;text-align:left;position:relative;}
        .sidebar-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.9);}
        .sidebar-item.active{background:rgba(247,181,0,.14);color:#F7B500;font-weight:800;}
        .sidebar-item.active svg{color:#F7B500;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes onlinePulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}70%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}
        .fade-up{animation:fadeUp .35s ease;}
        .chip{display:inline-flex;align-items:center;gap:6px;background:#F8FAFC;border:1px solid #E8EEF6;border-radius:8px;padding:5px 10px;font-size:12px;color:#475569;font-weight:600;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)", maxWidth: 380 }}>
          {toast.text}
        </div>
      )}

      {/* MODALES */}
      {showMissionDetail && selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => { setShowMissionDetail(false); setSelectedMission(null); }} onAccepter={handleAccepterMission} onRefuser={refuserNotification} />}
      {showFormationModal && <ProposerFormationModal onClose={() => setShowFormationModal(false)} onSuccess={() => { notify("Formation soumise !"); loadExpertData(user?.id); }} expertData={expert} user={user} tk={tk} />}
      {selectedPodcast && <PodcastDetailModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} />}
      {showCreatePodcastModal && expert && <CreatePodcastModal onClose={() => setShowCreatePodcastModal(false)} onSuccess={() => loadExpertData(user?.id)} expertData={expert} />}
      {showEditPodcastModal && editingPodcast && <EditPodcastModal podcast={editingPodcast} onClose={() => { setShowEditPodcastModal(false); setEditingPodcast(null); }} onSuccess={() => loadExpertData(user?.id)} />}
      {showRescheduleModal && selectedRdv && <RescheduleModal rdv={selectedRdv} onClose={() => { setShowRescheduleModal(false); setSelectedRdv(null); }} hdrJ={hdrJ} onSuccess={() => { notify("Proposition envoyée !"); loadExpertData(user?.id); }} />}
      {showCertificationModal && certificationFormation && (
        <CertificationModal 
          formation={certificationFormation} 
          clientInfo={certificationClient} 
          expertInfo={expert} 
          onClose={() => { setShowCertificationModal(false); setCertificationFormation(null); setCertificationClient(null); }} 
          onSend={envoyerCertification} 
        />
      )}
      {showDevisModal && devisMission && (
        <div className="modal-bg" onClick={() => setShowDevisModal(false)}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a4a8a)", padding: "22px 28px", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaFileInvoiceDollar style={{ color: "#F7B500", fontSize: 20 }} /></div>
                  <div>
                    <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Accepter et créer un devis</div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{devisMission.service}</div>
                    <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 3 }}>Client : {devisMission.user?.prenom} {devisMission.user?.nom}</div>
                  </div>
                </div>
                <button onClick={() => setShowDevisModal(false)} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
              </div>
            </div>
            <form onSubmit={acceptMissionAndCreateDevis} style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 18 }}><Lbl>Montant proposé (DT) *</Lbl>
                <div style={{ position: "relative" }}>
                  <input className="inp" type="number" min="1" step="0.5" required value={devisForm.montant} onChange={e => setDevisForm({ ...devisForm, montant: e.target.value })} placeholder="Ex: 500" style={{ paddingRight: 50 }} />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>DT</span>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}><Lbl>Description des prestations</Lbl><textarea className="inp" rows={4} value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} placeholder="Détaillez les prestations incluses, les livrables attendus..." /></div>
              <div style={{ marginBottom: 24 }}><Lbl>Délai de réalisation</Lbl><input className="inp" value={devisForm.delai} onChange={e => setDevisForm({ ...devisForm, delai: e.target.value })} placeholder="Ex: 2 semaines, 1 mois..." /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setShowDevisModal(false)}>Annuler</button>
                <button type="submit" style={{ background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaCheck size={13} /> Accepter et envoyer le devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <aside style={{ width: sidebarCollapsed ? 68 : 248, background: "linear-gradient(180deg,#0A2540 0%,#0d2d4e 100%)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden", zIndex: 90 }}>
          <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, background: "#F7B500", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 11, flexShrink: 0 }}>BEH</div>
              {!sidebarCollapsed && <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Espace Expert</div><div style={{ color: "rgba(255,255,255,.35)", fontSize: 10.5 }}>Business Expert Hub</div></div>}
            </div>
            <button onClick={() => router.push("/")} style={{ width: sidebarCollapsed ? 44 : "calc(100% - 0px)", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.04)", transition: "all .2s", whiteSpace: "nowrap", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(247,181,0,.12)"; e.currentTarget.style.color = "#F7B500"; e.currentTarget.style.borderColor = "rgba(247,181,0,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}>
              <FaArrowLeft size={11} style={{ flexShrink: 0 }} />{!sidebarCollapsed && <span>Retour au site</span>}
            </button>
          </div>

          <div style={{ margin: "10px", background: "rgba(247,181,0,.07)", border: "1px solid rgba(247,181,0,.15)", borderRadius: 13, padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(247,181,0,.5)" }}>
                  {(photoPreview || photoUrl) ? <img src={photoPreview || photoUrl || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 15, color: "#0A2540", fontWeight: 900 }}>{initials}</span>}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444", border: "2px solid #0d2d4e", ...(isOnline ? { animation: "onlinePulse 2s infinite" } : {}) }} />
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.prenom} {user?.nom}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: 10.5, marginTop: 2 }}>{expert?.domaine || "Expert"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: isOnline ? "#10B981" : "#EF4444" }}>{isOnline ? "Connecté" : "Hors ligne"}</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "6px 8px", overflowY: "auto" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: "1.5px", padding: sidebarCollapsed ? "8px 0" : "8px 6px", textAlign: sidebarCollapsed ? "center" : "left" }}>
              {!sidebarCollapsed ? "Navigation" : "—"}
            </div>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const isSupport = t.id === "contact_admin";
              return (
                <button key={t.id} className={`sidebar-item${isActive ? " active" : ""}`} onClick={() => setTab(t.id)}
                  style={{ marginBottom: 2, ...(isSupport && !isActive ? { borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 8, paddingTop: 12 } : {}) }}>
                  <span style={{ flexShrink: 0, color: isActive ? "#F7B500" : "rgba(255,255,255,.45)" }}>{t.icon}</span>
                  {!sidebarCollapsed && <span style={{ flex: 1 }}>{t.label}</span>}
                  {t.badge && (
                    <span style={{ background: isActive ? "#F7B500" : "#EF4444", color: isActive ? "#0A2540" : "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 10, fontWeight: 800, position: sidebarCollapsed ? "absolute" : "static", top: sidebarCollapsed ? 6 : undefined, right: sidebarCollapsed ? 6 : undefined }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="sidebar-item" style={{ marginBottom: 4, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
              <FaArrowLeft size={13} style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform .2s", color: "rgba(255,255,255,.4)" }} />
              {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Réduire</span>}
            </button>
            <button onClick={forceLogout} className="sidebar-item" style={{ justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
              <FaSignOutAlt size={14} style={{ color: "rgba(255,255,255,.4)" }} />
              {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
          {/* Header */}
          <header style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 80, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ color: "#F7B500" }}>{TABS.find(t => t.id === tab)?.icon}</span>
                {TABS.find(t => t.id === tab)?.label}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: isOnline ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${isOnline ? "#A7F3D0" : "#FECACA"}`, borderRadius: 99, padding: "5px 12px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444", ...(isOnline ? { animation: "onlinePulse 2s infinite" } : {}) }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isOnline ? "#059669" : "#DC2626" }}>{isOnline ? "En ligne" : "Hors ligne"}</span>
              </div>
              {(unreadMsgCount + pendingRdvCount + notificationsCount + newsNotificationsCount) > 0 && (
                <div style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaBell size={11} /> {unreadMsgCount + pendingRdvCount + notificationsCount + newsNotificationsCount} notification(s)
                </div>
              )}
              <button style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 9, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={async () => { await loadExpertData(user?.id); notify("Données actualisées"); }}>
                <FaSync size={11} /> Actualiser
              </button>
            </div>
          </header>

          <main style={{ flex: 1, padding: "28px 28px" }}>
            {/* ACCUEIL */}
            {tab === "accueil" && (
              <div className="fade-up">
                <section style={{ position: "relative", overflow: "hidden", minHeight: 360, borderRadius: 20, marginBottom: 24 }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    <Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} />
                  </div>
                  <div style={{ position: "relative", zIndex: 10, padding: "60px 40px 70px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>Bienvenue, {user?.prenom}</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(24px,3.5vw,44px)", fontWeight: 900, color: "#fff", marginBottom: 14, lineHeight: 1.15 }}>
                      Accompagnez les <span style={{ color: "#F7B500" }}>startups</span><br />vers l'excellence
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", maxWidth: 460, lineHeight: 1.9, marginBottom: 26 }}>Proposez vos formations, podcasts, et accompagnez les startups dans leur croissance.</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => setTab("formations")}>
                        <FaBook size={13} /> Mes formations
                      </button>
                      <button style={{ background: "rgba(139,92,246,.85)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => setTab("podcasts")}>
                        <FaMicrophone size={13} /> Mes podcasts
                      </button>
                      {notificationsCount > 0 && (
                        <button style={{ background: "rgba(245,158,11,.2)", color: "#F7B500", border: "1px solid rgba(245,158,11,.4)", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => setTab("demandes")}>
                          <FaBell size={12} /> {notificationsCount} nouvelle{notificationsCount > 1 ? "s" : ""} mission{notificationsCount > 1 ? "s" : ""}
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                  {[
                    { icon: <FaClipboardList size={20} />, label: "Missions assignées", value: demandesAssignees.length, color: "#8B5CF6" },
                    { icon: <FaBook size={20} />, label: "Formations soumises", value: formations.length, color: "#F7B500" },
                    { icon: <FaMicrophone size={20} />, label: "Podcasts proposés", value: podcasts.length, color: "#7C3AED" },
                    { icon: <FaNewspaper size={20} />, label: "Actualités", value: newsNotifications.length, color: "#10B981" },
                  ].map((kpi, i) => (
                    <div key={i} style={{ background: "#fff", border: "1.5px solid #E8EEF6", borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color, flexShrink: 0 }}>{kpi.icon}</div>
                      <div><div style={{ fontSize: 28, fontWeight: 800, color: "#0A2540" }}>{kpi.value}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{kpi.label}</div></div>
                    </div>
                  ))}
                </div>

                <section style={{ padding: "36px 28px", background: "#F8FAFC", borderRadius: 20, marginBottom: 24 }}>
                  <Reveal><div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(22px,3vw,36px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F7B500" }}>ADN</span></h2></div></Reveal>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {ADN_ITEMS.map((card, i) => (
                      <Reveal key={i} delay={i * .1}>
                        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(10,37,64,.07)", padding: "20px 20px 18px", cursor: "pointer", transition: "transform .28s,box-shadow .28s" }}
                          onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(10,37,64,.09)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: card.color }}>
                            {i === 0 ? <FaBullseye size={18} /> : i === 1 ? <FaRocket size={18} /> : <FaStar size={18} />}
                          </div>
                          <h3 style={{ fontWeight: 700, color: "#0A2540", fontSize: 17, marginBottom: 7 }}>{card.title}</h3>
                          <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.8, marginBottom: 12 }}>{card.body}</p>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: card.color }}>
                            En savoir plus <FaArrowRight size={9} />
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </section>

                <section style={{ marginBottom: 24 }}>
                  <Reveal>
                    <div style={{ borderRadius: 22, background: "linear-gradient(135deg,#0A2540 0%,#1a3f6f 100%)", position: "relative", padding: "40px 44px", overflow: "hidden" }}>
                      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "34px 34px", pointerEvents: "none" }} />
                      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <FaEnvelope style={{ color: "#F7B500", fontSize: 22 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(247,181,0,.7)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Newsletter BEH</div>
                              <h2 style={{ fontSize: "clamp(17px,2.5vw,24px)", fontWeight: 800, color: "#fff" }}>Restez <span style={{ color: "#F7B500" }}>informé</span></h2>
                            </div>
                          </div>
                          <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.85, maxWidth: 420 }}>
                            Recevez nos actualités, nouvelles formations et ressources exclusives réservées aux experts BEH.
                          </p>
                        </div>
                        <div style={{ flex: 1, minWidth: 300 }}>
                          {nlSent ? (
                            <div style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaCheck style={{ color: "#fff", fontSize: 14 }} /></div>
                              <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Inscription réussie !</div><div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 2 }}>Vous recevrez nos prochaines actualités.</div></div>
                            </div>
                          ) : (
                            <form onSubmit={handleNewsletter} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <div style={{ position: "relative" }}>
                                <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                                <input type="email" value={nlEmail} onChange={e => { setNlEmail(e.target.value); setNlError(""); }} placeholder="Votre adresse e-mail" required style={{ width: "100%", background: "#fff", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: 11, padding: "13px 14px 13px 38px", fontFamily: "inherit", fontSize: 13.5, color: "#0A2540", outline: "none" }} />
                              </div>
                              <button type="submit" disabled={nlLoading} style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 11, padding: "14px", fontWeight: 800, fontSize: 14, cursor: nlLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                {nlLoading ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Inscription...</> : <><span>S'inscrire à la newsletter</span><FaArrowRight size={12} /></>}
                              </button>
                              {nlError && <div style={{ color: "#FCA5A5", fontSize: 12, background: "rgba(239,68,68,.1)", borderRadius: 8, padding: "8px 12px" }}>{nlError}</div>}
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </section>

                {pubTemos.length > 0 && (
                  <section style={{ padding: "36px 28px", background: "#fff", borderRadius: 20 }}>
                    <div style={{ maxWidth: 700, margin: "0 auto" }}>
                      <div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(20px,3vw,34px)", color: "#0A2540" }}>Ce que disent nos <span style={{ color: "#F7B500" }}>clients</span></h2></div>
                      {curTemo && (
                        <div>
                          <div style={{ background: "#0A2540", borderRadius: 20, padding: "32px 40px", position: "relative", opacity: tAnim ? 0 : 1, transition: "all .3s" }}>
                            <FaQuoteLeft style={{ position: "absolute", top: 20, left: 26, fontSize: 28, color: "rgba(247,181,0,.15)" }} />
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F7B500" : "#334155", fontSize: 18 }}>★</span>)}</div>
                            <p style={{ fontStyle: "italic", color: "#fff", lineHeight: 1.8, textAlign: "center", marginBottom: 20, fontSize: "clamp(14px,2vw,17px)" }}>&ldquo;{curTemo.texte}&rdquo;</p>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0A2540", margin: "0 auto 8px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                              <div style={{ color: "#fff", fontWeight: 700 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                              <div style={{ color: "#F7B500", fontSize: 11, fontWeight: 600, marginTop: 3 }}>{curTemo.startup?.nom_startup || "Startup BEH"}</div>
                            </div>
                          </div>
                          {pubTemos.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                              <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronLeft size={11} /></button>
                              <div style={{ display: "flex", gap: 6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 6, width: i === tIdx ? 20 : 6, borderRadius: 99, border: "none", background: i === tIdx ? "#F7B500" : "rgba(10,37,64,.2)", cursor: "pointer", transition: "all .3s" }} />)}</div>
                              <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronRight size={11} /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* PROFIL */}
            {tab === "profil" && (
              <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
                <div className="card" style={{ padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #F7B500" }}>
                      {(photoPreview || photoUrl) ? <img src={photoPreview || photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
                    </div>
                    <label style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "#F7B500", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                      <FaCamera style={{ fontSize: 11, color: "#0A2540" }} />
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                    </label>
                    <div style={{ position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444", border: "2.5px solid #fff", ...(isOnline ? { animation: "onlinePulse 2s infinite" } : {}) }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{user?.prenom} {user?.nom}</div>
                    <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{user?.email}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: isOnline ? "#059669" : "#DC2626" }}>{isOnline ? "En ligne" : "Hors ligne"}</span>
                    </div>
                    {photoFile && (
                      <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }} onClick={updatePhoto}>
                        <FaCheck size={10} /> Sauvegarder la photo
                      </button>
                    )}
                  </div>
                </div>
                {modificationEnAttente && (
                  <div className="card" style={{ marginBottom: 20, background: "#FFFBEB", borderLeft: "4px solid #F7B500", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <FaInfoCircle style={{ color: "#F7B500", fontSize: 20 }} />
                    <div><strong>Modification en attente de validation</strong><br /><span style={{ fontSize: 13, color: "#64748B" }}>Votre demande a été envoyée à l'administrateur.</span></div>
                  </div>
                )}
                <div className="card">
                  <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Informations professionnelles</div></div>
                  <div style={{ padding: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div><Lbl>Domaine d'expertise</Lbl><input className="inp" value={editProfil.domaine} onChange={e => setEditProfil({ ...editProfil, domaine: e.target.value })} disabled={modificationEnAttente} /></div>
                      <div><Lbl>Année de début</Lbl><input className="inp" type="number" value={editProfil.annee_debut_experience} onChange={e => setEditProfil({ ...editProfil, annee_debut_experience: e.target.value })} disabled={modificationEnAttente} /></div>
                      <div><Lbl>Localisation</Lbl><input className="inp" value={editProfil.localisation} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} disabled={modificationEnAttente} /></div>
                      <div><Lbl>Téléphone</Lbl><input className="inp" value={editProfil.telephone} onChange={e => setEditProfil({ ...editProfil, telephone: e.target.value })} disabled={modificationEnAttente} /></div>
                    </div>
                    <div style={{ marginBottom: 20 }}><Lbl>Description</Lbl><textarea className="inp" rows={4} value={editProfil.description} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} disabled={modificationEnAttente} /></div>
                    {!modificationEnAttente && (
                      <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={updateProfile}>
                        <FaSave size={13} /> Envoyer les modifications
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FORMATIONS */}
            {tab === "formations" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>Mes formations proposées</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{formations.length} formation(s)</div></div>
                  <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => setShowFormationModal(true)}>
                    <FaPlus size={12} /> Proposer une formation
                  </button>
                </div>
                {formations.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><FaBook style={{ fontSize: 32, color: "#3B82F6" }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 8 }}>Aucune formation proposée</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>Proposez votre première formation à nos startups.</div>
                    <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7 }} onClick={() => setShowFormationModal(true)}>
                      <FaPlus size={12} /> Proposer une formation
                    </button>
                  </div>
                ) : (
                  formations.map(f => (
                    <div key={f.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${f.statut === "publie" ? "#10B981" : f.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{f.titre}</div>
                              {f.certifiante && <span style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><FaCertificate size={9} /> Certifiante</span>}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {f.domaine && <span className="chip"><FaTag size={9} /> {f.domaine}</span>}
                              {f.mode && <span className="chip">{f.mode === "en_ligne" ? "En ligne" : f.mode === "presentiel" ? "Présentiel" : "Hybride"}</span>}
                              {f.duree && <span className="chip"><FaClock size={9} /> {f.duree}</span>}
                              {f.gratuit ? <span style={{ background: "#ECFDF5", color: "#059669", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Gratuit</span> : f.prix ? <span style={{ background: "#FFF8E1", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{f.prix} DT</span> : null}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {f.formateur_details && Array.isArray(f.formateur_details) && f.formateur_details.length > 0 && (
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0A2540", marginTop: 4, marginBottom: 6 }}>Formateur(s) :</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {f.formateur_details.map((fd: any, idx: number) => (
                                      <div key={idx} className="chip" style={{ padding: "4px 12px", background: "#F3E8FF", borderColor: "#DDD6FE" }}>
                                        {fd.image && <img src={`${BASE}/uploads/formateurs/${fd.image}`} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} alt="" />}
                                        <span><strong>{fd.prenom} {fd.nom}</strong> {fd.domaine && `· ${fd.domaine}`}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {f.description && <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, maxWidth: 560, marginTop: 8 }}>{f.description?.slice(0, 140)}{f.description?.length > 140 ? "..." : ""}</div>}
                            <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <span className={`status-badge ${f.statut === "publie" ? "sb-green" : f.statut === "refuse" ? "sb-red" : "sb-yellow"}`}>
                              {f.statut === "publie" ? <><FaCheck size={10} /> Publiée</> : f.statut === "refuse" ? <><FaTimes size={10} /> Refusée</> : <><FaClock size={10} /> En attente</>}
                            </span>
                            {f.statut === "publie" && f.certifiante && (
                              <button style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}
                                onClick={() => { setCertificationFormation(f); setCertificationClient(null); setShowCertificationModal(true); }}>
                                <FaCertificate size={11} /> Envoyer certif.
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PODCASTS */}
            {tab === "podcasts" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>Mes podcasts proposés</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{podcasts.length} podcast(s)</div></div>
                  <button style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }} onClick={() => setShowCreatePodcastModal(true)}>
                    <FaPlus size={12} /> Proposer un podcast
                  </button>
                </div>
                {podcasts.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><FaMicrophone style={{ fontSize: 32, color: "#7C3AED" }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 8 }}>Aucun podcast proposé</div>
                    <div style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>Partagez votre expertise via des podcasts audio.</div>
                    <button style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7 }} onClick={() => setShowCreatePodcastModal(true)}>
                      <FaPlus size={12} /> Proposer un podcast
                    </button>
                  </div>
                ) : (
                  podcasts.map(p => (
                    <div key={p.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${p.statut === "publie" ? "#10B981" : p.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 6 }}>{p.titre}</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
                              {p.auteur && <span className="chip"><FaMicrophone size={9} /> {p.auteur}</span>}
                              {p.domaine && <span className="chip"><FaTag size={9} /> {p.domaine}</span>}
                            </div>
                            {p.description && <div style={{ fontSize: 13, color: "#475569", maxWidth: 560, lineHeight: 1.65 }}>{p.description?.slice(0, 120)}...</div>}
                            <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <span className={`status-badge ${p.statut === "publie" ? "sb-green" : p.statut === "refuse" ? "sb-red" : "sb-yellow"}`}>
                              {p.statut === "publie" ? <><FaCheck size={10} /> Publié</> : p.statut === "refuse" ? <><FaTimes size={10} /> Refusé</> : <><FaClock size={10} /> En attente</>}
                            </span>
                            <div style={{ display: "flex", gap: 7 }}>
                              <button style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setEditingPodcast(p); setShowEditPodcastModal(true); }}><FaEdit size={10} /> Modifier</button>
                              <button style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => handleDeletePodcast(p.id)}><FaTrash size={10} /> Supprimer</button>
                              {p.url_audio && <button style={{ background: "#F3F0FF", color: "#7C3AED", border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => setSelectedPodcast(p)}><FaHeadphones size={10} /> Écouter</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DEMANDES / MISSIONS */}
            {tab === "demandes" && (
              <div className="fade-up">
                {/* Nouvelles missions */}
                {notifications.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEF3C7", border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center" }}><FaBell style={{ color: "#F7B500", fontSize: 20 }} /></div>
                      <div>
                        <h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540" }}>Nouvelles missions disponibles</h3>
                        <div style={{ fontSize: 12, color: "#8A9AB5" }}>Consultez les détails et répondez à chaque demande</div>
                      </div>
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 800 }}>{notifications.length} nouvelle(s)</span>
                        <button style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { loadNotifications(expert?.id); loadDemandesAssignees(); }}><FaSync size={10} /> Actualiser</button>
                      </div>
                    </div>
                    {notifications.map(d => {
                      const isLoading = actionLoading[d.id];
                      return (
                        <div key={d.id} className="notif-row" style={{ opacity: isLoading ? .5 : 1 }}>
                          <div style={{ padding: "18px 22px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#0A2540,#1a4080)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaClipboardList style={{ color: "#F7B500", fontSize: 18 }} /></div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{d.service}</div>
                                    <div style={{ fontSize: 11, color: "#8A9AB5" }}>{new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                                  </div>
                                  <span className="status-badge sb-yellow" style={{ marginLeft: "auto" }}><FaClock size={9} /> Nouvelle mission</span>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                                  <span className="chip"><FaUser size={9} /> {d.user?.prenom} {d.user?.nom}</span>
                                  {d.user?.startup?.nom_startup && <span className="chip"><FaBuilding size={9} /> {d.user.startup.nom_startup}</span>}
                                  {d.user?.startup?.secteur && <span className="chip"><FaTag size={9} /> {d.user.startup.secteur}</span>}
                                  {d.telephone && <span className="chip"><FaPhone size={9} /> {d.telephone}</span>}
                                  {d.delai && <span className="chip"><FaClock size={9} /> {d.delai}</span>}
                                </div>
                                {d.description && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E8EEF6", margin: 0 }}>
                                    {d.description.length > 180 ? d.description.slice(0, 180) + "…" : d.description}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                                <button disabled={isLoading} onClick={() => openMissionDetail(d)} style={{ display: "flex", alignItems: "center", gap: 7, background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                                  <FaEye size={12} /> Voir les détails
                                </button>
                                <button disabled={isLoading} onClick={() => handleAccepterMission(d)} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", color: "#059669", border: "1.5px solid #A7F3D0", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                                  <FaCheck size={11} /> Accepter — Créer un devis
                                </button>
                                <button disabled={isLoading} onClick={() => { if (confirm("Refuser cette mission ?")) refuserNotification(d.id); }} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                                  <FaTimesCircle size={11} /> Refuser
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: 1, background: "linear-gradient(to right, transparent, #E8EEF6, transparent)", margin: "8px 0 28px" }} />
                  </div>
                )}

                {notifications.length === 0 && demandesAssignees.length === 0 && (
                  <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                    <FaCheckCircle style={{ color: "#10B981", fontSize: 22, flexShrink: 0 }} />
                    <div><div style={{ fontSize: 13.5, color: "#059669", fontWeight: 700 }}>Aucune mission en attente.</div><div style={{ fontSize: 12, color: "#047857", marginTop: 3 }}>Les missions vous seront notifiées dès qu'un client vous sélectionne.</div></div>
                    <button style={{ marginLeft: "auto", background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { loadNotifications(expert?.id); loadDemandesAssignees(); }}><FaSync size={10} /> Vérifier</button>
                  </div>
                )}

                {/* Missions assignées */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>Mes missions assignées</h2>
                    <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                      {demandesAssignees.filter(d => d.statut === "en_cours").length} en cours · {demandesAssignees.filter(d => d.statut === "terminee").length} terminées
                    </div>
                  </div>
                  <button style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => loadExpertData(user?.id)}><FaSync size={10} /> Rafraîchir</button>
                </div>

                {demandesAssignees.length === 0 ? (
                  <div className="card" style={{ padding: "52px 0", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><FaClipboardList style={{ fontSize: 28, color: "#94A3B8" }} /></div>
                    <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucune mission assignée</div>
                    <div style={{ fontSize: 13, color: "#8A9AB5" }}>Les missions apparaîtront ici après que vous les aurez acceptées.</div>
                  </div>
                ) : (
                  demandesAssignees.map(d => {
                    const statutColor = d.statut === "en_cours" ? "#3B82F6" : d.statut === "terminee" ? "#8B5CF6" : "#F7B500";
                    return (
                      <div key={d.id} className="mission-row" style={{ marginBottom: 14, borderLeft: `4px solid ${statutColor}` }} onClick={() => openMissionDetail(d)}>
                        <div style={{ padding: "20px 22px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${statutColor}15`, border: `1.5px solid ${statutColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {d.statut === "en_cours" ? <FaSync style={{ color: statutColor, fontSize: 16 }} /> : d.statut === "terminee" ? <FaCheck style={{ color: statutColor, fontSize: 16 }} /> : <FaClock style={{ color: statutColor, fontSize: 16 }} />}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{d.service}</div>
                                  <div style={{ fontSize: 11, color: "#8A9AB5" }}>{new Date(d.updatedAt || d.createdAt).toLocaleDateString("fr-FR")}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: d.description ? 10 : 0 }}>
                                <span className="chip"><FaUser size={9} /> {d.user?.prenom} {d.user?.nom}</span>
                                {d.user?.startup?.nom_startup && <span className="chip"><FaBuilding size={9} /> {d.user.startup.nom_startup}</span>}
                                {d.delai && <span className="chip"><FaClock size={9} /> {d.delai}</span>}
                              </div>
                              {d.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginTop: 8, background: "#F8FAFC", padding: "9px 13px", borderRadius: 9, border: "1px solid #E8EEF6", margin: 0 }}>{d.description.length > 200 ? d.description.slice(0, 200) + "…" : d.description}</p>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                              <span className={`status-badge ${d.statut === "en_attente" ? "sb-yellow" : d.statut === "en_cours" ? "sb-blue" : d.statut === "terminee" ? "sb-purple" : "sb-red"}`}>
                                {d.statut === "en_attente" ? "En attente" : d.statut === "en_cours" ? "En cours" : d.statut === "terminee" ? "Terminée" : "Refusée"}
                              </span>
                              {d.statut === "en_attente" && <button style={{ background: "#ECFDF5", color: "#059669", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => updateMissionStatus(d.id, "en_cours")}><FaRocket size={10} /> Démarrer</button>}
                              {d.statut === "en_cours" && <button style={{ background: "#F3E8FF", color: "#7C3AED", border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => updateMissionStatus(d.id, "terminee")}><FaCheckDouble size={10} /> Terminer</button>}
                              {d.statut !== "terminee" && d.statut !== "refusee" && <button style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => openDevisModal(d)}><FaFileInvoiceDollar size={10} /> Créer un devis</button>}
                              {d.statut === "terminee" && <button style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => openCertificationModal(d)}><FaCertificate size={11} /> Envoyer certif.</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* DEVIS */}
            {tab === "devis" && (
              <div className="fade-up">
                <div style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", marginBottom: 6 }}>Mes devis envoyés</div>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{mesDevis.length} devis</div>
                {mesDevis.length === 0 ? (
                  <div className="card" style={{ padding: "52px 0", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><FaFileInvoiceDollar style={{ fontSize: 28, color: "#94A3B8" }} /></div>
                    <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucun devis</div>
                    <div style={{ fontSize: 13, color: "#8A9AB5" }}>Créez des devis depuis vos missions.</div>
                  </div>
                ) : (
                  mesDevis.map(d => (
                    <div key={d.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${d.statut === "accepte" ? "#22C55E" : d.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 5 }}>Devis #{d.id} — {d.demande?.service || "Mission"}</div>
                            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                              <span className="chip"><FaUser size={9} /> {d.demande?.user?.prenom} {d.demande?.user?.nom}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#F7B500" }}>{d.montant?.toLocaleString()} DT</span>
                            </div>
                            {d.description && <p style={{ fontSize: 13, color: "#475569", background: "#F8FAFC", padding: "8px 12px", borderRadius: 8, marginBottom: 6 }}>{d.description}</p>}
                            {d.delai && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280" }}><FaClock size={9} /> Délai : {d.delai}</div>}
                            <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 7 }}>Envoyé le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <span className={`status-badge ${d.statut === "accepte" ? "sb-green" : d.statut === "refuse" ? "sb-red" : "sb-yellow"}`}>
                              {d.statut === "accepte" ? <><FaCheck size={10} /> Accepté</> : d.statut === "refuse" ? <><FaTimes size={10} /> Refusé</> : <><FaClock size={10} /> En attente</>}
                            </span>
                            {d.statut === "accepte" && d.demande?.service?.toLowerCase().includes("formation") && (
                              <button style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}
                                onClick={() => { setCertificationFormation({ titre: d.demande?.service, duree: d.delai || "" }); setCertificationClient(d.demande?.user); setShowCertificationModal(true); }}>
                                <FaCertificate size={11} /> Envoyer certif.
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MESSAGES */}
            {tab === "messages" && (
              <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16, height: "calc(100vh - 160px)" }}>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>Conversations ({contacts.length})</div>
                    <button style={{ background: "#F1F5F9", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "#475569" }} onClick={refreshAllMessages}><FaSync size={11} /></button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {contacts.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", color: "#8A9AB5", fontSize: 13 }}><FaComments style={{ fontSize: 30, display: "block", margin: "0 auto 8px" }} />Aucune conversation.</div>
                    ) : (
                      contacts.map(c => {
                        const unread = allMessages.filter(m => m.sender_id === c.id && m.receiver_id === user?.id && !m.lu).length;
                        const lastMsg = allMessages.filter(m => (m.sender_id === c.id && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === c.id)).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                        return (
                          <div key={c.id} onClick={() => loadConversation(c.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedContact?.id === c.id ? "#FFFBEB" : "transparent", borderLeft: selectedContact?.id === c.id ? "3px solid #F7B500" : "3px solid transparent", borderBottom: "0.5px solid #F1F5F9" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: selectedContact?.id === c.id ? "#FEF3C7" : "#0A2540", color: selectedContact?.id === c.id ? "#92400E" : "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0, border: "1.5px solid rgba(247,181,0,.3)" }}>{c.prenom?.[0]}{c.nom?.[0]}</div>
                            <div style={{ overflow: "hidden", flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.prenom} {c.nom}</div>
                              <div style={{ fontSize: 11, color: "#8A9AB5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lastMsg ? lastMsg.contenu.slice(0, 26) + "…" : c.service || ""}</div>
                            </div>
                            {unread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>{unread}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  {!selectedContact ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}>
                      <FaComments style={{ fontSize: 48, marginBottom: 14, color: "#E2E8F0" }} />
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>Sélectionnez une conversation</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{selectedContact.prenom} {selectedContact.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{selectedContact.email}</div></div>
                        <button style={{ background: "#F1F5F9", border: "none", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "#475569" }} onClick={refreshAllMessages}><FaSync size={11} /></button>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "40px 0", fontSize: 13 }}>Aucun message. Commencez la conversation !</div>}
                        {conversation.map((m, i) => {
                          const isMe = m.sender_id === user?.id;
                          const prevMsg = conversation[i - 1];
                          const showDate = !prevMsg || new Date(m.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                          return (
                            <div key={m.id}>
                              {showDate && <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", margin: "8px 0", display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />{new Date(m.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}<div style={{ flex: 1, height: 1, background: "#F1F5F9" }} /></div>}
                              <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                                {!isMe && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>}
                                <div>
                                  <div style={{ background: isMe ? "linear-gradient(135deg,#0A2540,#1a4080)" : "#F0F4FA", color: isMe ? "#fff" : "#0A2540", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", maxWidth: 400, fontSize: 13.5, lineHeight: 1.65 }}>{m.contenu}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                                    <span style={{ fontSize: 10, color: "#94A3B8" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                                    {isMe && <button onClick={() => deleteMessage(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 11 }}><FaTrash /></button>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={msgEndRef} />
                      </div>
                      <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 10, alignItems: "center", background: "#FAFBFE" }}>
                        <input className="inp" placeholder={`Répondre à ${selectedContact.prenom}…`} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1, borderRadius: 20, padding: "10px 16px" }} />
                        <button onClick={sendMessage} style={{ background: newMsg.trim() ? "#F7B500" : "#E2E8F0", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: newMsg.trim() ? "pointer" : "default", flexShrink: 0 }}>
                          <FaPaperPlane style={{ fontSize: 14, color: newMsg.trim() ? "#0A2540" : "#94A3B8" }} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* RENDEZ-VOUS */}
            {tab === "rdv" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>Mes rendez-vous</h2><div style={{ fontSize: 13, color: "#8A9AB5" }}>{rdvs.length} rendez-vous</div></div>
                  <button style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 9, padding: "8px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={() => loadExpertData(user?.id)}><FaSync size={11} /> Rafraîchir</button>
                </div>
                {rdvs.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><FaCalendarCheck style={{ fontSize: 28, color: "#94A3B8" }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>Aucun rendez-vous</div>
                    <div style={{ fontSize: 13, color: "#64748B" }}>Les rendez-vous des startups apparaîtront ici.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {rdvs.map(rdv => (
                      <div key={rdv.id} className="card" style={{ borderLeft: `4px solid ${rdv.statut === "confirme" ? "#10B981" : rdv.statut === "annule" ? "#EF4444" : "#F7B500"}` }}>
                        <div style={{ padding: "20px 24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700, flexShrink: 0 }}>{rdv.client?.prenom?.[0]}{rdv.client?.nom?.[0]}</div>
                                <div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{rdv.client?.prenom} {rdv.client?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{rdv.client?.email}</div></div>
                              </div>
                              {rdv.sujet && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#475569", fontWeight: 600, marginBottom: 5 }}><FaClipboardList size={11} style={{ color: "#F7B500" }} /> {rdv.sujet}</div>}
                              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}><FaCalendarAlt size={11} style={{ color: "#F7B500" }} /> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                              <span className={`status-badge ${rdv.statut === "confirme" ? "sb-green" : rdv.statut === "annule" ? "sb-red" : "sb-yellow"}`}>
                                {rdv.statut === "confirme" ? <><FaCheck size={10} /> Confirmé</> : rdv.statut === "annule" ? <><FaTimes size={10} /> Annulé</> : <><FaClock size={10} /> En attente</>}
                              </span>
                              {rdv.statut === "en_attente" && (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button style={{ background: "#ECFDF5", color: "#059669", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => confirmerRdv(rdv.id)}><FaCheck size={10} /> Confirmer</button>
                                  <button style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => annulerRdv(rdv.id)}><FaTimes size={10} /> Annuler</button>
                                  <button style={{ background: "#F3E8FF", color: "#7C3AED", border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setSelectedRdv(rdv); setShowRescheduleModal(true); }}><FaCalendarAlt size={10} /> Autre créneau</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === "notifications" && (
              <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaBullhorn style={{ color: "#0A2540", fontSize: 16 }} /></div>
                      Actualités et Annonces
                    </h2>
                    <div style={{ fontSize: 12.5, color: "#8A9AB5", marginTop: 4 }}>{newsNotifications.length} actualité(s) de l'équipe BEH</div>
                  </div>
                  <button style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }} onClick={loadNewsNotifications}><FaSync size={11} /> Actualiser</button>
                </div>

                {/* Section newsletter */}
                <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 18, padding: "28px 32px", marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(247,181,0,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaEnvelope style={{ color: "#F7B500", fontSize: 20 }} /></div>
                        <div>
                          <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Newsletter BEH</h3>
                          <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, marginTop: 2 }}>Recevez nos actualités et annonces exclusives</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ minWidth: 280, flex: 1 }}>
                      {nlSent ? (
                        <div style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                          <FaCheck style={{ color: "#10B981", fontSize: 16 }} />
                          <span style={{ fontWeight: 600, color: "#fff" }}>Inscrit avec succès !</span>
                        </div>
                      ) : (
                        <form onSubmit={handleNewsletter} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, position: "relative" }}>
                            <FaEnvelope style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                            <input type="email" value={nlEmail} onChange={e => { setNlEmail(e.target.value); setNlError(""); }} placeholder="Votre adresse e-mail" required style={{ width: "100%", background: "#fff", border: "none", borderRadius: 10, padding: "12px 12px 12px 38px", fontFamily: "inherit", fontSize: 13, color: "#0A2540", outline: "none" }} />
                          </div>
                          <button type="submit" disabled={nlLoading} style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 800, fontSize: 13, cursor: nlLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
                            {nlLoading ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Inscription...</> : <><FaPaperPlane size={11} /> S'inscrire</>}
                          </button>
                        </form>
                      )}
                      {nlError && <div style={{ color: "#FCA5A5", fontSize: 12, marginTop: 8 }}>{nlError}</div>}
                    </div>
                  </div>
                </div>

                {newsLoading && (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ width: 36, height: 36, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ color: "#64748B", fontSize: 13 }}>Chargement des actualités...</div>
                  </div>
                )}

                {!newsLoading && newsNotifications.length === 0 && (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><FaNewspaper style={{ fontSize: 28, color: "#94A3B8" }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 6 }}>Aucune actualité</div>
                    <p style={{ color: "#64748B", fontSize: 13 }}>Aucune annonce publiée pour le moment.</p>
                  </div>
                )}

                {!newsLoading && newsNotifications.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {newsNotifications.map((notif, idx) => {
                      const isRecent = Date.now() - new Date(notif.createdAt).getTime() < 7 * 24 * 3600 * 1000;
                      return (
                        <div key={notif.id || idx} className="card" style={{ border: `1.5px solid ${isRecent ? "#FDE68A" : "#E8EEF6"}`, borderLeft: `4px solid ${isRecent ? "#F7B500" : "#E8EEF6"}` }}>
                          <div style={{ padding: "20px 22px", display: "flex", gap: 18, alignItems: "flex-start" }}>
                            <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#0A2540,#1a3a6e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {notif.image ? <img src={`${BASE}/uploads/news/${notif.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <FaNewspaper style={{ color: "#F7B500", fontSize: 28 }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                {isRecent && <span className="status-badge sb-yellow"><FaBell size={9} /> Nouveau</span>}
                                {notif.categorie && <span className="chip">{notif.categorie}</span>}
                                <span className="chip"><FaCalendarAlt size={9} /> {new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                              </div>
                              <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{notif.titre}</h3>
                              {notif.description && <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>{notif.description}</p>}
                              {notif.attachment && (
                                <div style={{ marginTop: 12 }}>
                                  <a href={`${BASE}/uploads/news/${notif.attachment}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F3F4F6", color: "#1F2937", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
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

            {/* CONTACTER ADMINISTRATEUR */}
            {tab === "contact_admin" && (
              <div className="fade-up">
                <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 20, padding: "36px 40px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                  <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaHeadset style={{ color: "#F7B500", fontSize: 28 }} />
                    </div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 5 }}>Support et Assistance</div>
                      <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)", marginBottom: 8 }}>Contacter l'Administrateur</h1>
                      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 520 }}>Besoin d'aide, d'une information ou d'un signalement ? Notre équipe vous répond rapidement.</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  {[
                    { icon: <FaEnvelope size={22} />, title: "Envoyer un e-mail", subtitle: "Email direct", value: contactInfo?.email || "plateformebeh@gmail.com", href: MAILTO_HREF, color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
                    { icon: <FaPhone size={22} />, title: "Appeler l'équipe", subtitle: "Téléphone direct", value: `+216 ${contactInfo?.telephone || "29524360"}`, href: TEL_HREF, color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
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
                  {/* Formulaire d'envoi */}
                  <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaPaperPlane style={{ color: "#F7B500" }} size={16} /> Envoyer un message
                      </div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Votre message sera transmis à l'administrateur.</div>
                    </div>
                    <div style={{ padding: "24px" }}>
                      {contactAdminStatus === "success" && (
                        <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#059669" }}>
                          <FaCheckCircle size={16} /> Message envoyé avec succès !
                        </div>
                      )}
                      {contactAdminStatus === "error" && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#DC2626" }}>
                          <FaExclamationTriangle size={16} /> Erreur. Essayez par email directement.
                        </div>
                      )}
                      <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Vos informations</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>Nom complet</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{user?.prenom} {user?.nom}</div>
                          </div>
                          <div style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>Email</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{user?.email || "—"}</div>
                          </div>
                          {expert?.domaine && (
                            <div style={{ gridColumn: "span 2", background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>Domaine d'expertise</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{expert.domaine}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <form onSubmit={envoyerMessageAdmin}>
                        <div style={{ marginBottom: 16 }}>
                          <FL label="Sujet">
                            <select className="inp" value={contactAdminForm.sujet} onChange={e => setContactAdminForm({ ...contactAdminForm, sujet: e.target.value })}>
                              <option value="">— Sélectionnez un sujet —</option>
                              <option value="Demande d'information">Demande d'information</option>
                              <option value="Problème technique">Problème technique</option>
                              <option value="Validation de profil">Validation de profil</option>
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
                        <button type="submit" style={{ width: "100%", background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={sendingContactAdmin}>
                          {sendingContactAdmin ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi en cours...</> : <><FaPaperPlane size={14} /> Envoyer le message</>}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Historique des échanges */}
                  <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaComments style={{ color: "#F7B500" }} size={16} /> Historique
                      </div>
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
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.admin_reply ? "#10B981" : "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                                  {msg.admin_reply ? "A" : "E"}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: msg.admin_reply ? "#065F46" : "#92400E" }}>{msg.admin_reply ? "Administrateur BEH" : `${user?.prenom} ${user?.nom}`}</div>
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
          </main>

          {/* Footer */}
          <footer style={{ background: "#0A2540", padding: "20px 28px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.35)", margin: 0 }}>© 2026 Business Expert Hub · Tous droits réservés</p>
            <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, margin: 0 }}>Tarifs en Dinar Tunisien (HT)</p>
          </footer>
        </div>
      </div>
    </>
  );
}