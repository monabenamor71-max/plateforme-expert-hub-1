"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft, FaCalendarAlt, FaEye,
  FaDownload, FaTag, FaChartLine, FaFilePdf,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

interface Article {
  id: number;
  titre: string;
  description: string;
  contenu: string;
  type: string;
  categorie: string;
  duree_lecture: string;
  statut: string;
  acces_prive: boolean;
  image: string;
  pdf: string;
  vues: number;
  createdAt: string;
}

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setP(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return p;
}

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const progress = useReadingProgress();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/articles/public/${id}`);
        if (!res.ok) throw new Error("Article non trouvé");
        const data = await res.json();
        setArticle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="ap-page">
        <style>{styles}</style>
        <div className="ap-center">
          <div className="ap-spinner" />
          <p className="ap-load-txt">Chargement de l'article…</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="ap-page">
        <style>{styles}</style>
        <div className="ap-center">
          <div style={{ fontSize: 52, marginBottom: 18 }}>📄</div>
          <h1 className="ap-empty-title">{error || "Article non trouvé"}</h1>
          <p className="ap-empty-sub">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/blog" className="ap-btn-dark">
            <FaArrowLeft size={12} /> Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  // Gate accès privé
  if (article.acces_prive && !isLoggedIn) {
    return (
      <div className="ap-page">
        <style>{styles}</style>
        <div className="ap-gate-page">
          <div className="ap-gate-card">
            <div className="ap-gate-lock">🔒</div>
            <div className="ap-gate-pill">Accès réservé aux membres</div>
            <h1 className="ap-gate-title">
              Cet article est réservé<br />
              <span>aux membres BEH</span>
            </h1>
            <p className="ap-gate-sub">
              Créez un compte gratuit pour accéder à cet article et à toute notre bibliothèque de ressources exclusives.
            </p>
            <div className="ap-gate-perks">
              <div className="ap-perk">✅ Accès à tous les articles premium</div>
              <div className="ap-perk">✅ Ressources & outils exclusifs</div>
              <div className="ap-perk">✅ Réseau d'experts certifiés</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <Link href="/inscription" className="ap-btn-gold">Créer un compte gratuit</Link>
              <Link href="/connexion" className="ap-btn-outline">Déjà membre ? Se connecter</Link>
            </div>
            <Link href="/blog" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>
              ← Retour au blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateFormatted = new Date(article.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfUrl = article.pdf ? `${BASE}/uploads/articles-pdf/${article.pdf}` : null;

  return (
    <div className="ap-page">
      <style>{styles}</style>

      {/* Barre de progression */}
      <div className="ap-progress" style={{ width: `${progress}%` }} />

      {/* Hero */}
      <div className="ap-hero">
        {article.image ? (
          <img
            src={`${BASE}/uploads/articles-img/${article.image}`}
            alt={article.titre}
            className="ap-hero-img"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="ap-hero-ph">
            <div className="ap-hero-ph-icon">
              <FaChartLine />
            </div>
          </div>
        )}
        <div className="ap-hero-ov" />
        <div className="ap-hero-cnt">
          <div className="ap-hero-top">
            <Link href="/blog" className="ap-back">
              <FaArrowLeft size={12} /> Retour aux articles
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="ap-cat-badge" style={{ background: "#3B82F6" }}>
              {article.categorie || article.type}
            </span>
            {article.acces_prive && (
              <span className="ap-priv-badge">🔒 Membres</span>
            )}
          </div>

          <h1 className="ap-hero-title">{article.titre}</h1>

          <div className="ap-meta">
            <div className="ap-author">
              <div className="ap-avatar">BEH</div>
              <div>
                <div className="ap-author-name">Business Expert Hub</div>
                <div className="ap-author-role">Équipe éditoriale</div>
              </div>
            </div>
            <div className="ap-meta-sep" />
            <span className="ap-meta-item">
              <FaCalendarAlt size={11} /> {dateFormatted}
            </span>
            <span className="ap-meta-item">
              <FaEye size={11} /> {article.vues?.toLocaleString()} vues
            </span>
          </div>
        </div>
      </div>

      {/* Corps de l'article */}
      <div className="ap-body">
        <main className="ap-main">

          {/* Tag (catégorie) */}
          <div className="ap-tags">
            <FaTag size={11} style={{ color: "#94A3B8", flexShrink: 0 }} />
            <span className="ap-tag">{article.categorie || "Non classé"}</span>
          </div>

          {/* ── DESCRIPTION SIMPLIFIÉE ── */}
          {article.description && (
            <div className="ap-desc-simple">
              <p className="ap-desc-simple-text">{article.description}</p>
            </div>
          )}

          {/* Contenu HTML */}
          {article.contenu && (
            <div
              className="ap-prose"
              dangerouslySetInnerHTML={{ __html: article.contenu }}
            />
          )}

          {/* Encart PDF (téléchargement inline) */}
          {pdfUrl && (
            <div className="ap-pdf-inline">
              <div className="ap-pdf-inline-left">
                <div className="ap-pdf-inline-icon">
                  <FaFilePdf />
                </div>
                <div>
                  <div className="ap-pdf-inline-title">Télécharger cet article en PDF</div>
                  <div className="ap-pdf-inline-sub">Version complète · Lecture hors ligne · Gratuit</div>
                </div>
              </div>
              <a href={pdfUrl} download className="ap-pdf-dl-btn">
                <FaDownload size={14} /> Télécharger le PDF
              </a>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="ap-sidebar">
          {/* Newsletter */}
          <div className="ap-sb-nl">
            <div className="ap-sb-nl-icon">✉️</div>
            <h3 className="ap-sb-nl-title">Restez informé</h3>
            <p className="ap-sb-nl-text">
              Recevez chaque semaine les meilleures ressources pour développer votre activité.
            </p>
            <Link href="/inscription" className="ap-btn-gold-sm">
              S'inscrire gratuitement
            </Link>
          </div>

          {/* Métadonnées */}
          <div className="ap-sb-meta">
            <div className="ap-sb-meta-title">Informations</div>
            <div className="ap-sb-meta-row">
              <span className="ap-sb-meta-label">Catégorie</span>
              <span className="ap-sb-meta-val" style={{ color: "#3B82F6" }}>
                {article.categorie || "—"}
              </span>
            </div>
            <div className="ap-sb-meta-row">
              <span className="ap-sb-meta-label">Vues</span>
              <span className="ap-sb-meta-val">{article.vues?.toLocaleString()}</span>
            </div>
            <div className="ap-sb-meta-row">
              <span className="ap-sb-meta-label">Publié le</span>
              <span className="ap-sb-meta-val">{dateFormatted}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }

  .ap-page { font-family: 'Plus Jakarta Sans', sans-serif; background: #F1F5F9; min-height: 100vh; color: #334155; }

  /* Progress bar */
  .ap-progress {
    position: fixed; top: 0; left: 0; height: 3px; z-index: 9999;
    background: linear-gradient(90deg, #3B82F6, #F7B500);
    transition: width 0.1s linear; border-radius: 0 2px 2px 0;
  }

  /* Centered pages */
  .ap-center {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 70vh; gap: 14px;
    padding: 40px 24px; text-align: center;
  }
  .ap-spinner {
    width: 42px; height: 42px; border: 3px solid #E2E8F0;
    border-top-color: #F7B500; border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .ap-load-txt { color: #94A3B8; font-size: 14px; font-weight: 500; }
  .ap-empty-title { font-size: 26px; font-weight: 900; color: #0A2540; margin: 0 0 10px; }
  .ap-empty-sub { color: #64748B; margin: 0 0 28px; line-height: 1.7; max-width: 480px; }

  /* Gate */
  .ap-gate-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 60px 24px; background: linear-gradient(135deg, #F8FAFF, #EFF6FF);
  }
  .ap-gate-card {
    background: white; border-radius: 26px; padding: 52px 44px; max-width: 500px;
    width: 100%; text-align: center; box-shadow: 0 24px 72px rgba(10,37,64,0.1);
    border: 1.5px solid rgba(59,130,246,0.1);
  }
  .ap-gate-lock {
    width: 66px; height: 66px; border-radius: 50%; background: #EFF6FF;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    margin: 0 auto 16px; border: 2px solid rgba(59,130,246,0.2);
  }
  .ap-gate-pill {
    display: inline-block; background: #EFF6FF; color: #1D4ED8;
    font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    padding: 5px 14px; border-radius: 50px; margin-bottom: 16px;
  }
  .ap-gate-title {
    font-size: 25px; font-weight: 900; color: #0A2540; line-height: 1.2; margin: 0 0 12px;
  }
  .ap-gate-title span { color: #3B82F6; }
  .ap-gate-sub { color: #64748B; font-size: 14px; line-height: 1.8; margin: 0 0 22px; }
  .ap-gate-perks {
    display: flex; flex-direction: column; gap: 9px;
    background: #F8FAFF; border-radius: 14px; padding: 18px 22px;
    margin-bottom: 22px; text-align: left; border: 1.5px solid rgba(59,130,246,0.08);
  }
  .ap-perk { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; color: #334155; }

  /* Hero */
  .ap-hero { position: relative; height: 500px; overflow: hidden; }
  .ap-hero-img { width: 100%; height: 100%; object-fit: cover; }
  .ap-hero-ph {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #0A2540, #1a3a6e);
    display: flex; align-items: center; justify-content: center;
  }
  .ap-hero-ph-icon {
    width: 90px; height: 90px; border-radius: 26px;
    background: rgba(59,130,246,0.18); border: 2px solid rgba(59,130,246,0.3);
    color: #60A5FA; display: flex; align-items: center;
    justify-content: center; font-size: 36px;
  }
  .ap-hero-ov {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,37,64,0.2) 0%, rgba(10,37,64,0.88) 100%);
  }
  .ap-hero-cnt {
    position: absolute; inset: 0; padding: 36px max(5%, 32px);
    display: flex; flex-direction: column; justify-content: space-between; color: white;
  }
  .ap-hero-top { display: flex; align-items: center; justify-content: space-between; }
  .ap-back {
    display: inline-flex; align-items: center; gap: 8px;
    color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; font-weight: 600;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    padding: 8px 16px; border-radius: 8px; transition: all 0.2s;
  }
  .ap-back:hover { background: rgba(255,255,255,0.2); color: white; }
  .ap-cat-badge { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; color: white; }
  .ap-priv-badge {
    background: rgba(255,255,255,0.15); color: white; padding: 4px 12px;
    border-radius: 99px; font-size: 11px; font-weight: 700;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .ap-hero-title {
    font-size: clamp(24px, 4.5vw, 46px); font-weight: 900; line-height: 1.1;
    margin: 0; max-width: 820px;
  }
  .ap-meta { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .ap-author { display: flex; align-items: center; gap: 10px; }
  .ap-avatar {
    width: 40px; height: 40px; border-radius: 11px; background: #F7B500;
    color: #0A2540; display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 900;
  }
  .ap-author-name { font-size: 13px; font-weight: 700; color: white; }
  .ap-author-role { font-size: 11px; color: rgba(255,255,255,0.5); }
  .ap-meta-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.2); }
  .ap-meta-item {
    display: flex; align-items: center; gap: 6px; font-size: 13px;
    color: rgba(255,255,255,0.65); font-weight: 500;
  }

  /* Body layout */
  .ap-body {
    max-width: 1200px; margin: 0 auto; padding: 52px 28px 80px;
    display: grid; grid-template-columns: minmax(0, 1fr) 300px;
    gap: 30px; align-items: start;
  }
  .ap-main { display: flex; flex-direction: column; gap: 24px; }

  /* Tags */
  .ap-tags {
    display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
    padding-bottom: 16px; border-bottom: 1.5px solid #E2E8F0;
  }
  .ap-tag {
    background: #F1F5F9; color: #475569; padding: 4px 12px;
    border-radius: 7px; font-size: 12px; font-weight: 600; border: 1px solid #E2E8F0;
  }

  /* ── DESCRIPTION SIMPLIFIÉE (pas de fond coloré ni guillemet) ── */
  .ap-desc-simple {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0 0 20px 0;
  }
  .ap-desc-simple-text {
    font-size: 16px;
    line-height: 1.75;
    color: #1e293b;
    font-weight: 500;
    margin: 0;
    white-space: pre-line;
  }

  /* Prose */
  .ap-prose {
    background: white; border-radius: 20px; padding: 44px 50px;
    box-shadow: 0 2px 14px rgba(10,37,64,0.05);
    border: 1.5px solid rgba(10,37,64,0.06);
    font-size: 16px; line-height: 1.85; color: #334155;
  }
  .ap-prose p { margin: 0 0 1.4em; }
  .ap-prose h2 {
    font-size: 20px; font-weight: 900; color: #0A2540;
    margin: 2em 0 0.7em; padding-bottom: 0.45em;
    border-bottom: 2.5px solid #F7B500;
    display: flex; align-items: center; gap: 10px;
  }
  .ap-prose h2::before {
    content: ''; display: inline-block; width: 4px; min-height: 20px;
    background: #3B82F6; border-radius: 2px;
  }
  .ap-prose h3 { font-size: 17px; font-weight: 800; color: #0A2540; margin: 1.5em 0 0.55em; }
  .ap-prose ul {
    margin: 0 0 1.4em; padding: 18px 22px; list-style: none;
    background: #F8FAFF; border-radius: 13px; border: 1.5px solid rgba(59,130,246,0.1);
  }
  .ap-prose ul li {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 5px 0; font-size: 14.5px; font-weight: 500;
  }
  .ap-prose ul li::before {
    content: ''; display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; background: #3B82F6; margin-top: 7px; flex-shrink: 0;
  }
  .ap-prose blockquote {
    margin: 1.8em 0; padding: 26px 30px; border-radius: 16px;
    background: linear-gradient(135deg, #0A2540, #1a3a6e);
    border-left: none; position: relative; overflow: hidden;
  }
  .ap-prose blockquote::before {
    content: '"'; position: absolute; top: -10px; left: 18px;
    font-size: 96px; font-weight: 900; color: rgba(247,181,0,0.14);
    line-height: 1; font-family: Georgia, serif;
  }
  .ap-prose blockquote p,
  .ap-prose blockquote {
    color: white; font-size: 16px; font-weight: 600; line-height: 1.7; font-style: italic; margin: 0;
  }
  .ap-prose a { color: #3B82F6; font-weight: 600; }
  .ap-prose strong { color: #0A2540; font-weight: 800; }

  /* PDF inline */
  .ap-pdf-inline {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: white; border-radius: 16px; padding: 20px 24px;
    border: 1.5px solid rgba(59,130,246,0.15); box-shadow: 0 2px 12px rgba(10,37,64,0.05);
  }
  .ap-pdf-inline-left { display: flex; align-items: center; gap: 14px; }
  .ap-pdf-inline-icon {
    width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
    background: #EFF6FF; color: #3B82F6; display: flex;
    align-items: center; justify-content: center; font-size: 20px;
  }
  .ap-pdf-inline-title { font-size: 14px; font-weight: 800; color: #0A2540; margin-bottom: 3px; }
  .ap-pdf-inline-sub { font-size: 12px; color: #94A3B8; font-weight: 500; }
  .ap-pdf-dl-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0A2540; color: #F7B500; padding: 11px 22px;
    border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 13px;
    white-space: nowrap; flex-shrink: 0; transition: all 0.22s;
  }
  .ap-pdf-dl-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(10,37,64,0.2); }

  /* Sidebar */
  .ap-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 16px; }
  .ap-sb-nl {
    background: white; border-radius: 18px; padding: 22px 20px;
    border: 1.5px solid rgba(10,37,64,0.07); text-align: center;
  }
  .ap-sb-nl-icon { font-size: 30px; margin-bottom: 9px; }
  .ap-sb-nl-title { font-size: 14px; font-weight: 900; color: #0A2540; margin: 0 0 7px; }
  .ap-sb-nl-text { font-size: 12.5px; color: #64748B; line-height: 1.65; margin: 0 0 15px; }
  .ap-sb-meta {
    background: white; border-radius: 18px; padding: 20px;
    border: 1.5px solid rgba(10,37,64,0.07);
  }
  .ap-sb-meta-title {
    font-size: 11px; font-weight: 800; color: #0A2540;
    margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1.2px;
  }
  .ap-sb-meta-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid #F1F5F9;
  }
  .ap-sb-meta-row:last-child { border-bottom: none; }
  .ap-sb-meta-label { font-size: 12px; color: #94A3B8; font-weight: 600; }
  .ap-sb-meta-val { font-size: 12.5px; color: #334155; font-weight: 700; }

  /* Buttons */
  .ap-btn-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0A2540; color: #F7B500; padding: 12px 22px;
    border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;
  }
  .ap-btn-gold {
    display: block; text-align: center; background: #F7B500; color: #0A2540;
    padding: 13px 24px; border-radius: 12px; text-decoration: none; font-weight: 800;
    font-size: 14px; box-shadow: 0 6px 18px rgba(247,181,0,0.28); transition: all 0.22s;
  }
  .ap-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(247,181,0,0.38); }
  .ap-btn-gold-sm {
    display: inline-block; background: #F7B500; color: #0A2540;
    padding: 10px 20px; border-radius: 9px; text-decoration: none;
    font-weight: 800; font-size: 13px; transition: all 0.2s;
  }
  .ap-btn-gold-sm:hover { transform: translateY(-2px); }
  .ap-btn-outline {
    display: block; text-align: center; background: white; color: #0A2540;
    padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700;
    font-size: 14px; border: 2px solid rgba(10,37,64,0.12); transition: all 0.2s;
  }
  .ap-btn-outline:hover { border-color: #3B82F6; color: #3B82F6; }

  @media (max-width: 960px) {
    .ap-body { grid-template-columns: 1fr; }
    .ap-sidebar { position: static; }
    .ap-prose { padding: 28px 24px; }
    .ap-hero { height: 420px; }
  }
  @media (max-width: 640px) {
    .ap-hero { height: 380px; }
    .ap-prose { padding: 20px 16px; }
    .ap-body { padding: 28px 16px 60px; }
    .ap-pdf-inline { flex-direction: column; align-items: flex-start; }
  }
`;