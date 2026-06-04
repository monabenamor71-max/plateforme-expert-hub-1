"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const BASE = "http://localhost:3001";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lien invalide</h2>
          <p className="text-gray-500 text-sm mb-6">Le lien de réinitialisation est invalide ou a expiré.</p>
          <Link href="/mot-de-passe-oublie">
            <button className="w-full bg-[#F7B500] text-[#0A2540] font-bold py-2.5 rounded-lg hover:bg-[#e6a800] transition-all">
              Nouvelle demande
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-green-600 text-2xl font-bold">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Mot de passe modifié !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Votre mot de passe a été modifié avec succès.<br />
              Vous allez être redirigé vers la page de connexion.
            </p>
            <Link href="/connexion">
              <button className="w-full bg-[#F7B500] text-[#0A2540] font-bold py-2.5 rounded-lg hover:bg-[#e6a800] transition-all">
                Se connecter →
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-white text-sm font-bold">
                  BEH
                </div>
                <span className="text-base font-bold text-[#0A2540]">
                  Business <span className="text-[#F7B500]">Expert</span> Hub
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#0A2540] mt-4 mb-1">Nouveau mot de passe</h2>
              <p className="text-sm text-gray-500">Choisissez un mot de passe sécurisé</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#F7B500] focus:ring-1 focus:ring-[#F7B500] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none text-xs font-medium"
                  >
                    {showPassword ? "MASQUER" : "AFFICHER"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#F7B500] focus:ring-1 focus:ring-[#F7B500] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none text-xs font-medium"
                  >
                    {showConfirmPassword ? "MASQUER" : "AFFICHER"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A2540] text-white font-bold py-2.5 rounded-lg hover:bg-[#F7B500] hover:text-[#0A2540] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? "Chargement..." : "Réinitialiser le mot de passe →"}
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <Link href="/connexion" className="text-[#F7B500] text-sm hover:text-[#0A2540] transition-colors">
                ← Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          Chargement...
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}