"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";

const BASE = "http://localhost:3001";

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!emailParam) router.push("/mot-de-passe-oublie");
  }, [emailParam, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Le code doit être composé de 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    const csrfToken = getCsrfToken();

    try {
      const res = await fetch(`${BASE}/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/connexion"), 3000);
      } else {
        setError(data.message || "Code invalide ou expiré");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  if (!emailParam) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0f3460] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Mot de passe modifié !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Votre mot de passe a été modifié avec succès.<br />
              Vous allez être redirigé vers la page de connexion.
            </p>
            <Link href="/connexion">
              <button className="w-full bg-[#F7B500] text-[#0A2540] font-bold py-2.5 rounded-lg hover:bg-[#e6a800] transition">
                Se connecter
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-[#0A2540] mb-1">Vérification du code</h2>
            <p className="text-gray-500 text-sm mb-6">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.<br />
              Saisissez-le ci‑dessous, puis choisissez un nouveau mot de passe.
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Code de réinitialisation
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔑</span>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-center tracking-widest font-mono focus:outline-none focus:border-[#F7B500]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#F7B500]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#F7B500]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmation"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-[#F7B500]"
                >
                  {showPassword ? "Masquer" : "Afficher"} les mots de passe
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A2540] text-white font-bold py-2.5 rounded-lg hover:bg-[#F7B500] hover:text-[#0A2540] transition disabled:opacity-50"
              >
                {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link href="/mot-de-passe-oublie" className="text-[#F7B500] text-sm">
                Renvoyer le code
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerifyCodeContent />
    </Suspense>
  );
}