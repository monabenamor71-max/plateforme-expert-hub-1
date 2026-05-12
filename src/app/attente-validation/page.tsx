"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AttenteValidationPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'email stocké lors de l'inscription
    const storedEmail = localStorage.getItem("pending_email");
    if (storedEmail) {
      setEmail(storedEmail);
      // Optionnel : effacer après affichage
      // localStorage.removeItem("pending_email");
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#F0F4F8 0%,#E8EEF6 100%)", padding: "24px" }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#fff", borderRadius: 32, overflow: "hidden", boxShadow: "0 20px 40px rgba(10,37,64,0.12)", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "32px 24px" }}>
          <div style={{ width: 72, height: 72, margin: "0 auto", background: "rgba(247,181,0,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F7B500" strokeWidth="2">
              <path d="M12 8v4M12 16h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginTop: 20 }}>Compte en attente de validation</h1>
        </div>
        <div style={{ padding: "32px 24px" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 16px", background: "rgba(247,181,0,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F7B500" strokeWidth="2">
              <path d="M20 12V8H4v4M12 4v4M4 12h16M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
            </svg>
          </div>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 8 }}>
            Merci d'avoir confirmé votre adresse email.
          </p>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
            Un administrateur doit <strong style={{ color: "#F7B500" }}>valider votre compte</strong> avant que vous puissiez accéder à votre espace.
          </p>
          {email && (
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 16px", marginBottom: 20, border: "1px solid #E8EEF6" }}>
              <span style={{ fontSize: 12, color: "#8A9AB5" }}>Email enregistré :</span>
              <p style={{ fontWeight: 600, color: "#0A2540", marginTop: 4 }}>{email}</p>
            </div>
          )}
          <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 24 }}>
            ✉️ Vous recevrez un email dès que votre compte sera activé.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/connexion" style={{ display: "inline-block", background: "#0A2540", color: "#fff", padding: "12px 24px", borderRadius: 30, fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
              Retour à la connexion
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              style={{ background: "transparent", border: "1.5px solid #E2E8F0", color: "#475569", padding: "12px 24px", borderRadius: 30, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}