"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ========== CONSTANTES ==========
const ANNEE_DEBUT_EXPERIENCE = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1950; y--) years.push(y);
  return years;
})();

const DOMAINES_EXPERT = [
  "Marketing Digital",
  "Finance & Comptabilité",
  "RH & Organisation",
  "Stratégie & Management",
  "Droit & Fiscalité",
  "IA & Transformation Digitale",
  "Vente & Développement commercial",
  "Autre",
];

const getCsrfToken = () => "";

export default function InscriptionExpertPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prenom: "",
    nom: "",
    telephone: "",
    domaine: "",
    domaine_precision: "",
    annee_debut_experience: "",
    localisation: "",
    description: "",
  });

  const [experienceCalculee, setExperienceCalculee] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validations
  const validateName = (name: string) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/.test(name);
  const validatePhone = (phone: string) => /^[+\d\s\-()]{8,20}$/.test(phone);

  const handleAnneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, annee_debut_experience: value }));
    if (value) {
      const anneeDebut = parseInt(value, 10);
      const annees = currentYear - anneeDebut;
      if (annees >= 0) setExperienceCalculee(`${annees} ${annees > 1 ? "ans" : "an"}`);
      else setExperienceCalculee("");
    } else setExperienceCalculee("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDomaineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      domaine: value,
      domaine_precision: value === "Autre" ? prev.domaine_precision : "",
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validations
    if (!validateName(formData.prenom)) {
      setError("Prénom invalide : lettres, espaces, tirets ou apostrophes uniquement");
      setLoading(false);
      return;
    }
    if (!validateName(formData.nom)) {
      setError("Nom invalide : lettres, espaces, tirets ou apostrophes uniquement");
      setLoading(false);
      return;
    }
    if (formData.telephone && !validatePhone(formData.telephone)) {
      setError("Numéro de téléphone invalide (ex: +216 12 345 678)");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    const emailVal = formData.email.trim().toLowerCase();
    const passwordVal = formData.password;
    const prenomVal = formData.prenom.trim();
    const nomVal = formData.nom.trim();
    let domaineVal = formData.domaine;
    if (domaineVal === "Autre") domaineVal = formData.domaine_precision.trim();
    const anneeVal = formData.annee_debut_experience;
    const localisationVal = formData.localisation.trim();

    if (!emailVal) { setError("L'email est requis"); setLoading(false); return; }
    if (!passwordVal) { setError("Mot de passe requis"); setLoading(false); return; }
    if (!prenomVal) { setError("Prénom requis"); setLoading(false); return; }
    if (!nomVal) { setError("Nom requis"); setLoading(false); return; }
    if (!domaineVal) { setError("Domaine requis"); setLoading(false); return; }
    if (!anneeVal) { setError("Année de début d'expérience requise"); setLoading(false); return; }
    if (!localisationVal) { setError("Localisation requise"); setLoading(false); return; }
    if (!cvFile) { setError("CV requis (PDF)"); setLoading(false); return; }

    const csrfToken = getCsrfToken();
    const fd = new FormData();
    fd.append("email", emailVal);
    fd.append("password", passwordVal);
    fd.append("prenom", prenomVal);
    fd.append("nom", nomVal);
    if (formData.telephone.trim()) fd.append("telephone", formData.telephone.trim());
    fd.append("domaine", domaineVal);
    fd.append("annee_debut_experience", anneeVal);
    fd.append("localisation", localisationVal);
    if (formData.description.trim()) fd.append("description", formData.description.trim());
    if (photoFile) fd.append("photo", photoFile);
    fd.append("cv", cvFile);
    if (portfolioFile) fd.append("portfolio", portfolioFile);

    try {
      const res = await fetch("http://localhost:3001/auth/register/expert", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken || "" },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(", ") : data.message || "Erreur lors de l'inscription";
        throw new Error(errorMsg);
      }

      // Newsletter optionnelle
      try {
        await fetch("http://localhost:3001/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken || "" },
          body: JSON.stringify({ email: emailVal, nom: `${prenomVal} ${nomVal}` }),
        });
      } catch (e) {}

      localStorage.setItem("pending_email", emailVal);
      router.push("/attente-validation");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passStrength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const passColors = ["", "#EF4444", "#F59E0B", "#10B981"];
  const passLabels = ["", "Trop court", "Moyen", "Fort"];

  const requiredStar = <span style={{ color: '#EF4444' }}>*</span>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; background: linear-gradient(135deg,#F0F4F8 0%,#E8EEF6 100%); }
        .pg { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 24px; }
        .back-btn { display: inline-flex; align-items: center; gap: 7px; background: #0A2540; color: #fff; padding: 9px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 28px; transition: 0.2s; }
        .back-btn:hover { background: #F7B500; color: #0A2540; transform: translateX(-2px); }
        .card { background: #fff; border-radius: 24px; padding: 44px; max-width: 660px; width: 100%; box-shadow: 0 8px 40px rgba(10,37,64,0.1); border: 1px solid #DDE4EF; }
        .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .logo-box { width: 42px; height: 42px; background: #0A2540; border-radius: 11px; display: flex; align-items: center; justifyContent: center; font-size: 12px; font-weight: 900; color: #F7B500; }
        .logo-name { font-size: 16px; font-weight: 700; color: #0A2540; }
        .logo-name em { color: #F7B500; font-style: normal; }
        .divider { height: 1px; background: #EDF1F7; margin-bottom: 28px; }
        .title { font-size: 24px; font-weight: 800; color: #0A2540; margin-bottom: 6px; }
        .subtitle { font-size: 13.5px; color: #8A9AB5; margin-bottom: 28px; }
        .err-box { background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 12px; padding: 13px 16px; margin-bottom: 20px; font-size: 13px; color: #DC2626; display: flex; gap: 10px; align-items: flex-start; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .fg { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .lbl { font-size: 11px; font-weight: 700; color: #7D8FAA; text-transform: uppercase; letter-spacing: 1.2px; }
        .inp-wrap { position: relative; }
        .inp { width: 100%; background: #F7F9FC; border: 1.5px solid #DDE4EF; border-radius: 11px; padding: 12px 16px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #0A2540; outline: none; transition: 0.18s; }
        .inp:focus { border-color: #F7B500; box-shadow: 0 0 0 3px rgba(247,181,0,0.12); background: #fff; }
        select.inp { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8B8CC' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 38px; }
        textarea.inp { resize: vertical; min-height: 90px; }
        .eye-btn { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #A8B8CC; display: flex; align-items: center; }
        .eye-btn:hover { color: #F7B500; }
        .section-title { font-size: 11px; font-weight: 800; color: #F7B500; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 10px; margin: 22px 0 18px; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #EDF1F7; }
        .file-zone { border: 1.5px dashed #DDE4EF; border-radius: 12px; padding: 18px; background: #F7F9FC; text-align: center; cursor: pointer; position: relative; transition: 0.2s; }
        .file-zone:hover, .file-zone.has-file { border-color: #F7B500; background: rgba(247,181,0,0.04); }
        .file-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .photo-upload { display: flex; align-items: center; gap: 16px; padding: 16px; border: 1.5px dashed #DDE4EF; border-radius: 12px; background: #F7F9FC; cursor: pointer; transition: 0.2s; }
        .photo-upload:hover { border-color: #F7B500; background: rgba(247,181,0,0.04); }
        .photo-upload input { display: none; }
        .photo-preview { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #F7B500; }
        .photo-placeholder { width: 64px; height: 64px; border-radius: 50%; background: #0A2540; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid #DDE4EF; }
        .precision-field { margin-top: 10px; margin-left: 8px; border-left: 2px solid #F7B500; padding-left: 12px; }
        .submit-btn { width: 100%; background: #0A2540; color: #fff; border: none; border-radius: 12px; padding: 15px; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; transition: 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #F7B500; color: #0A2540; transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-row { text-align: center; margin-top: 22px; font-size: 13.5px; color: #8A9AB5; }
        .login-row a { color: #F7B500; font-weight: 700; text-decoration: none; }
        .secure-row { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 16px; font-size: 11px; color: #C2CEDC; }
        .newsletter-check { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 10px; margin-top: 16px; cursor: pointer; }
        .newsletter-check input { width: 16px; height: 16px; accent-color: #F7B500; cursor: pointer; }
      `}</style>

      <div className="pg">
        <Link href="/" className="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour à l'accueil
        </Link>

        <div className="card">
          <div className="logo-row">
            <div className="logo-box">BEH</div>
            <span className="logo-name">Business <em>Expert</em> Hub</span>
          </div>
          <div className="divider" />
          <div className="title">Inscription Expert</div>
          <div className="subtitle">Rejoignez notre réseau d’experts certifiés et accompagnez les startups.</div>

          {error && (
            <div className="err-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid2">
              <div className="fg"><label className="lbl">Prénom {requiredStar}</label><input className="inp" type="text" name="prenom" value={formData.prenom} onChange={handleChange} required /></div>
              <div className="fg"><label className="lbl">Nom {requiredStar}</label><input className="inp" type="text" name="nom" value={formData.nom} onChange={handleChange} required /></div>
            </div>

            <div className="fg"><label className="lbl">Email {requiredStar}</label><input className="inp" type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
            <div className="fg"><label className="lbl">Téléphone</label><input className="inp" type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+216 00 000 000" /></div>

            <div className="grid2">
              <div className="fg">
                <label className="lbl">Mot de passe {requiredStar}</label>
                <div className="inp-wrap">
                  <input className="inp" type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required style={{ paddingRight: 44 }} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passStrength > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: "#EDF1F7", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${passStrength * 33}%`, background: passColors[passStrength], transition: "0.3s" }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: passColors[passStrength] }}>{passLabels[passStrength]}</span>
                  </div>
                )}
              </div>
              <div className="fg">
                <label className="lbl">Confirmer {requiredStar}</label>
                <div className="inp-wrap">
                  <input className="inp" type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ paddingRight: 44 }} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>Ne correspondent pas</span>}
              </div>
            </div>

            <div className="section-title">Photo de profil (optionnelle)</div>
            <div className="fg">
              <label className="photo-upload" htmlFor="photo-input">
                {photoPreview ? <img src={photoPreview} className="photo-preview" alt="preview" /> : <div className="photo-placeholder">👤</div>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>Ajouter votre photo (optionnel)</div>
                  <div style={{ fontSize: 12, color: "#8A9AB5", marginTop: 3 }}>JPG, PNG — max 5 Mo</div>
                  {photoFile && <div style={{ fontSize: 12, color: "#059669", marginTop: 3 }}>✅ {photoFile.name}</div>}
                </div>
                <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="section-title">Profil expert</div>
            <div className="fg">
              <label className="lbl">Domaine d'expertise {requiredStar}</label>
              <select className="inp" name="domaine" value={formData.domaine} onChange={handleDomaineChange} required>
                <option value="">Sélectionnez</option>
                {DOMAINES_EXPERT.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {formData.domaine === "Autre" && (
                <div className="precision-field">
                  <input className="inp" type="text" name="domaine_precision" value={formData.domaine_precision} onChange={handleChange} placeholder="Précisez votre domaine" required />
                </div>
              )}
            </div>
            <div className="grid2">
              <div className="fg">
                <label className="lbl">Année de début d'expérience {requiredStar}</label>
                <select className="inp" name="annee_debut_experience" value={formData.annee_debut_experience} onChange={handleAnneeChange} required>
                  <option value="">Sélectionnez l'année de début</option>
                  {ANNEE_DEBUT_EXPERIENCE.map(annee => (
                    <option key={annee} value={annee}>{annee}</option>
                  ))}
                </select>
                {experienceCalculee && (
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#10B981", marginTop: 6 }}>
                    ➡️ Expérience : {experienceCalculee}
                  </div>
                )}
              </div>
              <div className="fg">
                <label className="lbl">Localisation {requiredStar}</label>
                <input className="inp" type="text" name="localisation" value={formData.localisation} onChange={handleChange} required placeholder="Ex: Tunis, Sfax" />
              </div>
            </div>
            <div className="fg"><label className="lbl">Description / Bio</label><textarea className="inp" name="description" value={formData.description} onChange={handleChange} placeholder="Présentez votre parcours…" /></div>

            <div className="section-title">Documents</div>
            <div className="fg">
              <label className="lbl">CV (PDF) {requiredStar}</label>
              <div className={`file-zone ${cvFile ? "has-file" : ""}`}>
                <input type="file" accept=".pdf" onChange={e => e.target.files?.[0] && setCvFile(e.target.files[0])} required />
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                {cvFile ? <div style={{ fontSize: 12.5, color: "#059669", fontWeight: 600 }}>✅ {cvFile.name}</div> : <><div style={{ fontWeight: 600 }}>Cliquez pour uploader votre CV</div><div style={{ fontSize: 11.5, color: "#8A9AB5" }}>PDF uniquement — max 10 Mo</div></>}
              </div>
            </div>
            <div className="fg">
              <label className="lbl">Portfolio / Références (optionnel)</label>
              <div className={`file-zone ${portfolioFile ? "has-file" : ""}`}>
                <input type="file" accept=".pdf" onChange={e => e.target.files?.[0] && setPortfolioFile(e.target.files[0])} />
                <div style={{ fontSize: 28, marginBottom: 8 }}>🗂️</div>
                {portfolioFile ? <div style={{ fontSize: 12.5, color: "#059669", fontWeight: 600 }}>✅ {portfolioFile.name}</div> : <><div style={{ fontWeight: 600 }}>Portfolio, références (optionnel)</div><div style={{ fontSize: 11.5, color: "#8A9AB5" }}>PDF uniquement — max 20 Mo</div></>}
              </div>
            </div>

            <div className="newsletter-check">
              <input type="checkbox" id="newsletter" defaultChecked />
              <label htmlFor="newsletter" style={{ fontSize: 13, cursor: "pointer", fontWeight: 500 }}>📧 M'abonner à la newsletter BEH</label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><div className="spinner" /> Inscription en cours…</> : <>Créer mon compte expert <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
            </button>
          </form>

          <div className="login-row">Déjà un compte ? <Link href="/connexion">Se connecter</Link></div>
          <div className="secure-row"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> Connexion sécurisée SSL · Données protégées</div>
        </div>
      </div>
    </>
  );
}