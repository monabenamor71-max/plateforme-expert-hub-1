"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

const BASE = "http://localhost:3001";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError("Token de réinitialisation manquant");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/connexion"), 3000);
      } else {
        setError(data.message || "Erreur lors de la réinitialisation");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  if (!validToken) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0A2540,#0f3460)", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 48, maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#DC2626", marginBottom: 12 }}>Lien invalide</h2>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Le lien de réinitialisation est invalide ou a expiré.</p>
          <Link href="/mot-de-passe-oublie">
            <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
              Nouvelle demande
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0A2540,#0f3460)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", maxWidth: 480, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <FaCheckCircle size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A2540", marginBottom: 12 }}>Mot de passe modifié !</h2>
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Votre mot de passe a été modifié avec succès.<br />
              Vous allez être redirigé vers la page de connexion.
            </p>
            <Link href="/connexion">
              <button style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                Se connecter
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>
              Nouveau mot de passe
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              Choisissez un nouveau mot de passe sécurisé.
            </p>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#DC2626", fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#F7B500"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#F7B500"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#0A2540",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all .2s"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#F7B500";
                    e.currentTarget.style.color = "#0A2540";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0A2540";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}