"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const s = searchParams.get("status");
    const msg = searchParams.get("message") || "";
    if (s === "success") {
      setStatus("success");
      setMessage(msg || "Votre adresse email a été confirmée avec succès.");
      setTimeout(() => {
        router.push("/attente-validation");
      }, 5000);
    } else {
      setStatus("error");
      setMessage(msg || "Le lien de confirmation est invalide ou a expiré.");
    }
  }, [searchParams, router]);

  if (!status) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification en cours...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#F0F4F8 0%,#E8EEF6 100%)", padding: "24px" }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#fff", borderRadius: 32, overflow: "hidden", boxShadow: "0 20px 40px rgba(10,37,64,0.12)", textAlign: "center" }}>
        <div style={{ background: status === "success" ? "linear-gradient(135deg,#0A2540,#1a3f6f)" : "#0A2540", padding: "32px 24px" }}>
          <div style={{ width: 72, height: 72, margin: "0 auto", background: status === "success" ? "rgba(247,181,0,0.15)" : "rgba(239,68,68,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {status === "success" ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F7B500" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginTop: 20 }}>
            {status === "success" ? "Email confirmé !" : "Confirmation échouée"}
          </h1>
        </div>
        <div style={{ padding: "32px 24px" }}>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
          {status === "success" ? (
            <>
              <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>
                Vous allez être redirigé automatiquement vers la page d’attente dans quelques secondes.
              </p>
              <Link href="/attente-validation" style={{ display: "inline-block", background: "#0A2540", color: "#fff", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none", marginTop: 8 }}>
                Accéder à la page d’attente
              </Link>
            </>
          ) : (
            <Link href="/connexion" style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", padding: "12px 28px", borderRadius: 30, fontWeight: 700, textDecoration: "none" }}>
              Retour à la connexion
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}