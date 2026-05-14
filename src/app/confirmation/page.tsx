"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de confirmation manquant.");
      return;
    }

    const confirmEmail = async () => {
      try {
        // ✅ Appel direct au backend (port 3001)
        const res = await fetch(`http://localhost:3001/auth/confirm?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email confirmé avec succès !");
          setTimeout(() => {
            router.push("/attente-validation");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Erreur lors de la confirmation");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
        setStatus("error");
        setMessage("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
      }
    };

    confirmEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 60, height: 60, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <p style={{ color: "#475569", fontSize: 15 }}>Confirmation en cours...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <>
        <div style={{ width: 72, height: 72, margin: "0 auto", background: "rgba(16,185,129,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ color: "#0A2540", fontSize: 24, fontWeight: 800, marginTop: 20 }}>Email confirmé !</h1>
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{message}</p>
        <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 24 }}>Vous allez être redirigé vers la page d'attente de validation...</p>
        <Link href="/attente-validation" style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none" }}>
          Attente validation →
        </Link>
      </>
    );
  }

  return (
    <>
      <div style={{ width: 72, height: 72, margin: "0 auto", background: "rgba(239,68,68,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <h1 style={{ color: "#0A2540", fontSize: 24, fontWeight: 800, marginTop: 20 }}>Échec de la confirmation</h1>
      <p style={{ fontSize: 15, color: "#DC2626", lineHeight: 1.6, marginBottom: 16 }}>{message}</p>
      <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 24 }}>Le lien de confirmation est invalide ou a expiré. Veuillez contacter le support.</p>
      <Link href="/connexion" style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none" }}>
        Retour à la connexion
      </Link>
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#F0F4F8 0%,#E8EEF6 100%)", padding: "24px" }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ maxWidth: 520, width: "100%", background: "#fff", borderRadius: 32, overflow: "hidden", boxShadow: "0 20px 40px rgba(10,37,64,0.12)", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "32px 24px" }}>
          <div style={{ width: 72, height: 72, margin: "0 auto", background: "rgba(247,181,0,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F7B500" strokeWidth="2">
              <path d="M4 4L20 20M20 4L4 20" />
            </svg>
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginTop: 20 }}>Confirmation d'email</h1>
        </div>
        <div style={{ padding: "32px 24px" }}>
          <Suspense fallback={<div>Chargement...</div>}>
            <ConfirmationContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}