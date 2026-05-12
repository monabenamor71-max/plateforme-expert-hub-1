"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaChartLine, FaArrowRight, FaArrowLeft,
  FaSearchPlus, FaGraduationCap, FaDesktop, FaGift,
  FaCheckCircle, FaExclamationTriangle,
  FaRocket, FaMobileAlt, FaCogs,
  FaUserTie, FaChartBar, FaShieldAlt, FaComments,
  FaStore, FaBuilding, FaIndustry, FaEllipsisH,
  FaGlobe, FaLayerGroup, FaCode, FaDatabase,
  FaLightbulb, FaHandshake, FaTrophy, FaHeadset, FaStar,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { label: "Consulting",      slug: "consulting"      },
  { label: "Audit sur site",  slug: "audit-sur-site"  },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations",      slug: "formations"      },
];

// ─── CODE ANIMATION ───────────────────────────────────────────────────────────
const CODE_LINES = [
  { ln: "01", parts: [{ t: "cm", v: "// BEH Platform — Tableau de bord" }] },
  { ln: "02", parts: [{ t: "kw", v: "import" }, { t: "op", v: " { " }, { t: "nm", v: "Dashboard" }, { t: "op", v: ", " }, { t: "nm", v: "KpiTracker" }, { t: "op", v: " } " }, { t: "kw", v: "from" }, { t: "str", v: " '@beh/platform'" }, { t: "op", v: ";" }] },
  { ln: "03", parts: [{ t: "kw", v: "import" }, { t: "op", v: " { " }, { t: "nm", v: "ClientArchive" }, { t: "op", v: " } " }, { t: "kw", v: "from" }, { t: "str", v: " '@beh/data'" }, { t: "op", v: ";" }] },
  { ln: "04", parts: [] },
  { ln: "05", parts: [{ t: "kw", v: "const" }, { t: "op", v: " " }, { t: "nm", v: "app" }, { t: "op", v: " = " }, { t: "kw", v: "new" }, { t: "op", v: " " }, { t: "fn", v: "Dashboard" }, { t: "op", v: "({" }] },
  { ln: "06", parts: [{ t: "op", v: "  " }, { t: "nm", v: "workspace" }, { t: "op", v: ": " }, { t: "str", v: "'votre-entreprise'" }, { t: "op", v: "," }] },
  { ln: "07", parts: [{ t: "op", v: "  " }, { t: "nm", v: "modules" }, { t: "op", v: ": [" }, { t: "str", v: "'clients'" }, { t: "op", v: ", " }, { t: "str", v: "'kpi'" }, { t: "op", v: ", " }, { t: "str", v: "'rapports'" }, { t: "op", v: "]" }] },
  { ln: "08", parts: [{ t: "op", v: "});" }] },
  { ln: "09", parts: [] },
  { ln: "10", parts: [{ t: "cm", v: "// Archivage automatique base clients" }] },
  { ln: "11", parts: [{ t: "kw", v: "const" }, { t: "op", v: " " }, { t: "nm", v: "archive" }, { t: "op", v: " = " }, { t: "kw", v: "await" }, { t: "op", v: " " }, { t: "fn", v: "ClientArchive" }, { t: "op", v: ".sync" }, { t: "op", v: "({" }] },
  { ln: "12", parts: [{ t: "op", v: "  " }, { t: "nm", v: "auto" }, { t: "op", v: ": " }, { t: "kw", v: "true" }, { t: "op", v: "," }] },
  { ln: "13", parts: [{ t: "op", v: "  " }, { t: "nm", v: "interval" }, { t: "op", v: ": " }, { t: "str", v: "'24h'" }] },
  { ln: "14", parts: [{ t: "op", v: "});" }] },
  { ln: "15", parts: [] },
  { ln: "16", parts: [{ t: "cm", v: "// Suivi KPI temps réel" }] },
  { ln: "17", parts: [{ t: "nm", v: "app" }, { t: "op", v: "." }, { t: "fn", v: "onKpiUpdate" }, { t: "op", v: "((data) => {" }] },
  { ln: "18", parts: [{ t: "op", v: "  " }, { t: "fn", v: "console" }, { t: "op", v: "." }, { t: "fn", v: "log" }, { t: "op", v: "(" }, { t: "str", v: "`KPI:`" }, { t: "op", v: ", data);" }] },
  { ln: "19", parts: [{ t: "op", v: "  " }, { t: "nm", v: "dashboard" }, { t: "op", v: "." }, { t: "fn", v: "refresh" }, { t: "op", v: "();" }] },
  { ln: "20", parts: [{ t: "op", v: "});" }] },
];
const COLOR_MAP: Record<string, string> = {
  kw: "#C678DD", fn: "#61AFEF", str: "#98C379", cm: "#5C6370", nm: "#E5C07B", op: "#ABB2BF",
};

// ─── SVG SCREENS ─────────────────────────────────────────────────────────────
function ScreenERPMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#F8FAFC" />
      <rect width="480" height="40" fill="#0A2540" />
      <rect x="10" y="12" width="50" height="16" rx="3" fill="#F7B500" opacity="0.9" />
      <text x="35" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">BEH ERP</text>
      {["Dashboard","Ventes","Stock","RH","Comptabilité"].map((t,i)=><text key={i} x={85+i*55} y="24" fill="rgba(255,255,255,0.5)" fontSize="7.5">{t}</text>)}
      <rect x="400" y="10" width="68" height="20" rx="4" fill="#F7B500" />
      <text x="434" y="23" textAnchor="middle" fill="#0A2540" fontSize="8" fontWeight="700">+ Nouveau</text>
      <rect x="0" y="40" width="110" height="260" fill="#F1F5F9" />
      {[["🏠","Accueil"],["📊","Rapports"],["👥","Clients"],["📦","Stocks"],["💰","Facturation"],["⚙️","Paramètres"]].map(([ic,lb],i) => (
        <g key={i}><rect x="6" y={72+i*32} width="98" height="24" rx="5" fill={i===0?"#0A2540":"transparent"}/><text x="18" y={88+i*32} fill={i===0?"#F7B500":"#64748B"} fontSize="8">{ic} {lb}</text></g>
      ))}
      {[["Chiffre d'affaires","124 500 TND","+12%","#10B981"],["Marge brute","48 200 TND","+8%","#3B82F6"],["Commandes","342","+24%","#F7B500"],["Clients actifs","247","+5%","#8B5CF6"]].map(([n,v,g,c],i) => (
        <g key={i}>
          <rect x={118+(i%2)*170} y={50+Math.floor(i/2)*80} width="158" height="68" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1"/>
          <text x={130+(i%2)*170} y={72+Math.floor(i/2)*80} fill="#64748B" fontSize="7">{n}</text>
          <text x={130+(i%2)*170} y={90+Math.floor(i/2)*80} fill="#0A2540" fontSize="13" fontWeight="900">{v}</text>
          <rect x={240+(i%2)*170} y={56+Math.floor(i/2)*80} width="28" height="14" rx="7" fill={`${c}22`}/>
          <text x={254+(i%2)*170} y={66+Math.floor(i/2)*80} textAnchor="middle" fill={c as string} fontSize="7" fontWeight="700">{g}</text>
        </g>
      ))}
      <rect x="118" y="216" width="352" height="72" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="130" y="232" fill="#64748B" fontSize="7">Évolution chiffre d'affaires — 6 derniers mois</text>
      {[35,55,45,70,60,85].map((h,i) => (
        <g key={i}><rect x={138+i*42} y={285-h} width="28" height={h} rx="3" fill="#F7B500" opacity="0.7"/><text x={152+i*42} y="293" textAnchor="middle" fill="#94A3B8" fontSize="5.5">{["Jan","Fév","Mar","Avr","Mai","Jun"][i]}</text></g>
      ))}
    </svg>
  );
}
function ScreenERPList() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#fff" />
      <rect width="480" height="40" fill="#F8FAFC" />
      <text x="20" y="25" fill="#0A2540" fontSize="9" fontWeight="700">Liste des produits & stocks</text>
      <rect x="350" y="10" width="118" height="20" rx="5" fill="#0A2540" /><text x="409" y="23" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">+ Ajouter produit</text>
      <rect x="10" y="48" width="460" height="22" rx="4" fill="#F1F5F9" />
      {[["20","Référence"],["100","Désignation"],["240","Qté stock"],["320","Prix HT"],["400","Statut"]].map(([x,t])=><text key={t} x={parseInt(x)} y="63" fill="#94A3B8" fontSize="7">{t}</text>)}
      {[["PRD-001","Tableau de bord digital","12 unités","2 400 TND","Actif","#10B981"],["PRD-002","Module CRM Pro","8 licences","1 800 TND","Actif","#10B981"],["PRD-003","Pack Formation","25 places","950 TND","Limité","#F7B500"],["PRD-004","Audit sur site","—","3 500 TND","Sur devis","#3B82F6"],["PRD-005","ERP Complet","5 licences","8 200 TND","Actif","#10B981"],["PRD-006","Consulting Strategy","—","5 000 TND","Actif","#10B981"]].map(([ref,name,qty,price,st,c],i) => (
        <g key={i}><rect x="10" y={76+i*34} width="460" height="28" rx="4" fill={i%2===0?"#F8FAFC":"#fff"}/><text x="20" y={94+i*34} fill="#64748B" fontSize="7">{ref}</text><text x="100" y={94+i*34} fill="#0A2540" fontSize="7.5" fontWeight="500">{name}</text><text x="240" y={94+i*34} fill="#64748B" fontSize="7">{qty}</text><text x="320" y={94+i*34} fill="#0A2540" fontSize="7" fontWeight="600">{price}</text><rect x="392" y={80+i*34} width="40" height="16" rx="8" fill={`${c}18`}/><text x="412" y={91+i*34} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{st}</text></g>
      ))}
    </svg>
  );
}
function ScreenERPStats() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#fff" /><rect width="480" height="40" fill="#0A2540" />
      <text x="20" y="25" fill="#fff" fontSize="9" fontWeight="700">Statistiques & Rapports</text><text x="380" y="25" fill="#F7B500" fontSize="7">Juin 2026 ▾</text>
      <rect x="10" y="52" width="220" height="220" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
      <text x="120" y="75" textAnchor="middle" fill="#64748B" fontSize="8">Répartition services</text>
      <circle cx="120" cy="155" r="52" fill="none" stroke="#F7B500" strokeWidth="24" strokeDasharray="100 200" strokeDashoffset="0"/>
      <circle cx="120" cy="155" r="52" fill="none" stroke="#3B82F6" strokeWidth="24" strokeDasharray="65 200" strokeDashoffset="-100"/>
      <circle cx="120" cy="155" r="52" fill="none" stroke="#10B981" strokeWidth="24" strokeDasharray="35 200" strokeDashoffset="-165"/>
      <text x="120" y="159" textAnchor="middle" fill="#0A2540" fontSize="11" fontWeight="900">100%</text>
      {[["#F7B500","ERP","50%"],["#3B82F6","CRM","33%"],["#10B981","Projets","17%"]].map(([c,l,p],i)=><g key={i}><rect x="18" y={220+i*16} width="10" height="10" rx="3" fill={c as string}/><text x="32" y={229+i*16} fill="#64748B" fontSize="7">{l} — {p}</text></g>)}
      <rect x="244" y="52" width="226" height="220" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
      <text x="357" y="75" textAnchor="middle" fill="#64748B" fontSize="8">Top indicateurs</text>
      {[["Taux satisfaction","94%","#F7B500"],["Croissance MoM","+12%","#10B981"],["NPS Score","72","#3B82F6"],["Support résolu","98%","#8B5CF6"],["Délai livraison","3.2j","#EF4444"],["Rétention client","88%","#F7B500"]].map(([l,v,c],i)=><g key={i}><rect x="252" y={85+i*28} width="210" height="22" rx="5" fill={i%2===0?"#fff":"#F1F5F9"}/><text x="262" y={100+i*28} fill="#64748B" fontSize="7">{l}</text><text x="454" y={100+i*28} textAnchor="end" fill={c as string} fontSize="9" fontWeight="900">{v}</text></g>)}
    </svg>
  );
}
function ScreenCRMMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#F8FAFC"/><rect width="480" height="40" fill="#0A2540"/>
      <rect x="10" y="12" width="50" height="16" rx="3" fill="#F7B500" opacity="0.9"/>
      <text x="35" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">BEH CRM</text>
      {["Dashboard","Clients","Pipeline","Objectifs","Rapports"].map((t,i)=><text key={i} x={85+i*65} y="24" fill={i===0?"#F7B500":"rgba(255,255,255,0.5)"} fontSize="8" fontWeight={i===0?"700":"400"}>{t}</text>)}
      <rect x="400" y="10" width="68" height="20" rx="4" fill="#F7B500"/><text x="434" y="23" textAnchor="middle" fill="#0A2540" fontSize="8" fontWeight="700">+ Client</text>
      <rect x="0" y="40" width="100" height="260" fill="#F1F5F9"/>
      {[["📊","Dashboard"],["👥","Clients"],["🎯","Objectifs"],["📋","Séances"],["📈","Rapports"]].map(([ic,lb],i)=><g key={i}><rect x="6" y={52+i*34} width="88" height="26" rx="5" fill={i===0?"#0A2540":"transparent"}/><text x="18" y={69+i*34} fill={i===0?"#F7B500":"#64748B"} fontSize="8">{ic} {lb}</text></g>)}
      {[["247","Clients actifs","#F7B500"],["38","Séances/mois","#3B82F6"],["94%","Satisfaction","#10B981"],["12k","CA mensuel","#8B5CF6"]].map(([v,l,c],i)=><g key={i}><rect x={108+i*90} y="50" width="82" height="58" rx="7" fill="#fff" stroke="#E2E8F0" strokeWidth="1"/><text x={149+i*90} y="70" textAnchor="middle" fill={c as string} fontSize="16" fontWeight="900">{v}</text><text x={149+i*90} y="84" textAnchor="middle" fill="#94A3B8" fontSize="6">{l}</text></g>)}
      <rect x="108" y="118" width="362" height="28" rx="4" fill="#F1F5F9"/>
      {[["120","Client"],["220","Service"],["300","Objectif"],["380","Statut"],["440","Score"]].map(([x,t])=><text key={t} x={parseInt(x)} y="136" fill="#94A3B8" fontSize="7">{t}</text>)}
      {[["Sophie Martin","Coaching","Leadership","Actif","94%","#10B981"],["Marc Dubois","Consulting","Organisation","En cours","72%","#F7B500"],["Leila Ben Ali","Formation","Management","Actif","88%","#10B981"],["Jean-Paul Roy","Audit","Conformité","Clôturé","100%","#3B82F6"]].map(([n,s,o,st,sc,c],i)=>(
        <g key={i}><rect x="108" y={150+i*32} width="362" height="26" rx="3" fill={i%2===0?"#fff":"#F8FAFC"}/><circle cx="124" cy={163+i*32} r="8" fill={`${c}20`}/><text x="124" y={166+i*32} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{(n as string)[0]}</text><text x="138" y={166+i*32} fill="#0A2540" fontSize="7.5" fontWeight="500">{n}</text><text x="220" y={166+i*32} fill="#64748B" fontSize="7">{s}</text><text x="300" y={166+i*32} fill="#64748B" fontSize="7">{o}</text><rect x="370" y={156+i*32} width="40" height="14" rx="7" fill={`${c}18`}/><text x="390" y={166+i*32} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{st}</text><text x="450" y={166+i*32} textAnchor="middle" fill={c as string} fontSize="7" fontWeight="700">{sc}</text></g>
      ))}
    </svg>
  );
}
function ScreenCRMObjectifs() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#fff"/><rect width="480" height="40" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
      <text x="20" y="25" fill="#0A2540" fontSize="9" fontWeight="700">Suivi des Objectifs Commerciaux</text><text x="390" y="25" fill="#F7B500" fontSize="7" fontWeight="600">Q2 2026 ▾</text>
      {[["Objectif revenus","78%","#F7B500"],["Taux fidélisation","94%","#10B981"],["Séances réalisées","65%","#3B82F6"],["NPS Score","88%","#8B5CF6"],["Nouveaux clients","52%","#EF4444"],["Conversion leads","71%","#F7B500"]].map(([l,p,c],i)=>(
        <g key={i}><rect x="12" y={48+i*38} width="456" height="30" rx="8" fill={i%2===0?"#F8FAFC":"#fff"} stroke="#E2E8F0" strokeWidth="0.5"/><text x="22" y={68+i*38} fill="#0A2540" fontSize="8" fontWeight="600">{l}</text><rect x="190" y={56+i*38} width="200" height="8" rx="4" fill="#E2E8F0"/><rect x="190" y={56+i*38} width={parseInt(p as string)*2} height="8" rx="4" fill={c as string} opacity="0.8"/><text x="400" y={64+i*38} fill={c as string} fontSize="9" fontWeight="800">{p}</text><circle cx="440" cy={61+i*38} r="10" fill={`${c}15`}/><text x="440" y={65+i*38} textAnchor="middle" fill={c as string} fontSize="10">✓</text></g>
      ))}
    </svg>
  );
}
function ScreenCRMKPI() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#0A2540"/>
      <text x="24" y="32" fill="#F7B500" fontSize="12" fontWeight="900">KPI Dashboard — Temps Réel</text>
      <text x="24" y="48" fill="rgba(255,255,255,0.4)" fontSize="8">Mis à jour il y a 2 min</text>
      <circle cx="456" cy="28" r="7" fill="rgba(34,197,94,0.2)"/><circle cx="456" cy="28" r="4" fill="#22C55E"/>
      {[["247","Clients","#F7B500"],["94%","Sat.","#10B981"],["12k","CA","#60A5FA"],["38","Séances","#C084FC"],["88","NPS","#F7B500"],["98%","Support","#10B981"]].map(([v,l,c],i)=>(
        <g key={i}><rect x={12+i%3*158} y={60+Math.floor(i/3)*90} width="148" height="78" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/><text x={86+i%3*158} y={95+Math.floor(i/3)*90} textAnchor="middle" fill={c as string} fontSize="18" fontWeight="900">{v}</text><text x={86+i%3*158} y={112+Math.floor(i/3)*90} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">{l}</text></g>
      ))}
      {[42,68,55,84,74,97,90,78].map((h,i)=><g key={i}><rect x={16+i*56} y={250-h*0.52} width="44" height={h*0.52} rx="5" fill="#F7B500" opacity={0.35+i*0.08}/><text x={38+i*56} y="268" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">{["Lun","Mar","Mer","Jeu","Ven","Sam","Dim","Total"][i]}</text></g>)}
    </svg>
  );
}
function ScreenGestionMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#F8FAFC"/><rect width="480" height="40" fill="#0A2540"/>
      <rect x="10" y="12" width="60" height="16" rx="3" fill="#F7B500" opacity="0.9"/>
      <text x="40" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">PROJETS BEH</text>
      {["Vue globale","Mes projets","Équipes","Planning","Rapports"].map((t,i)=><text key={i} x={95+i*70} y="24" fill={i===0?"#F7B500":"rgba(255,255,255,0.5)"} fontSize="8" fontWeight={i===0?"700":"400"}>{t}</text>)}
      <rect x="420" y="10" width="50" height="20" rx="4" fill="#F7B500"/><text x="445" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="700">+ Projet</text>
      {[["12","Projets actifs","#F7B500"],["8","En cours","#3B82F6"],["4","Terminés","#10B981"],["93%","Taux succès","#8B5CF6"]].map(([v,l,c],i)=><g key={i}><rect x={10+i*115} y="52" width="104" height="60" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1"/><text x={62+i*115} y="75" textAnchor="middle" fill={c as string} fontSize="18" fontWeight="900">{v}</text><text x={62+i*115} y="90" textAnchor="middle" fill="#94A3B8" fontSize="7">{l}</text></g>)}
      {[["À faire","#F7B500",["Audit client ABC","Rapport mensuel"]],["En cours","#3B82F6",["Refonte processus","Formation équipe","Analyse KPI"]],["Terminé","#10B981",["Audit Dupont SA","CRM déploiement"]]].map(([col,color,tasks],i)=>(
        <g key={i}><rect x={10+i*155} y="124" width="148" height="166" rx="8" fill="#F1F5F9"/><text x={22+i*155} y="142" fill={color as string} fontSize="8" fontWeight="700">{col as string}</text><circle cx={144+i*155} cy="137" r="9" fill={`${color}20`}/><text x={144+i*155} y="141" textAnchor="middle" fill={color as string} fontSize="8" fontWeight="800">{(tasks as string[]).length}</text>
          {(tasks as string[]).map((t,ti)=><g key={ti}><rect x={18+i*155} y={152+ti*40} width="132" height="32" rx="6" fill="#fff" stroke="#E2E8F0" strokeWidth="0.5"/><rect x={22+i*155} y={158+ti*40} width="4" height="20" rx="2" fill={color as string}/><text x={32+i*155} y={168+ti*40} fill="#0A2540" fontSize="7" fontWeight="500">{t}</text><text x={32+i*155} y={178+ti*40} fill="#94A3B8" fontSize="6">En attente • 2j</text></g>)}
        </g>
      ))}
    </svg>
  );
}
function ScreenGestionTimeline() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#fff"/><rect width="480" height="40" fill="#F8FAFC"/>
      <text x="20" y="25" fill="#0A2540" fontSize="9" fontWeight="700">Planning des projets — Gantt</text><text x="390" y="25" fill="#F7B500" fontSize="7">Avr – Jun 2026</text>
      <rect x="10" y="48" width="130" height="22" fill="#F1F5F9"/><text x="18" y="63" fill="#94A3B8" fontSize="6.5">Projet</text>
      {["Avr","Mai","Jun"].map((m,i)=><g key={i}><rect x={148+i*110} y="48" width="108" height="22" fill="#F1F5F9"/><text x={202+i*110} y="63" textAnchor="middle" fill="#94A3B8" fontSize="6.5">{m} 2026</text></g>)}
      {[["Projet Alpha",0,200,"#F7B500"],["Projet Beta",70,130,"#3B82F6"],["Projet Gamma",150,160,"#10B981"],["Projet Delta",30,250,"#8B5CF6"],["Projet Epsilon",190,100,"#EF4444"],["Projet Zeta",100,180,"#F7B500"]].map(([n,start,width,c],i)=>(
        <g key={i}><rect x="10" y={74+i*34} width="130" height="28" fill={i%2===0?"#F8FAFC":"#fff"}/><text x="18" y={92+i*34} fill="#0A2540" fontSize="8" fontWeight="500">{n}</text><rect x="148" y={74+i*34} width="332" height="28" fill={i%2===0?"#F8FAFC":"#fff"}/><rect x={154+(start as number)*1.05} y={78+i*34} width={(width as number)*1.05} height="18" rx="9" fill={c as string} opacity="0.72"/><text x={158+(start as number)*1.05} y={90+i*34} fill="#fff" fontSize="6.5" fontWeight="600">{n}</text></g>
      ))}
    </svg>
  );
}
function ScreenGestionStats() {
  return (
    <svg viewBox="0 0 480 300" style={{ width:"100%", display:"block" }}>
      <rect width="480" height="300" fill="#fff"/><rect width="480" height="40" fill="#0A2540"/>
      <text x="20" y="25" fill="#fff" fontSize="9" fontWeight="700">Analyses & Performance projets</text><text x="380" y="25" fill="#F7B500" fontSize="7">Q2 2026</text>
      {[["12","Projets actifs","#F7B500","↑"],["93%","Taux succès","#10B981","↑"],["4.2j","Délai moy.","#3B82F6","↓"],["87%","Budget respect.","#8B5CF6","↑"]].map(([v,l,c,a],i)=><g key={i}><rect x={10+i*117} y="52" width="107" height="70" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/><text x={63+i*117} y="78" textAnchor="middle" fill={c as string} fontSize="17" fontWeight="900">{v}</text><text x={63+i*117} y="94" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="6.5">{l}</text><text x={103+i*117} y="64" fill={c as string} fontSize="12" fontWeight="900">{a}</text></g>)}
      <rect x="10" y="134" width="220" height="156" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
      <text x="120" y="155" textAnchor="middle" fill="#64748B" fontSize="8">Statut des projets</text>
      {[["#10B981","Terminés","33%"],["#3B82F6","En cours","50%"],["#F7B500","À faire","17%"]].map(([c,l,p],i)=><g key={i}><rect x="20" y={168+i*42} width="200" height="34" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="0.5"/><rect x="28" y={174+i*42} width="5" height="22" rx="3" fill={c as string}/><text x="40" y={186+i*42} fill="#0A2540" fontSize="8" fontWeight="600">{l}</text><text x="40" y={196+i*42} fill="#94A3B8" fontSize="6">{p} du total</text><rect x="130" y={178+i*42} width="70" height="8" rx="4" fill="#E2E8F0"/><rect x="130" y={178+i*42} width={parseInt(p)*0.7} height="8" rx="4" fill={c as string} opacity="0.75"/></g>)}
      <rect x="244" y="134" width="226" height="156" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
      <text x="357" y="155" textAnchor="middle" fill="#64748B" fontSize="8">Livraisons hebdomadaires</text>
      {[2,4,3,6,5,7,4].map((v,i)=><g key={i}><rect x={254+i*28} y={268-v*14} width="20" height={v*14} rx="4" fill="#10B981" opacity={0.5+i*0.07}/><text x={264+i*28} y="278" textAnchor="middle" fill="#94A3B8" fontSize="5.5">{["S1","S2","S3","S4","S5","S6","S7"][i]}</text></g>)}
    </svg>
  );
}

// ─── HOOKS & UTILS ────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, v] as const;
}

function FadeUp({ children, delay = 0, className = "", style = {}, ...rest }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  const [ref, v] = useInView(0.07);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(36px)",
        transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "", style = {}, ...rest }: { children: React.ReactNode; delay?: number; from?: "left"|"right"; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  const [ref, v] = useInView(0.07);
  const translateX = from === "left" ? "-48px" : "48px";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "translateX(0)" : `translateX(${translateX})`,
        transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function ScaleIn({ children, delay = 0, className = "", style = {}, ...rest }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  const [ref, v] = useInView(0.07);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "scale(1)" : "scale(.88)",
        transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s, transform .65s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── AUTO SCROLL LIST ─────────────────────────────────────────────────────────
function AutoScrollList({ screens, accentColor = "#F7B500", speed = 28 }: { screens: { label: string; icon: string; comp: React.ReactNode; description?: string }[]; accentColor?: string; speed?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const posRef   = useRef(0);
  const doubled = [...screens, ...screens];
  const ITEM_H = 320; const GAP = 20; const STEP_H = ITEM_H + GAP; const totalH = screens.length * STEP_H;
  useEffect(() => {
    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000; last = now;
      posRef.current += speed * dt;
      if (posRef.current >= totalH) posRef.current -= totalH;
      if (trackRef.current) trackRef.current.style.transform = `translateY(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, totalH]);
  return (
    <div style={{ position: "relative", overflow: "hidden", height: ITEM_H * 1.35, borderRadius: 18 }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:60, background:"linear-gradient(to bottom,#fff,transparent)", zIndex:10, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to top,#fff,transparent)", zIndex:10, pointerEvents:"none" }}/>
      <div ref={trackRef} style={{ willChange:"transform" }}>
        {doubled.map((s, idx) => (
          <div key={idx} style={{ marginBottom: GAP }}>
            <div style={{ background:"#F1F5F9", borderRadius:"14px 14px 0 0", padding:"10px 14px", display:"flex", alignItems:"center", gap:8, border:"1px solid #E2E8F0", borderBottomColor:"transparent" }}>
              {["#FF5F57","#FFBC2E","#28C840"].map(c=><div key={c} style={{ width:9, height:9, borderRadius:"50%", background:c }}/>)}
              <div style={{ flex:1, background:"#fff", borderRadius:6, padding:"3px 10px", fontSize:10, color:"#94A3B8", border:"1px solid #E2E8F0" }}>beh-platform.tn/{s.label.toLowerCase().replace(/\s+/g,"-")}</div>
              <div style={{ width:7, height:7, borderRadius:"50%", background:accentColor }}/>
            </div>
            <div style={{ border:"1px solid #E2E8F0", borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden", boxShadow:"0 8px 28px rgba(10,37,64,.09)" }}>{s.comp}</div>
            {s.description && <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#6B7280" }}><span style={{ width:5, height:5, borderRadius:"50%", background:accentColor, display:"inline-block", flexShrink:0 }}/>{s.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PLATFORM BLOCK ───────────────────────────────────────────────────────────
function PlatformBlock({ num, badge, badgeBg, badgeText, title, problems, results, screens, accentColor, reverse = false }: { num: string; badge: string; badgeBg: string; badgeText: string; title: string; problems: string[]; results: string[]; screens: { label: string; icon: string; comp: React.ReactNode; description?: string }[]; accentColor: string; reverse?: boolean }) {
  const textCol = (
    <SlideIn delay={0.1} from={reverse ? "right" : "left"}>
      <div style={{ display:"flex", flexDirection:"column", gap:24, justifyContent:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontWeight:900, fontSize:52, color:"#E2E8F0", lineHeight:1 }}>{num}</span>
          <div>
            <span style={{ background:badgeBg, color:badgeText, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:99, letterSpacing:"1px", textTransform:"uppercase" as const }}>{badge}</span>
            <h3 style={{ fontWeight:900, fontSize:"clamp(22px,2.5vw,30px)", color:"#0A2540", margin:"8px 0 0", lineHeight:1.15 }}>{title}</h3>
          </div>
        </div>
        <div style={{ background:"#FFF5F5", border:"1px solid #FEE2E2", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <FaExclamationTriangle size={14} color="#EF4444"/><span style={{ fontWeight:700, fontSize:13, color:"#DC2626" }}>Problèmes résolus</span>
          </div>
          {problems.map((p,i)=><div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#374151", marginBottom:6 }}><span style={{ color:"#EF4444", fontWeight:700, flexShrink:0, marginTop:1 }}>✕</span>{p}</div>)}
        </div>
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <FaCheckCircle size={14} color="#10B981"/><span style={{ fontWeight:700, fontSize:13, color:"#059669" }}>Résultats obtenus</span>
          </div>
          {results.map((r,i)=><div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#374151", marginBottom:6 }}><span style={{ color:"#10B981", fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>{r}</div>)}
        </div>
        <div style={{ display:"flex", gap:14 }}>
          <Link href="/inscription-startup?demo=1" style={{ flex:1 }}>
            <button className="btn-plat-gold" style={{ width:"100%", background:"#F7B500", color:"#0A2540", border:"none", borderRadius:12, padding:"14px 0", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><FaDesktop size={14}/> Réserver une démo</button>
          </Link>
          <Link href="/inscription-startup?essai=1" style={{ flex:1 }}>
            <button className="btn-plat-dark" style={{ width:"100%", background:"#0A2540", color:"#fff", border:"1px solid rgba(247,181,0,0.3)", borderRadius:12, padding:"14px 0", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><FaGift size={14}/> Essai gratuit 7j</button>
          </Link>
        </div>
      </div>
    </SlideIn>
  );
  const scrollCol = (
    <SlideIn delay={0.2} from={reverse ? "left" : "right"}>
      <AutoScrollList screens={screens} accentColor={accentColor} speed={28}/>
    </SlideIn>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center", padding:"72px 0", borderBottom:"1px solid #F1F5F9" }}>
      {reverse ? <>{scrollCol}{textCol}</> : <>{textCol}{scrollCol}</>}
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function NosPlateformesPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [codeOffset, setCodeOffset] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // ==================== TAUX DE SATISFACTION DEPUIS L'ADMIN ====================
  const [tauxSatisfaction, setTauxSatisfaction] = useState<number>(94);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE}/histoire`);
        if (res.ok) {
          const data = await res.json();
          setTauxSatisfaction(data.taux_satisfaction || 94);
        }
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setCodeOffset(p => (p + 1) % CODE_LINES.length), 350);
    return () => clearInterval(iv);
  }, []);

  const renderStars = () => {
    const note = tauxSatisfaction / 20;
    return (
      <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar
            key={s}
            style={{
              color: s <= Math.round(note) ? "#F7B500" : "rgba(255,255,255,.3)",
              fontSize: 10,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:"#374151", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 16px)) rotate(45deg)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin-slow{to{transform:rotate(360deg)}}
        @keyframes dash{to{stroke-dashoffset:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .diamond{animation:floatY 7s ease-in-out infinite;position:absolute;pointer-events:none;}
        .live-dot{width:8px;height:8px;border-radius:50%;background:#10B981;animation:pulse 1.5s ease-in-out infinite;display:inline-block;flex-shrink:0;}
        .code-font{font-family:'Fira Code',monospace;font-size:12px;line-height:1.9;}
        .acc-bar{width:4px;border-radius:99px;background:#F7B500;flex-shrink:0;}
        .drop-item{display:flex;align-items:center;gap:10px;padding:9px 16px;color:#4B5563;text-decoration:none;font-size:13px;font-weight:600;transition:all .15s;}
        .drop-item:hover{background:#FFFBEB;color:#F7B500;}
        .nav-link-p{color:#4B5563;text-decoration:none;font-size:14px;font-weight:600;transition:color .2s;}
        .nav-link-p:hover{color:#F7B500;}
        .oc{background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:16px;padding:20px;transition:all .3s;text-decoration:none;display:block;}
        .oc:hover{transform:translateY(-5px);border-color:#F7B500;background:#fff;box-shadow:0 8px 24px rgba(247,181,0,.1);}
        .svc-card{background:#fff;border:1.5px solid #E5E7EB;border-radius:24px;padding:36px 28px;text-align:center;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:default;}
        .svc-card:hover{transform:translateY(-12px);box-shadow:0 32px 60px rgba(10,37,64,.14);border-color:rgba(247,181,0,.5);}
        .svc-card:hover .svc-icon{transform:scale(1.15) rotate(-5deg);}
        .svc-icon{transition:transform .3s cubic-bezier(.22,1,.36,1);}
        .step-card{background:#fff;border-radius:24px;padding:28px 22px;text-align:center;border:1.5px solid #E2E8F0;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer;position:relative;overflow:hidden;}
        .step-card:hover{transform:translateY(-8px);box-shadow:0 20px 48px rgba(10,37,64,.12);border-color:#F7B500;}
        .step-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(247,181,0,.08),transparent);opacity:0;transition:opacity .3s;}
        .step-card:hover::before{opacity:1;}
        .why-card{display:flex;gap:20px;align-items:flex-start;background:#F9FAFB;border-radius:20px;padding:24px 22px;border:1.5px solid #E5E7EB;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:default;}
        .why-card:hover{transform:translateX(8px);background:#fff;border-color:#F7B500;box-shadow:0 12px 32px rgba(247,181,0,.12);}
        .why-icon{flex-shrink:0;transition:transform .3s;}
        .why-card:hover .why-icon{transform:scale(1.15);}
        .proj-chip{background:#fff;border:1.5px solid #E2E8F0;border-radius:99px;padding:14px 24px;display:inline-flex;align-items:center;gap:10px;transition:all .3s;cursor:default;}
        .proj-chip:hover{border-color:#F7B500;transform:translateY(-4px);box-shadow:0 10px 24px rgba(247,181,0,.2);background:#FFFBEB;}
        .stat-card{text-align:center;padding:28px 20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:18px;transition:all .3s;}
        .stat-card:hover{background:rgba(255,255,255,.12);transform:translateY(-4px);}
        .btn-plat-gold:hover{background:#e6a800!important;transform:translateY(-3px)!important;box-shadow:0 8px 20px rgba(247,181,0,.3);}
        .btn-plat-dark:hover{background:#F7B500!important;color:#0A2540!important;transform:translateY(-3px)!important;}
        .shimmer-badge{background:linear-gradient(90deg,#F7B500,#fff8,#F7B500);background-size:200% 100%;animation:shimmer 2.5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;}
        .float-anim{animation:float 5s ease-in-out infinite;}
        .connector-line{stroke-dasharray:200;stroke-dashoffset:200;animation:dash 1.5s ease forwards;}
        .stat-number{font-size:28px;font-weight:900;color:#fff;line-height:1;margin-bottom:6px}
        .stat-loading{width:30px;height:30px;border:3px solid #F7B500;border-top-color:transparent;border-radius:50%;margin:0 auto;animation:spin .8s linear infinite}
      `}</style>

      {/* HEADER */}
      <header style={{ background:"#fff", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid #E5E7EB", boxShadow:"0 2px 14px rgba(0,0,0,.04)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:72, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="11" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.2"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontWeight:800, fontSize:18, color:"#0A2540", letterSpacing:"-0.3px" }}>
              Business <span style={{ color:"#F7B500" }}>Expert</span> Hub
            </span>
          </Link>
          <nav style={{ display:"flex", gap:22, alignItems:"center" }}>
            <Link href="/" className="nav-link-p">Accueil</Link>
            <Link href="/a-propos" className="nav-link-p">À propos</Link>
            <div style={{ position:"relative" }} onMouseEnter={()=>setNavOpen(true)} onMouseLeave={()=>setNavOpen(false)}>
              <span style={{ color:"#F7B500", fontWeight:700, fontSize:14, cursor:"pointer" }}>Services ▾</span>
              {navOpen && (
                <ul style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, listStyle:"none", padding:"6px 0", zIndex:200, minWidth:200, boxShadow:"0 12px 36px rgba(0,0,0,.1)", animation:"fadeSlideDown .2s ease" }}>
                  {NAV.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link-p">Experts</Link>
            <Link href="/blog" className="nav-link-p">Blog</Link>
            <Link href="/contact" className="nav-link-p">Contact</Link>
          </nav>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/connexion"><button style={{ border:"1.5px solid #0A2540", color:"#0A2540", background:"transparent", padding:"8px 20px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}>Connexion</button></Link>
            <Link href="/inscription-startup"><button style={{ background:"#F7B500", color:"#0A2540", border:"none", padding:"8px 20px", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>S'inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg,#0A1628 0%,#0d1f3c 55%,#0A1628 100%)",
        padding: "84px 24px 104px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="diamond" style={{ width:520, height:520, right:-140, top:"50%", background:"rgba(247,181,0,.04)", border:"1px solid rgba(247,181,0,.08)", borderRadius:24 }} />
        <div className="diamond" style={{ width:300, height:300, right:150, top:"25%", background:"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.08)", borderRadius:16, animationDelay:"-2s" }} />
        <div className="diamond" style={{ width:160, height:160, left:-40, bottom:"20%", background:"rgba(59,130,246,.04)", border:"1px solid rgba(59,130,246,.08)", borderRadius:10, animationDelay:"-4s" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:10 }}>
          <div style={{ fontSize:13, color:"rgba(226,232,240,.35)", marginBottom:28, display:"flex", alignItems:"center", gap:8 }}>
            <Link href="/" style={{ color:"rgba(226,232,240,.35)", textDecoration:"none" }}>Accueil</Link><span>›</span>
            <Link href="/services" style={{ color:"rgba(226,232,240,.35)", textDecoration:"none" }}>Services</Link><span>›</span>
            <span style={{ color:"#F7B500", fontWeight:600 }}>Nos Plateformes</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
            <div>
              <div style={{ animation:"heroIn .8s .08s both", display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
                <div style={{ width:58, height:58, borderRadius:16, background:"rgba(247,181,0,.12)", border:"1px solid rgba(247,181,0,.28)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <FaDesktop color="#F7B500" size={24} />
                </div>
              </div>
              <h1 style={{ animation:"heroIn .8s .18s both", fontWeight:900, fontSize:"clamp(20px,3vw,50px)", lineHeight:1.04, color:"#F1F5F9", margin:"0 0 20px" }}>
                Plateformes<br/><span style={{ color:"#F7B500" }}>personnalisées</span>
              </h1>
              <p style={{ animation:"heroIn .8s .32s both", fontSize:16.5, color:"rgba(226,232,240,.65)", lineHeight:1.88, marginBottom:36, maxWidth:500 }}>
                Nos plateformes regroupent des solutions digitales pratiques et modernes. Elles sont conçues pour être faciles à utiliser, performantes et adaptées aux besoins des utilisateurs.
              </p>
              <div style={{ animation:"heroIn .8s .46s both", display:"flex", gap:12, flexWrap:"wrap", marginBottom:32 }}>
                <Link href="/inscription-startup">
                  <button style={{ background:"#F7B500", color:"#0A2540", padding:"14px 28px", borderRadius:12, fontWeight:800, fontSize:15, border:"none", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}>
                    Réserver une démo <FaArrowRight size={13} />
                  </button>
                </Link>
                <Link href="/contact">
                  <button style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.16)", color:"#E2E8F0", padding:"14px 26px", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Pack à partir de 50 HT/mois
                  </button>
                </Link>
              </div>
              <div style={{ animation:"heroIn .8s .6s both", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[["7j","Essai gratuit"],[loadingStats ? "..." : `${tauxSatisfaction}%`,"Satisfaction"],["24/7","Support"]].map(([v,l]) => (
                  <div key={l} className="stat-card" style={{ textAlign:"center", padding:"16px 8px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14 }}>
                    <div className="stat-number" style={{ fontSize:20 }}>
                      {loadingStats && l === "Satisfaction" ? <div className="stat-loading" style={{ width:20, height:20 }} /> : v}
                    </div>
                    <div style={{ fontSize:10, color:"rgba(226,232,240,.6)", fontWeight:600, marginTop:5 }}>{l}</div>
                    {l === "Satisfaction" && !loadingStats && (
                      <div style={{ display:"flex", justifyContent:"center", marginTop:4 }}>{renderStars()}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ animation:"heroIn .9s .28s both" }}>
              <div style={{ background:"#0D1A2D", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,.4)" }}>
                <div style={{ background:"#0A1929", padding:"12px 16px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                  {["#FF5F57","#FFBC2E","#28C840"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
                  <span style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:"rgba(255,255,255,.3)" }}>dashboard.js — BEH Platform</span>
                </div>
                <div className="code-font" style={{ padding:18, height:248, overflow:"hidden", position:"relative" }}>
                  {CODE_LINES.slice(codeOffset, codeOffset+9).concat(CODE_LINES.slice(0, Math.max(0,9-(CODE_LINES.length-codeOffset)))).map((line,i) => (
                    <div key={i} style={{ marginBottom:2, opacity: i === 0 || i === 8 ? 0.3 : 1 }}>
                      <span style={{ color:"rgba(255,255,255,.18)", marginRight:14, display:"inline-block", minWidth:20, textAlign:"right" }}>{line.ln}</span>
                      {line.parts.map((p,pi) => <span key={pi} style={{ color: COLOR_MAP[p.t] || "#ABB2BF" }}>{p.v}</span>)}
                    </div>
                  ))}
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, background:"linear-gradient(transparent,#0D1A2D)", pointerEvents:"none" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOS SERVICES */}
      <section style={{ background:"#F8FAFC", padding:"96px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeUp>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <h2 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,42px)", color:"#0A2540", lineHeight:1.15, marginBottom:16 }}>
                Nos <span style={{ color:"#F7B500" }}>services</span>
              </h2>
              <p style={{ fontSize:16, color:"#64748B", maxWidth:720, margin:"0 auto", lineHeight:1.7 }}>
                Des solutions digitales performantes, intuitives et parfaitement adaptées à vos besoins
              </p>
            </div>
          </FadeUp>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
            {[
              { icon:<FaDesktop size={32}/>, color:"#F7B500", bg:"#FEF3C7", title:"Développement Web", desc:"Des applications web pour les entreprises." },
              { icon:<FaMobileAlt size={32}/>, color:"#3B82F6", bg:"#DBEAFE", title:"Applications Mobiles", desc:"Des applications mobiles incluses sur tous les supports." },
              { icon:<FaCogs size={32}/>, color:"#10B981", bg:"#D1FAE5", title:"Solutions Personnalisées", desc:"Des solutions sur mesure pour répondre à vos besoins spécifiques." },
            ].map((card,i)=>(
              <ScaleIn key={i} delay={i*.12}>
                <div className="svc-card">
                  <div style={{ width:76, height:76, borderRadius:"50%", background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", color:card.color }}>
                    <span className="svc-icon">{card.icon}</span>
                  </div>
                  <h3 style={{ fontSize:22, fontWeight:800, color:"#0A2540", marginBottom:14 }}>{card.title}</h3>
                  <p style={{ color:"#6B7280", fontSize:14, lineHeight:1.7 }}>{card.desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* NOS PLATEFORMES */}
      <section style={{ background:"#fff", padding:"80px 0 0" }}>
        <FadeUp>
          <div style={{ textAlign:"center", padding:"0 24px 52px" }}>
            <h2 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,46px)", color:"#0A2540", letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:14 }}>
              Nos <span style={{ color:"#F7B500" }}>Plateformes</span> personnalisées
            </h2>
          </div>
        </FadeUp>
      </section>

      <section style={{ background:"#fff", padding:"0 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <PlatformBlock num="01" badge="ERP Expert" badgeBg="#F7B500" badgeText="#0A2540" title="Gestion ERP & Ressources"
            problems={["Données éparpillées entre plusieurs outils non connectés","Absence de vue globale sur l'activité financière","Processus comptables et RH entièrement manuels","Impossibilité de suivre le stock en temps réel"]}
            results={["Centralisation complète : ventes, stock, RH, compta","Réduction de 60% du temps de traitement administratif","Tableaux de bord financiers automatiques en temps réel","Productivité globale augmentée de 45% dès le 1er mois"]}
            screens={[{label:"Dashboard",icon:"📊",comp:<ScreenERPMain/>,description:"Vue d'ensemble KPI et activités temps réel"},{label:"Produits",icon:"📦",comp:<ScreenERPList/>,description:"Catalogue produits, stocks et fournisseurs"},{label:"Statistiques",icon:"📈",comp:<ScreenERPStats/>,description:"Rapports financiers et indicateurs mensuels"}]}
            accentColor="#F7B500" reverse={false}/>

          <PlatformBlock num="02" badge="CRM Expert" badgeBg="#0A2540" badgeText="#fff" title="CRM & Relation Client"
            problems={["Suivi client non structuré et données perdues","Absence d'archivage automatique des séances","Objectifs commerciaux jamais suivis ni mesurés","Perte d'opportunités faute de relance"]}
            results={["+40% de fidélisation grâce au suivi automatisé","Archivage complet des clients et historiques 24/7","Tableau de bord objectifs mis à jour en temps réel","+25% de ventes grâce aux alertes de relance"]}
            screens={[{label:"Dashboard",icon:"🏠",comp:<ScreenCRMMain/>,description:"Vue globale des clients et activités"},{label:"Objectifs",icon:"🎯",comp:<ScreenCRMObjectifs/>,description:"Progression des objectifs commerciaux"},{label:"KPI Live",icon:"⚡",comp:<ScreenCRMKPI/>,description:"Indicateurs de performance en temps réel"}]}
            accentColor="#3B82F6" reverse={true}/>

          <PlatformBlock num="03" badge="Projets Expert" badgeBg="#F7B500" badgeText="#0A2540" title="Gestion de Projets & Équipes"
            problems={["Suivi de projet inefficace, tâches perdues dans les emails","Communication d'équipe dispersée sur plusieurs canaux","Délais non respectés et livrables non documentés","Aucune visibilité sur l'avancement des missions"]}
            results={["Livraison des projets avec 30% de délai en moins","Communication centralisée dans un seul espace","Taux de satisfaction équipes augmenté de +50%","Reporting automatique hebdomadaire dirigeants"]}
            screens={[{label:"Kanban",icon:"🗂️",comp:<ScreenGestionMain/>,description:"Organisation visuelle des tâches par statut"},{label:"Planning",icon:"📅",comp:<ScreenGestionTimeline/>,description:"Chronologie Gantt des projets et jalons"},{label:"Analyses",icon:"📊",comp:<ScreenGestionStats/>,description:"Mesures de performance et livraisons"}]}
            accentColor="#10B981" reverse={false}/>
        </div>
      </section>

      {/* POURQUOI NOUS CHOISIR */}
      <section style={{ background:"#0A2540", padding:"100px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(247,181,0,.035) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }}/>
        <div className="diamond" style={{ width:400, height:400, right:-80, top:"50%", background:"rgba(247,181,0,.04)", border:"1px solid rgba(247,181,0,.07)", borderRadius:20, animationDelay:"-1s" }}/>
        <div className="diamond" style={{ width:220, height:220, left:-40, bottom:"20%", background:"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.07)", borderRadius:12, animationDelay:"-3s" }}/>

        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:10 }}>
          <FadeUp>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <h2 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,42px)", color:"#fff", lineHeight:1.15, marginBottom:14 }}>
                Pourquoi nous <span style={{ color:"#F7B500" }}>choisir ?</span>
              </h2>
            </div>
          </FadeUp>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:40 }}>
            {[
              { icon:<FaUserTie size={24}/>, color:"#F7B500", bg:"rgba(247,181,0,.15)", title:"Équipes qualifiées et certifiées", desc:"Une équipe expérimentée dans chaque domaine métier, certifiée et réactive.", stat:"42+", statLbl:"experts", delay:0 },
              { icon:<FaChartBar size={24}/>, color:"#3B82F6", bg:"rgba(59,130,246,.15)", title:"Études personnalisées et indépendantes", desc:"Des études indépendantes basées sur des données terrain précises.", stat:"98%", statLbl:"clients satisfaits", delay:.08 },
              { icon:<FaShieldAlt size={24}/>, color:"#10B981", bg:"rgba(16,185,129,.15)", title:"Audit rigoureux à chaque phase", desc:"Un audit rigoureux à chaque phase : conception, déploiement et maintenance.", stat:"100%", statLbl:"conformité", delay:.16 },
              { icon:<FaHeadset size={24}/>, color:"#8B5CF6", bg:"rgba(139,92,246,.15)", title:"Support et communication dédiés", desc:"Échangez avec nos équipes en temps réel via un canal dédié.", stat:"24/7", statLbl:"support", delay:.24 },
            ].map((item,i)=>(
              <SlideIn key={i} delay={item.delay} from={i%2===0?"left":"right"}>
                <div className="why-card" style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <div className="why-icon" style={{ width:56, height:56, background:item.bg, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", color:item.color }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontWeight:800, fontSize:17, color:"#fff", marginBottom:10 }}>{item.title}</h3>
                    <p style={{ color:"rgba(255,255,255,.5)", fontSize:13.5, lineHeight:1.7, marginBottom:14 }}>{item.desc}</p>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${item.color}15`, border:`1px solid ${item.color}30`, borderRadius:99, padding:"5px 14px" }}>
                      <span style={{ fontWeight:900, fontSize:17, color:item.color }}>{item.stat}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontWeight:500 }}>{item.statLbl}</span>
                    </div>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ background:"linear-gradient(180deg,#F8FAFC 0%,#fff 100%)", padding:"100px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeUp>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <h2 style={{ fontWeight:900, fontSize:"clamp(28px,4vw,42px)", color:"#0A2540", lineHeight:1.15, marginBottom:14 }}>Comment <span style={{ color:"#F7B500" }}>ça</span> marche ?</h2>
            </div>
          </FadeUp>

          <div style={{ position:"relative" }}>
            <FadeUp>
              <div style={{ position:"absolute", top:44, left:"12.5%", right:"12.5%", height:2, background:"linear-gradient(90deg,#F7B50000,#F7B500,#10B98180,#3B82F680,#0A254080,#F7B500)", borderRadius:2, zIndex:0 }}/>
            </FadeUp>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, position:"relative", zIndex:1 }}>
              {[
                { step:1, icon:"", color:"#F7B500", title:"Demande initiale", desc:"Remplissez notre formulaire de demande de devis en quelques minutes.", delay:0 },
                { step:2, icon:"", color:"#3B82F6", title:"Analyse par notre équipe", desc:"Nos experts étudient votre projet, vos contraintes et vous proposent une architecture adaptée.", delay:.1 },
                { step:3, icon:"", color:"#10B981", title:"Proposition & devis", desc:"Vous recevez un plan détaillé, les prévisionnels de délais et un devis transparent.", delay:.2 },
                { step:4, icon:"", color:"#0A2540", title:"Lancement du projet", desc:"Après validation, nous lançons votre projet en mode agile avec des livraisons régulières.", delay:.3 },
              ].map((s)=>(
                <FadeUp key={s.step} delay={s.delay}>
                  <div
                    className="step-card"
                    onClick={()=>setActiveStep(activeStep===s.step?null:s.step)}
                    style={{ borderColor: activeStep===s.step ? s.color : undefined }}
                  >
                    <div style={{ width:52, height:52, background:s.step===1?"#F7B500":s.step===2?"#EFF6FF":s.step===3?"#ECFDF5":"#0A2540", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", border:`3px solid ${s.color}`, boxShadow:`0 0 0 4px ${s.color}18` }}>
                      <span style={{ fontWeight:900, fontSize:18, color:s.step===1?"#0A2540":s.step===4?"#F7B500":s.color }}>{s.step}</span>
                    </div>
                    <h3 style={{ fontWeight:800, fontSize:16, color:"#0A2540", marginBottom:10 }}>{s.title}</h3>
                    <p style={{ color:"#6B7280", fontSize:13, lineHeight:1.65 }}>{s.desc}</p>
                    {activeStep === s.step && (
                      <div style={{ marginTop:16, background:`${s.color}10`, border:`1px solid ${s.color}30`, borderRadius:10, padding:"10px 12px", fontSize:12, color:s.color, fontWeight:600 }}>
                        {s.step===1 && "Formulaire disponible en ligne — réponse sous 2h"}
                        {s.step===2 && "Appel de découverte gratuit de 30 min inclus"}
                        {s.step===3 && "Devis détaillé avec jalons et livrables clairement définis"}
                        {s.step===4 && "Sprint de 2 semaines avec démo à chaque livraison"}
                      </div>
                    )}
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AUTRES SERVICES */}
      <section style={{ background:"#fff", padding:"0 24px 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <FadeUp>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, paddingTop:60 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div className="acc-bar" style={{ height:28 }}/>
              </div>
              <Link href="/services" style={{ display:"flex", alignItems:"center", gap:6, fontWeight:700, fontSize:13.5, color:"#F7B500", textDecoration:"none" }}>
                <FaArrowLeft size={10}/> Tous les services
              </Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
              {[
                { slug:"audit-sur-site", icon:<FaSearchPlus/>, color:"#3B82F6", title:"Audit sur site", badge:"Terrain", desc:"Diagnostic complet de vos processus directement sur site." },
                { slug:"consulting",     icon:<FaChartLine/>,   color:"#8B5CF6", title:"Consulting",    badge:"Stratégie", desc:"Structurez, optimisez et accélérez la croissance de votre entreprise." },
                { slug:"formations",     icon:<FaGraduationCap/>, color:"#F7B500", title:"Formations", badge:"Certif.", desc:"Montez en compétence avec nos formations certifiantes." },
              ].map((s,i)=>(
                <Link key={i} href={`/services/${s.slug}`} className="oc">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ width:48, height:48, borderRadius:13, background:`${s.color}15`, color:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
                    <span style={{ background:`${s.color}14`, color:s.color, fontSize:10.5, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"1px", padding:"4px 12px", borderRadius:99 }}>{s.badge}</span>
                  </div>
                  <div style={{ fontWeight:800, color:"#0A2540", fontSize:16, marginBottom:8 }}>{s.title}</div>
                  <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.65, marginBottom:14 }}>{s.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:s.color, fontWeight:700, fontSize:13.5 }}>Découvrir <FaArrowRight size={10}/></div>
                </Link>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#0A2540", color:"#fff", padding:"32px", textAlign:"center", borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <p style={{ margin:"0 0 6px", fontSize:13, color:"rgba(255,255,255,.65)" }}>© 2026 Business Expert Hub</p>
      </footer>
    </div>
  );
}