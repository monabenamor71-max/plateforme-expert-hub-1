"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft, FaUserTie, FaCalendarAlt,
  FaClock, FaMapMarkerAlt, FaLaptop, FaBuilding, FaChalkboardTeacher,
  FaCheckCircle, FaDownload, FaPlayCircle,
  FaInfoCircle, FaUsers, FaMedal, FaTag,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

export default function FormationDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [promoEnd, setPromoEnd] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
  }, []);

  useEffect(() => {
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(end.getHours() + 11);
    end.setMinutes(end.getMinutes() + 22);
    end.setSeconds(end.getSeconds() + 42);
    setPromoEnd(end);
  }, []);

  useEffect(() => {
    if (!promoEnd) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = promoEnd.getTime() - now;
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [promoEnd]);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE}/formations/public/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Formation non trouvée");
        return res.json();
      })
      .then(data => { setFormation(data); setLoading(false); })
      .catch(err => { console.error(err); setFormation(null); setLoading(false); });
  }, [id]);

  const getFormatIcon = () => {
    if (formation?.mode === "en_ligne") return <FaLaptop size={12} />;
    if (formation?.mode === "presentiel") return <FaBuilding size={12} />;
    return <FaChalkboardTeacher size={12} />;
  };

  const getFormatLabel = () => {
    if (formation?.mode === "en_ligne") return "En ligne";
    if (formation?.mode === "presentiel") return "Présentiel";
    return formation?.mode || "Mixte";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleInscription = () => {
    if (isLoggedIn) router.push(`/dashboard/startup?formation=${formation.id}`);
    else router.push("/inscription");
  };

  const promoActive = promoEnd && (timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0);

  // ─── Countdown box ───────────────────────────────────────────────
  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-black text-[#0A2540] bg-white"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10)" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mt-1.5">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#F7B500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Formation introuvable</h2>
          <p className="text-gray-400 mb-6 text-sm">La formation que vous recherchez n'existe pas.</p>
          <Link href="/services/formations" className="inline-flex items-center gap-2 bg-[#F7B500] text-[#0A2540] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#e6a800] transition">
            <FaArrowLeft size={12} /> Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  const hasFormateurs = formation.formateur_details && formation.formateur_details.length > 0;
  const placesRestantes = formation.places_limitees ? (formation.places_disponibles ?? 0) : null;
  const isFree = formation.gratuit || formation.prix === 0 || formation.prix === "0";

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ━━━ HEADER ━━━ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A2540] flex items-center justify-center">
              <span className="text-[#F7B500] text-[10px] font-black tracking-tight">BEH</span>
            </div>
            <span className="font-bold text-[#0A2540] text-sm">
              Business <span className="text-[#F7B500]">Expert</span> Hub
            </span>
          </Link>
          <Link
            href="/services/formations"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0A2540] font-medium transition"
          >
            <FaArrowLeft size={11} /> Toutes les formations
          </Link>
        </div>
      </header>

      {/* ━━━ COUNTDOWN BANNER ━━━ */}
      {promoActive && (
        <div
          className="py-6"
          style={{ background: "linear-gradient(135deg, #0A2540 0%, #0d3260 100%)" }}
        >
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              FIN DE LA PROMO EN :
            </p>
            <div className="flex items-end justify-center gap-4">
              <TimeBox value={timeLeft.days} label="Jours" />
              <span className="text-white/30 text-3xl font-thin mb-7">:</span>
              <TimeBox value={timeLeft.hours} label="Heures" />
              <span className="text-white/30 text-3xl font-thin mb-7">:</span>
              <TimeBox value={timeLeft.minutes} label="Minutes" />
              <span className="text-white/30 text-3xl font-thin mb-7">:</span>
              <TimeBox value={timeLeft.seconds} label="Secondes" />
            </div>
          </div>
        </div>
      )}

      {/* ━━━ HERO ━━━ */}
      <section style={{ background: "linear-gradient(160deg, #0d2e52 0%, #0A2540 60%, #071c33 100%)" }} className="text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {isFree ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <FaCheckCircle size={9} /> Gratuit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-[#F7B500]/15 text-[#F7B500] border border-[#F7B500]/25 px-3 py-1 rounded-full text-xs font-semibold">
                <FaTag size={9} /> Payant
              </span>
            )}
            {formation.domaine && (
              <span className="bg-white/10 border border-white/15 text-white/75 px-3 py-1 rounded-full text-xs font-medium">
                {formation.domaine}
              </span>
            )}
            {formation.certifiante && (
              <span className="inline-flex items-center gap-1.5 bg-[#F7B500]/15 text-[#F7B500] border border-[#F7B500]/25 px-3 py-1 rounded-full text-xs font-semibold">
                <FaMedal size={9} /> Certifiante
              </span>
            )}
            {placesRestantes !== null && placesRestantes <= 5 && placesRestantes > 0 && (
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                🎫 {placesRestantes} places restantes
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-black leading-tight max-w-3xl mb-4 tracking-tight">
            {formation.titre}
          </h1>
          <p className="text-white/55 max-w-2xl text-sm leading-relaxed mb-8">
            {formation.description}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3">
            {formation.dateDebut && (
              <span className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
                <FaCalendarAlt size={11} className="text-[#F7B500]" />
                {formatDate(formation.dateDebut)}{formation.dateFin && ` → ${formatDate(formation.dateFin)}`}
              </span>
            )}
            {formation.duree && (
              <span className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
                <FaClock size={11} className="text-[#F7B500]" />
                {formation.duree}
              </span>
            )}
            <span className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
              <span className="text-[#F7B500]">{getFormatIcon()}</span>
              {getFormatLabel()}
            </span>
            {formation.localisation && formation.mode !== "en_ligne" && (
              <span className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70">
                <FaMapMarkerAlt size={11} className="text-[#F7B500]" />
                {formation.localisation}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ━━━ BODY ━━━ */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Programme */}
            {formation.programme && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F7B500]/12 flex items-center justify-center text-sm">📚</div>
                  <h2 className="text-sm font-bold text-[#0A2540] tracking-tight">Programme de la formation</h2>
                </div>
                <div className="px-6 py-5">
                  <div
                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed
                      prose-headings:text-[#0A2540] prose-headings:font-bold prose-headings:text-sm
                      prose-li:marker:text-[#F7B500] prose-li:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: formation.programme }}
                  />
                </div>
              </div>
            )}

            {/* Objectifs */}
            {formation.objectifs && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F7B500]/12 flex items-center justify-center text-sm">🎯</div>
                  <h2 className="text-sm font-bold text-[#0A2540] tracking-tight">Objectifs pédagogiques</h2>
                </div>
                <div className="px-6 py-5">
                  <div
                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed prose-li:marker:text-[#F7B500]"
                    dangerouslySetInnerHTML={{ __html: formation.objectifs }}
                  />
                </div>
              </div>
            )}

            {/* Prérequis */}
            {formation.prerequis && (
              <div className="flex gap-4 bg-blue-50 rounded-2xl border border-blue-100 px-6 py-5" style={{ boxShadow: "0 1px 8px rgba(59,130,246,0.08)" }}>
                <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={15} />
                <div>
                  <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wider">Prérequis</p>
                  <p className="text-sm text-blue-700 leading-relaxed">{formation.prerequis}</p>
                </div>
              </div>
            )}

            {/* ── EXPERTS ── */}
            {(hasFormateurs || formation.formateur) && (
              <div>
                {/* Section header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#0A2540]">
                    <FaUsers size={13} className="text-[#F7B500]" />
                    Nos Experts
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                </div>

                <div className="space-y-4">
                  {hasFormateurs ? (
                    formation.formateur_details.map((ex: any, idx: number) => {
                      const bulletPoints: string[] = ex.bio
                        ? ex.bio.split(/\r?\n/).filter((l: string) => l.trim().length > 0).map((l: string) => l.replace(/^[-•*]\s*/, "").trim())
                        : [];
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                          style={{ boxShadow: "0 2px 16px rgba(10,37,64,0.07)" }}
                        >
                          <div className="flex flex-col md:flex-row items-stretch">
                            {/* Text */}
                            <div className="flex-1 px-7 py-6">
                              <h3 className="text-lg font-black text-[#0A2540] leading-tight">
                                {ex.prenom ? `${ex.prenom} ${ex.nom}` : ex.nom}
                              </h3>
                              {ex.domaine && (
                                <p className="text-[11px] font-bold text-[#F7B500] uppercase tracking-wider mt-1 mb-3">
                                  {ex.domaine}
                                </p>
                              )}
                              {bulletPoints.length > 0 && (
                                <ul className="space-y-2">
                                  {bulletPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#F7B500] flex-shrink-0" />
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            {/* Photo */}
                            <div className="flex-shrink-0 flex items-center justify-center px-7 py-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                              <div
                                className="w-28 h-28 rounded-full overflow-hidden"
                                style={{ boxShadow: "0 0 0 4px white, 0 0 0 6px #F7B500" }}
                              >
                                {ex.image ? (
                                  <img
                                    src={`${BASE}/uploads/formateurs/${ex.image}`}
                                    alt={ex.prenom ? `${ex.prenom} ${ex.nom}` : ex.nom}
                                    className="w-full h-full object-cover object-top"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#0A2540] text-[#F7B500]">
                                    <FaUserTie size={36} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(10,37,64,0.07)" }}>
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="flex-1 px-7 py-6">
                          <h3 className="text-lg font-black text-[#0A2540]">{formation.formateur}</h3>
                          <p className="text-[11px] font-bold text-[#F7B500] uppercase tracking-wider mt-1">Formateur</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center justify-center px-7 py-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#0A2540] text-[#F7B500]" style={{ boxShadow: "0 0 0 4px white, 0 0 0 6px #F7B500" }}>
                            <FaUserTie size={36} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky card ── */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-2xl border border-gray-100 sticky top-20 overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}
            >
              {/* Price */}
              <div className="px-6 py-5 border-b border-gray-50">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Tarif</p>
                <p className="text-3xl font-black text-[#0A2540]">
                  {isFree ? "Gratuit" : `${formation.prix} DT`}
                </p>
                {placesRestantes !== null && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Places disponibles</span>
                    <span className={`text-sm font-bold ${placesRestantes <= 5 ? "text-red-500" : "text-emerald-600"}`}>
                      {placesRestantes}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="px-6 py-5 border-b border-gray-50 space-y-3.5">
                {formation.dateDebut && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7B500]/10 flex items-center justify-center flex-shrink-0">
                      <FaCalendarAlt className="text-[#F7B500]" size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {formatDate(formation.dateDebut)}{formation.dateFin && ` — ${formatDate(formation.dateFin)}`}
                      </p>
                    </div>
                  </div>
                )}
                {formation.duree && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7B500]/10 flex items-center justify-center flex-shrink-0">
                      <FaClock className="text-[#F7B500]" size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Durée</p>
                      <p className="text-xs font-semibold text-gray-700">{formation.duree}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F7B500]/10 flex items-center justify-center flex-shrink-0 text-[#F7B500]">
                    {formation?.mode === "en_ligne" ? <FaLaptop size={12} /> :
                      formation?.mode === "presentiel" ? <FaBuilding size={12} /> :
                        <FaChalkboardTeacher size={12} />}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Format</p>
                    <p className="text-xs font-semibold text-gray-700">{getFormatLabel()}</p>
                  </div>
                </div>
                {formation.localisation && formation.mode !== "en_ligne" && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7B500]/10 flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-[#F7B500]" size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Lieu</p>
                      <p className="text-xs font-semibold text-gray-700">{formation.localisation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-6 py-5 space-y-2.5">
                <button
                  onClick={handleInscription}
                  className="w-full bg-[#F7B500] text-[#0A2540] py-3.5 rounded-xl font-black text-sm hover:bg-[#e6a800] active:scale-[0.98] transition flex items-center justify-center gap-2"
                  style={{ boxShadow: "0 4px 14px rgba(247,181,0,0.35)" }}
                >
                  {isLoggedIn ? <FaPlayCircle size={14} /> : <FaCheckCircle size={14} />}
                  {isLoggedIn ? "Accéder à la formation" : "S'inscrire maintenant"}
                </button>
                {formation.lien_formation && (
                  <a
                    href={formation.lien_formation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm hover:border-[#F7B500] hover:text-[#F7B500] transition flex items-center justify-center gap-2"
                  >
                    <FaDownload size={12} /> Lien de la formation
                  </a>
                )}
              </div>

              {isFree && (
                <div className="mx-5 mb-5 px-4 py-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={13} />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Formation 100% gratuite</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Inscrivez-vous sans frais dès maintenant.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-[#0A2540] text-white py-7 mt-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-white/35 tracking-wide">
            © 2026 Business Expert Hub — Plateforme de formation pour startups
          </p>
        </div>
      </footer>
    </div>
  );
}