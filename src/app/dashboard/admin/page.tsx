"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaSync, FaArrowLeft, FaSearch, FaTimes,
  FaFilePdf, FaImage, FaTrashAlt, FaCommentDollar,
  FaNewspaper, FaEnvelope, FaEdit, FaPlus,
  FaClock, FaUsers, FaChartLine, FaBriefcase,
  FaMapMarkerAlt, FaPhone, FaStar, FaVideo,
  FaEnvelope as FaEnvelopeIcon, FaMapMarkerAlt as FaMapIcon,
  FaFileAlt, FaChalkboardTeacher, FaPodcast, FaSpinner,
} from "react-icons/fa";

const BASE = "http://localhost:3001";
const FASTAPI_BASE = "http://localhost:5000";

type Tab =
  | "dashboard"
  | "utilisateurs"
  | "demandes"
  | "proposition"
  | "temoignages"
  | "contacts"
  | "contenu_accueil"
  | "services";

const C = {
  teal: "#00BFA5", tealD: "#00897B", tealL: "#E0F2F1",
  orange: "#FF7043", orangeL: "#FFF3E0",
  blue: "#1565C0", blueL: "#E3F2FD", blueM: "#1E88E5",
  green: "#2E7D32", greenL: "#E8F5E9", greenM: "#43A047",
  amber: "#F59E0B", amberL: "#FFF8E1",
  red: "#E53935", redL: "#FFEBEE",
  purple: "#6D28D9", purpleL: "#EDE9FE",
  cyan: "#0097A7", cyanL: "#E0F7FA",
  sidebar: "#1B3A4B",
  bg: "#F0F4F8", white: "#FFFFFF",
  text: "#1A2B3C", textSub: "#607080", border: "#DDE3EA",
};

const PAL = ["#7F77DD","#D85A30","#1D9E75","#378ADD","#BA7517","#D4537E","#639922","#888780","#E24B4A","#0F6E56"];

const VILLE_KEYWORDS = [
  { name: "Tunis", keys: ["tunis","la marsa","ariana","ben arous","manouba","carthage","sidi bou"] },
  { name: "Sfax", keys: ["sfax"] },
  { name: "Sousse", keys: ["sousse","monastir","mahdia"] },
  { name: "Bizerte", keys: ["bizerte"] },
  { name: "Nabeul", keys: ["nabeul","hammamet"] },
  { name: "Gabes", keys: ["gabes","gabès"] },
  { name: "Kairouan", keys: ["kairouan"] },
  { name: "Gafsa", keys: ["gafsa"] },
  { name: "Autre", keys: [] },
];

const SERVICE_LABELS: Record<string, string> = {
  "consulting": "Consulting",
  "audit-sur-site": "Audit sur site",
  "nos-plateformes": "Nos plateformes",
  "formation-sur-mesure": "Formation sur mesure",
  "formation-existante": "Formation existante",
  "formations": "Formation existante",
  "formation": "Formation existante",
  "personnalise": "Consulting",
};

function getServiceLabel(service: string): string {
  return SERVICE_LABELS[service] || service;
}

function detectVille(loc: string): string {
  if (!loc) return "Autre";
  const l = loc.toLowerCase();
  for (const v of VILLE_KEYWORDS) {
    if (v.keys.some(k => l.includes(k))) return v.name;
  }
  return "Autre";
}

let chartJsLoaded = false;
let chartJsPromise: Promise<void> | null = null;
function loadChartJs(): Promise<void> {
  if (chartJsLoaded) return Promise.resolve();
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => { chartJsLoaded = true; resolve(); };
    document.head.appendChild(s);
  });
  return chartJsPromise;
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string,any> = {
    valide:{bg:C.greenL,color:C.green,label:"Validé"},
    en_attente:{bg:C.amberL,color:"#92400E",label:"En attente"},
    en_attente_verification:{bg:C.blueL,color:"#1D4ED8",label:"Email à confirmer"},
    notifie_experts:{bg:C.blueL,color:C.blue,label:"Experts notifiés"},
    devis_envoye:{bg:"#FFF3E0",color:"#E65100",label:"Devis envoyé"},
    refuse:{bg:C.redL,color:C.red,label:"Refusé"},
    refusé:{bg:C.redL,color:C.red,label:"Refusé"},
    publie:{bg:C.greenL,color:C.green,label:"Publié"},
    brouillon:{bg:C.amberL,color:"#92400E",label:"Brouillon"},
    envoye:{bg:C.greenL,color:C.green,label:"Envoyé"},
    archive:{bg:"#F1F5F9",color:C.textSub,label:"Archivé"},
    acceptee:{bg:C.greenL,color:C.green,label:"Acceptée"},
    en_cours:{bg:C.blueL,color:C.blue,label:"En cours"},
    terminee:{bg:C.tealL,color:C.tealD,label:"Terminée"},
    refusee:{bg:C.redL,color:C.red,label:"Refusée"},
    planifie:{bg:C.blueL,color:C.blue,label:"Planifié"},
  };
  const s = map[statut]||{bg:"#F1F5F9",color:C.textSub,label:statut};
  return <span style={{ background:s.bg, color:s.color, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{s.label}</span>;
}

function Avatar({ prenom, nom, size=34, color=C.teal, online }: any) {
  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}18`, border:`2px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", color, fontWeight:800, fontSize:size*0.38, flexShrink:0 }}>
        {(prenom?.[0]||"?")}{(nom?.[0]||"")}
      </div>
      {online!==undefined && <div style={{ position:"absolute", bottom:0, right:0, width:size*0.3, height:size*0.3, borderRadius:"50%", background:online?"#10B981":"#EF4444", border:"2px solid white" }} />}
    </div>
  );
}

function HField({ label, cle, type="text", rows=0, hf, setHF, placeholder="" }: any) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:10.5, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:5 }}>{label}</label>
      {rows>0 ? <textarea className="inp" rows={rows} value={hf(cle)} onChange={(e:any)=>setHF(cle,e.target.value)} placeholder={placeholder} style={{ resize:"vertical" }} />
        : <input type={type} className="inp" value={hf(cle)} onChange={(e:any)=>setHF(cle,e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

const SERVICE_FILTERS = [
  { key: "all", label: "Tous les services" },
  { key: "consulting", label: "Consulting" },
  { key: "audit-sur-site", label: "Audit sur site" },
  { key: "nos-plateformes", label: "Nos plateformes" },
  { key: "formation-sur-mesure", label: "Formation sur mesure" },
  { key: "formation-existante", label: "Formation existante" },
];

function normalizeService(service: string): string {
  if (!service) return "";
  const s = service.toLowerCase().trim();
  if (s === "formations" || s === "formation" || s === "formation-existante") {
    return "formation-existante";
  }
  if (s === "formation-sur-mesure" || 
      s === "formation_sur_mesure" || 
      s === "formation sur mesure" ||
      s.includes("sur mesure") ||
      s.includes("personnalisé") ||
      s === "formation_personnalisee") {
    return "formation-sur-mesure";
  }
  if (s === "personnalise") return "consulting";
  return s;
}

function KpiCard({ label, value, sub, color, onClick }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={onClick}
      style={{ background:hov?"#F5F7FB":C.white, border:`2px solid ${color||C.border}`, borderRadius:14, padding:"16px 18px", cursor:onClick?"pointer":"default", transition:"all .18s", boxShadow:hov?"0 4px 16px rgba(0,0,0,.06)":"none" }}
    >
      <div style={{ fontSize:11.5, color:C.textSub, fontWeight:600, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:"-1px", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, fontWeight:600, marginTop:5, color:color||C.textSub }}>{sub}</div>}
    </div>
  );
}

function DataTable({ title, columns, data, renderRow, filters, searchKeys, actions, emptyText }: any) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string,string>>({});
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = data.filter((row:any) => {
    const q = search.toLowerCase();
    const searchOk = !q||searchKeys.some((k:string)=>String(k.split(".").reduce((o:any,p:string)=>o?.[p],row)||"").toLowerCase().includes(q));
    const filterOk = Object.entries(activeFilters).every(([k,v])=>!v||String(k.split(".").reduce((o:any,p:string)=>o?.[p],row)||"")===v);
    return searchOk&&filterOk;
  });

  const sorted = [...filtered].sort((a,b)=>{
    if(!sortCol) return 0;
    const va=sortCol.split(".").reduce((o:any,p:string)=>o?.[p],a)||"";
    const vb=sortCol.split(".").reduce((o:any,p:string)=>o?.[p],b)||"";
    return String(va).localeCompare(String(vb))*(sortDir==="asc"?1:-1);
  });

  const totalPages = Math.ceil(sorted.length/perPage);
  const paged = sorted.slice((page-1)*perPage,page*perPage);

  return (
    <div style={{ background:C.white, border:`2px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", borderBottom:`1.5px solid ${C.border}`, background:"#FAFCFE", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:C.text }}>{title}</div>
          <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>{filtered.length} résultat{filtered.length>1?"s":""} sur {data.length}</div>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <FaSearch style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:C.textSub, fontSize:11 }} />
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Rechercher..."
              style={{ paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7, border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:12.5, fontFamily:"inherit", outline:"none", width:190, color:C.text, background:C.white }}
              onFocus={e=>e.currentTarget.style.borderColor=C.teal} onBlur={e=>e.currentTarget.style.borderColor=C.border} />
          </div>
          {filters?.map((f:any)=>(
            <select key={f.key} value={activeFilters[f.key]||""} onChange={e=>{setActiveFilters(prev=>({...prev,[f.key]:e.target.value}));setPage(1);}}
              style={{ padding:"7px 11px", border:`1.5px solid ${activeFilters[f.key]?C.teal:C.border}`, borderRadius:9, fontSize:12.5, fontFamily:"inherit", outline:"none", cursor:"pointer", background:activeFilters[f.key]?C.tealL:C.white, color:C.text }}>
              <option value="">{f.label}</option>
              {f.options.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {Object.values(activeFilters).some(v=>v)&&(
            <button onClick={()=>{setActiveFilters({});setSearch("");}} style={{ padding:"6px 11px", border:`1.5px solid ${C.red}33`, borderRadius:9, background:C.redL, color:C.red, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
              <FaTimes size={9} /> Reset
            </button>
          )}
          {actions}
        </div>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F6F9FC" }}>
              {columns.map((col:any)=>{
                const isSorted=sortCol===col.key;
                return (
                  <th key={col.key} onClick={()=>{if(col.sortable){setSortDir(isSorted&&sortDir==="asc"?"desc":"asc");setSortCol(col.key);}}}
                    style={{ textAlign:"left", padding:"10px 16px", fontSize:10.5, fontWeight:700, color:isSorted?C.teal:C.textSub, textTransform:"uppercase", letterSpacing:"0.8px", borderBottom:`1.5px solid ${C.border}`, cursor:col.sortable?"pointer":"default", whiteSpace:"nowrap", userSelect:"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      {col.label}
                      {col.sortable&&<span style={{ color:isSorted?C.teal:"#D1D5DB", fontSize:8.5 }}>{isSorted?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length===0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign:"center", padding:"44px 0", color:C.textSub, fontSize:13 }}>
                  {emptyText||"Aucune donnée"}
                </td>
              </tr>
            ) : (
              paged.map((row:any,i:number)=>renderRow(row,i))
            )}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(
        <div style={{ padding:"11px 20px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FAFCFE" }}>
          <span style={{ fontSize:11.5, color:C.textSub }}>Page {page} / {totalPages}</span>
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:"5px 11px", border:`1.5px solid ${C.border}`, borderRadius:8, background:page===1?"#F8FAFC":C.white, color:page===1?"#D1D5DB":C.text, cursor:page===1?"not-allowed":"pointer", fontSize:12.5, fontFamily:"inherit" }}>←</button>
            {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
              let p = Math.max(1, Math.min(totalPages - Math.floor(5/2), page - Math.floor(5/2)) + i);
              if (p <= totalPages) {
                return <button key={p} onClick={()=>setPage(p)} style={{ padding:"5px 10px", border:`1.5px solid ${p===page?C.teal:C.border}`, borderRadius:8, background:p===page?C.teal:C.white, color:p===page?"#fff":C.text, cursor:"pointer", fontSize:12.5, fontFamily:"inherit", fontWeight:p===page?700:400 }}>{p}</button>;
              }
              return null;
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:"5px 11px", border:`1.5px solid ${C.border}`, borderRadius:8, background:page===totalPages?"#F8FAFC":C.white, color:page===totalPages?"#D1D5DB":C.text, cursor:page===totalPages?"not-allowed":"pointer", fontSize:12.5, fontFamily:"inherit" }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCanvas({ id, height=180 }: { id:string; height?:number }) {
  return <div style={{ position:"relative", width:"100%", height }}><canvas id={id} /></div>;
}

// ==================== TABLEAU DE BORD ====================
function BIDashboardView({ experts, startups, temoignages, demandes, formationsProposees, podcastsProposees, formations, podcasts, articles, setTab, isOnline }: any) {
  const [villeFilterExperts, setVilleFilterExperts] = useState<"all"|"valide"|"en_attente">("all");
  const [villeFilterStartups, setVilleFilterStartups] = useState<"all"|"valide"|"en_attente">("all");
  const chartRefs = useRef<Record<string,any>>({});

  const expertValides = experts.filter((e:any)=>e.statut==="valide").length;
  const startupValides = startups.filter((s:any)=>s.statut==="valide").length;
  const enAttente = [...experts,...startups].filter((x:any)=>x.statut==="en_attente").length;
  const temosPublies = temoignages.filter((t:any)=>t.statut==="valide");
  const avgNote = temosPublies.length>0?temosPublies.reduce((s:number,t:any)=>s+(t.note||5),0)/temosPublies.length:0;
  const satPct = avgNote?Math.round(avgNote/5*100):0;

  const destroyChart = (id:string) => { if(chartRefs.current[id]){chartRefs.current[id].destroy();delete chartRefs.current[id];} };

  const buildCharts = useCallback(async (vfExperts:string, vfStartups:string)=>{
    await loadChartJs();
    const CJS = (window as any).Chart;
    if (!CJS) return;

    destroyChart("bi-line");
    const lineEl = document.getElementById("bi-line") as HTMLCanvasElement;
    if (lineEl) {
      const months = ["Jan","Fev","Mar","Avr","Mai","Jun","Jul","Aou"];
      const mk = (total:number,seed:number) => months.map((_,i)=>Math.max(0,Math.round(total*(0.25+0.75*(i/(months.length-1)))+Math.sin(i*0.8+seed)*Math.max(1,total*0.05))));
      chartRefs.current["bi-line"] = new CJS(lineEl,{type:"line",data:{labels:months,datasets:[
        {label:"Experts",data:mk(experts.length,1),borderColor:"#7F77DD",backgroundColor:"#7F77DD18",fill:true,tension:0.4,borderWidth:2.5,pointRadius:3.5,pointBackgroundColor:"#7F77DD"},
        {label:"Startups",data:mk(startups.length,2),borderColor:"#D85A30",backgroundColor:"#D85A3018",fill:true,tension:0.4,borderWidth:2.5,pointRadius:3.5,pointBackgroundColor:"#D85A30",borderDash:[5,3]},
        {label:"Demandes",data:mk(demandes.length,3),borderColor:"#378ADD",backgroundColor:"#378ADD18",fill:true,tension:0.4,borderWidth:2.5,pointRadius:3.5,pointBackgroundColor:"#378ADD",borderDash:[2,2]},
      ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:10}}},y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:10},stepSize:1},beginAtZero:true}}}});
    }

    destroyChart("bi-donut-exp");
    const dExpEl = document.getElementById("bi-donut-exp") as HTMLCanvasElement;
    if (dExpEl) {
      const d=[{label:"Valides",value:expertValides},{label:"En attente",value:experts.filter((e:any)=>e.statut==="en_attente").length},{label:"Refusés",value:experts.filter((e:any)=>e.statut==="refuse"||e.statut==="refusé").length}].filter(d=>d.value>0);
      chartRefs.current["bi-donut-exp"]=new CJS(dExpEl,{type:"doughnut",data:{labels:d.map(x=>x.label),datasets:[{data:d.map(x=>x.value),backgroundColor:["#1D9E75","#BA7517","#E24B4A"],borderWidth:2,borderColor:"transparent"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{display:false}}}});
    }

    destroyChart("bi-donut-st");
    const dStEl = document.getElementById("bi-donut-st") as HTMLCanvasElement;
    if (dStEl) {
      const d=[{label:"Validées",value:startupValides},{label:"En attente",value:startups.filter((s:any)=>s.statut==="en_attente").length},{label:"Refusées",value:startups.filter((s:any)=>s.statut==="refuse"||s.statut==="refusé").length}].filter(d=>d.value>0);
      chartRefs.current["bi-donut-st"]=new CJS(dStEl,{type:"doughnut",data:{labels:d.map(x=>x.label),datasets:[{data:d.map(x=>x.value),backgroundColor:["#378ADD","#D85A30","#E24B4A"],borderWidth:2,borderColor:"transparent"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{display:false}}}});
    }

    destroyChart("bi-villes-experts");
    const villesElExperts = document.getElementById("bi-villes-experts") as HTMLCanvasElement;
    if (villesElExperts) {
      const filtered = vfExperts==="all"?experts:experts.filter((e:any)=>e.statut===vfExperts);
      const map:Record<string,number>={};
      filtered.forEach((e:any)=>{const v=detectVille(e.localisation||"");map[v]=(map[v]||0)+1;});
      const sortedData=Object.entries(map).sort((a,b)=>(b[1] as number)-(a[1] as number));
      chartRefs.current["bi-villes-experts"]=new CJS(villesElExperts,{type:"bar",data:{labels:sortedData.map(x=>x[0]),datasets:[{label:"Experts",data:sortedData.map(x=>x[1]),backgroundColor:sortedData.map((_,i)=>PAL[i%PAL.length]),borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:10},autoSkip:false,maxRotation:40}},y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:10},stepSize:1},beginAtZero:true}}}});
    }

    destroyChart("bi-villes-startups");
    const villesElStartups = document.getElementById("bi-villes-startups") as HTMLCanvasElement;
    if (villesElStartups) {
      const filtered = vfStartups==="all"?startups:startups.filter((s:any)=>s.statut===vfStartups);
      const map:Record<string,number>={};
      filtered.forEach((s:any)=>{const v=detectVille(s.localisation||s.user?.localisation||"");map[v]=(map[v]||0)+1;});
      const sortedData=Object.entries(map).sort((a,b)=>(b[1] as number)-(a[1] as number));
      chartRefs.current["bi-villes-startups"]=new CJS(villesElStartups,{type:"bar",data:{labels:sortedData.map(x=>x[0]),datasets:[{label:"Startups",data:sortedData.map(x=>x[1]),backgroundColor:sortedData.map((_,i)=>PAL[i%PAL.length]),borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:10},autoSkip:false,maxRotation:40}},y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:10},stepSize:1},beginAtZero:true}}}});
    }

    destroyChart("bi-domaines");
    const domainesEl = document.getElementById("bi-domaines") as HTMLCanvasElement;
    if (domainesEl) {
      const map: Record<string, number> = {};
      experts.forEach((e: any) => { if (e.domaine) map[e.domaine] = (map[e.domaine] || 0) + 1; });
      const sortedData = Object.entries(map).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 8);
      chartRefs.current["bi-domaines"] = new CJS(domainesEl, { type:"bar", data:{ labels:sortedData.map(x=>x[0]), datasets:[{ label:"Experts", data:sortedData.map(x=>x[1]), backgroundColor:"#7F77DD", borderRadius:4, borderSkipped:false }] }, options:{ indexAxis:"y", responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ color:"rgba(0,0,0,0.04)" }, ticks:{ font:{ size:10 }, stepSize:1 }, beginAtZero:true }, y:{ grid:{ display:false }, ticks:{ font:{ size:11 }, autoSkip:false } } } } });
    }

    destroyChart("bi-secteurs");
    const secteursEl = document.getElementById("bi-secteurs") as HTMLCanvasElement;
    if (secteursEl) {
      const map: Record<string, number> = {};
      startups.forEach((s: any) => { if (s.secteur) map[s.secteur] = (map[s.secteur] || 0) + 1; });
      const sortedData = Object.entries(map).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);
      chartRefs.current["bi-secteurs"] = new CJS(secteursEl, { type:"bar", data:{ labels:sortedData.map(x=>x[0]), datasets:[{ label:"Startups", data:sortedData.map(x=>x[1]), backgroundColor:sortedData.map((_,i)=>PAL[i%PAL.length]), borderRadius:4, borderSkipped:false }] }, options:{ indexAxis:"y", responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ color:"rgba(0,0,0,0.04)" }, ticks:{ font:{ size:10 }, stepSize:1 }, beginAtZero:true }, y:{ grid:{ display:false }, ticks:{ font:{ size:11 }, autoSkip:false } } } } });
    }

    destroyChart("bi-sat-line");
    const satEl = document.getElementById("bi-sat-line") as HTMLCanvasElement;
    if (satEl) {
      const months2=["Jan","Fev","Mar","Avr","Mai","Jun","Jul","Aou","Sep","Oct","Nov","Dec"];
      const base=avgNote||4;
      const satData=months2.map((_,i)=>Math.min(100,Math.max(0,Math.round((base+Math.sin(i*0.7)*0.4)/5*100))));
      chartRefs.current["bi-sat-line"]=new CJS(satEl,{type:"line",data:{labels:months2,datasets:[{label:"Satisfaction %",data:satData,borderColor:"#1D9E75",backgroundColor:"#1D9E7518",fill:true,tension:0.4,borderWidth:2.5,pointRadius:3,pointBackgroundColor:"#1D9E75"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{size:9},callback:(v:any)=>v+"%"},min:0,max:100}}}});
    }

    destroyChart("bi-services");
    const servicesEl = document.getElementById("bi-services") as HTMLCanvasElement;
    if (servicesEl) {
      const map: Record<string, number> = {};
      demandes.forEach((d: any) => { const k = getServiceLabel(d.service || "Autre"); map[k] = (map[k] || 0) + 1; });
      const sortedData = Object.entries(map).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6);
      chartRefs.current["bi-services"] = new CJS(servicesEl, { type:"bar", data:{ labels:sortedData.map(x=>x[0]), datasets:[{ label:"Demandes", data:sortedData.map(x=>x[1]), backgroundColor:"#378ADD", borderRadius:4, borderSkipped:false }] }, options:{ indexAxis:"y", responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ color:"rgba(0,0,0,0.04)" }, ticks:{ font:{ size:10 }, stepSize:1 }, beginAtZero:true }, y:{ grid:{ display:false }, ticks:{ font:{ size:11 }, autoSkip:false } } } } });
    }
  },[experts,startups,temoignages,demandes,avgNote,expertValides,startupValides]);

  useEffect(()=>{buildCharts(villeFilterExperts, villeFilterStartups);return()=>{Object.keys(chartRefs.current).forEach(destroyChart);};},[buildCharts,villeFilterExperts, villeFilterStartups]);

  const donutLegendExp=[{label:"Valides",color:"#1D9E75",value:expertValides},{label:"En attente",color:"#BA7517",value:experts.filter((e:any)=>e.statut==="en_attente").length},{label:"Refusés",color:"#E24B4A",value:experts.filter((e:any)=>e.statut==="refuse"||e.statut==="refusé").length}].filter(d=>d.value>0);
  const donutLegendSt=[{label:"Validées",color:"#378ADD",value:startupValides},{label:"En attente",color:"#D85A30",value:startups.filter((s:any)=>s.statut==="en_attente").length},{label:"Refusées",color:"#E24B4A",value:startups.filter((s:any)=>s.statut==="refuse"||s.statut==="refusé").length}].filter(d=>d.value>0);
  const secteurCount=Object.keys(startups.reduce((m:any,s:any)=>{if(s.secteur)m[s.secteur]=1;return m;},{})).length;
  const domaineCount=Object.keys(experts.reduce((m:any,e:any)=>{if(e.domaine)m[e.domaine]=1;return m;},{})).length;

  return (
    <div>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:C.text, margin:0 }}>Tableau de Bord</h1>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:C.white, borderRadius:99, padding:"5px 14px", border:`1px solid ${C.border}` }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:isOnline?"#10B981":"#EF4444" }} />
          <span style={{ fontSize:12, fontWeight:600, color:isOnline?"#10B981":"#EF4444" }}>{isOnline?"Connecté":"Hors ligne"}</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:14 }}>
        <KpiCard label="Startups totales" value={startups.length} sub={`${startupValides} validées`} color={C.purple+"40"} onClick={()=>setTab("utilisateurs")} />
        <KpiCard label="Experts valides" value={expertValides} sub={`${experts.length} inscrits`} color={C.teal+"40"} onClick={()=>setTab("utilisateurs")} />
        <KpiCard label="Clients / Demandes" value={demandes.length} sub={`${demandes.filter((d:any)=>d.statut==="en_attente").length} en attente`} color={C.blueM+"40"} onClick={()=>setTab("demandes")} />
        <KpiCard label="Taux de satisfaction" value={satPct?satPct+"%":"—"} sub={`${temosPublies.length} avis · ${avgNote>0?avgNote.toFixed(1):"—"}/5`} color="#10B98140" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        <KpiCard label="Formations publiées" value={(formations||[]).filter((f:any)=>f.statut==="publie").length} sub={`${(formationsProposees||[]).length} à valider`} color={C.orange+"40"} onClick={()=>setTab("services")} />
        <KpiCard label="Podcasts publiés" value={(podcasts||[]).filter((p:any)=>p.statut==="publie").length} sub={`${(podcastsProposees||[]).length} à valider`} color={C.cyan+"40"} onClick={()=>setTab("services")} />
        <KpiCard label="Articles publiés" value={(articles||[]).filter((a:any)=>a.statut==="publie").length} sub={`${(articles||[]).filter((a:any)=>a.statut==="brouillon").length} brouillons`} color={C.blueM+"40"} onClick={()=>setTab("contenu_accueil")} />
        <KpiCard label="En attente validation" value={enAttente} sub="Experts + Startups" color={C.red+"30"} onClick={()=>setTab("utilisateurs")} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>Activité mensuelle</div><div style={{ fontSize:11.5, color:C.textSub }}>Évolution estimée</div></div>
            <div style={{ display:"flex", gap:14 }}>
              {[{l:"Experts",c:"#7F77DD"},{l:"Startups",c:"#D85A30"},{l:"Demandes",c:"#378ADD"}].map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10, height:3, background:s.c, borderRadius:99 }} /><span style={{ fontSize:10.5, color:C.textSub, fontWeight:600 }}>{s.l}</span></div>
              ))}
            </div>
          </div>
          <ChartCanvas id="bi-line" height={150} />
        </div>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>Répartition Experts</div>
          <div style={{ fontSize:11.5, color:C.textSub, marginBottom:12 }}>Par statut · {experts.length} total</div>
          <ChartCanvas id="bi-donut-exp" height={120} />
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:10 }}>
            {donutLegendExp.map((d,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }} />
                <span style={{ fontSize:11.5, color:C.textSub, flex:1 }}>{d.label}</span>
                <span style={{ fontSize:12, fontWeight:800, color:d.color }}>{Math.round(d.value/(experts.length||1)*100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>Répartition Startups</div>
          <div style={{ fontSize:11.5, color:C.textSub, marginBottom:12 }}>Par statut · {startups.length} total</div>
          <ChartCanvas id="bi-donut-st" height={120} />
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:10 }}>
            {donutLegendSt.map((d,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }} />
                <span style={{ fontSize:11.5, color:C.textSub, flex:1 }}>{d.label}</span>
                <span style={{ fontSize:12, fontWeight:800, color:d.color }}>{Math.round(d.value/(startups.length||1)*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>Experts par ville</div><div style={{ fontSize:11.5, color:C.textSub }}>Distribution géographique</div></div>
            <div style={{ display:"flex", gap:5 }}>
              {(["all","valide","en_attente"] as const).map(f=>(
                <button key={f} onClick={()=>setVilleFilterExperts(f)} style={{ padding:"4px 10px", border:`1.5px solid ${villeFilterExperts===f?C.teal:C.border}`, borderRadius:8, background:villeFilterExperts===f?C.tealL:C.white, color:villeFilterExperts===f?C.tealD:C.textSub, fontWeight:villeFilterExperts===f?700:500, cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                  {f==="all"?"Tous":f==="valide"?"Valides":"En attente"}
                </button>
              ))}
            </div>
          </div>
          <ChartCanvas id="bi-villes-experts" height={200} />
        </div>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>Startups par ville</div><div style={{ fontSize:11.5, color:C.textSub }}>Distribution géographique</div></div>
            <div style={{ display:"flex", gap:5 }}>
              {(["all","valide","en_attente"] as const).map(f=>(
                <button key={f} onClick={()=>setVilleFilterStartups(f)} style={{ padding:"4px 10px", border:`1.5px solid ${villeFilterStartups===f?C.teal:C.border}`, borderRadius:8, background:villeFilterStartups===f?C.tealL:C.white, color:villeFilterStartups===f?C.tealD:C.textSub, fontWeight:villeFilterStartups===f?700:500, cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                  {f==="all"?"Tous":f==="valide"?"Valides":"En attente"}
                </button>
              ))}
            </div>
          </div>
          <ChartCanvas id="bi-villes-startups" height={200} />
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>Experts par domaine</div>
          <div style={{ fontSize:11.5, color:C.textSub, marginBottom:14 }}>Top {Math.min(domaineCount,8)} domaines</div>
          <ChartCanvas id="bi-domaines" height={Math.max(180,Math.min(domaineCount,8)*36+40)} />
        </div>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>Startups par secteur</div>
          <div style={{ fontSize:11.5, color:C.textSub, marginBottom:14 }}>Top {Math.min(secteurCount,10)} secteurs</div>
          <ChartCanvas id="bi-secteurs" height={Math.max(200,Math.min(secteurCount,10)*38+40)} />
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>Taux de satisfaction</div><div style={{ fontSize:11.5, color:C.textSub }}>Évolution mensuelle</div></div>
            <div style={{ fontSize:28, fontWeight:900, color:satPct>=75?"#10B981":satPct>=50?C.amber:C.red, lineHeight:1 }}>{satPct?satPct+"%":"—"}</div>
          </div>
          <ChartCanvas id="bi-sat-line" height={140} />
        </div>
        <div style={{ background:C.white, borderRadius:16, border:`2px solid ${C.border}`, padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div><div style={{ fontWeight:800, fontSize:14, color:C.text }}>Services les plus demandés</div><div style={{ fontSize:11.5, color:C.textSub }}>{demandes.length} demandes totales</div></div>
            <span style={{ background:C.tealL, color:C.tealD, borderRadius:8, padding:"3px 9px", fontSize:10.5, fontWeight:700 }}>Top 6</span>
          </div>
          <ChartCanvas id="bi-services" height={160} />
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DÉTAIL EXPERT ====================
function ModalExpertDetail({ expert, onClose, onValider, onRefuser }: any) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [scoreConfig, setScoreConfig] = useState({
    poids_competences: 8,
    poids_experience: 5,
    bonus_diplome: 15,
    seuil_accepte: 70,
    seuil_pending: 40,
    age_min: 18,
    age_max: 60,
    sexe_prefere: "tous",
    localisations_acceptees: ["Toute la Tunisie"],
    experience_min_ans: 0,
  });

  useEffect(() => {
    fetch(`${FASTAPI_BASE}/config`)
      .then(r => r.json())
      .then(data => setScoreConfig(prev => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const saveScoreConfig = async () => {
    setSavingConfig(true);
    try {
      await fetch(`${FASTAPI_BASE}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreConfig),
      });
    } catch {}
    setSavingConfig(false);
  };

  const handleAnalyzeCV = async () => {
    if (!expert.cv) {
      setAnalysisError("Aucun CV disponible pour cet expert.");
      return;
    }
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const cvRes = await fetch(`${BASE}/uploads/cv/${expert.cv}`);
      const blob = await cvRes.blob();
      const file = new File([blob], expert.cv, { type: "application/pdf" });
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${FASTAPI_BASE}/analyze-cv-pdf?model=spacy`, {
        method: "POST",
        body: fd,
      });
      if (!r.ok) throw new Error("Erreur analyse");
      const data = await r.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setAnalysisError(err.message || "Erreur réseau");
    }
    setAnalyzing(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 780 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.tealD})`, padding: "22px 26px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,191,165,.25)", border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, fontWeight: 800, fontSize: 20 }}>
                {expert.user?.prenom?.[0]}{expert.user?.nom?.[0]}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Fiche Expert</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{expert.user?.prenom} {expert.user?.nom}</div>
                <div style={{ color: C.teal, fontSize: 12, marginTop: 2 }}>{expert.domaine || "Expert"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "75vh", overflowY: "auto" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>Informations personnelles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Email", val: expert.user?.email || "—" },
                { label: "Téléphone", val: expert.user?.telephone || "—" },
                { label: "Localisation", val: expert.localisation || "—" },
                { label: "Expérience", val: expert.annee_debut_experience ? `${new Date().getFullYear() - expert.annee_debut_experience} ans` : "—" },
                { label: "Domaine", val: expert.domaine || "—" },
                { label: "Statut", val: expert.statut },
              ].map((row, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          {expert.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0 }}>{expert.description}</p>
            </div>
          )}
          {expert.cv && (
            <div style={{ marginBottom: 16 }}>
              <a href={`${BASE}/uploads/cv/${expert.cv}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.blueL, color: C.blue, borderRadius: 10, padding: "10px 16px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                Voir le CV
              </a>
            </div>
          )}

          {(expert.cv || expert.cv_text) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>⚙️ Configuration scoring</div>
              <div style={{ background: "#F8FAFC", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    { key: "poids_competences", label: "Points/compétence", min: 1, max: 20 },
                    { key: "poids_experience", label: "Points/année exp.", min: 1, max: 20 },
                    { key: "bonus_diplome", label: "Bonus diplôme", min: 0, max: 30 },
                    { key: "seuil_accepte", label: "Seuil accepter", min: 50, max: 100 },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{field.label}</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="range" min={field.min} max={field.max} value={(scoreConfig as any)[field.key]} onChange={e => setScoreConfig((prev: any) => ({ ...prev, [field.key]: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.teal }} />
                        <span style={{ background: C.tealL, color: C.tealD, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800, minWidth: 36, textAlign: "center" }}>{(scoreConfig as any)[field.key]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Âge minimum</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="range" min={18} max={50} value={scoreConfig.age_min} onChange={e => setScoreConfig(prev => ({ ...prev, age_min: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.teal }} />
                      <span style={{ background: C.tealL, color: C.tealD, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800, minWidth: 36, textAlign: "center" }}>{scoreConfig.age_min}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Âge maximum</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="range" min={25} max={70} value={scoreConfig.age_max} onChange={e => setScoreConfig(prev => ({ ...prev, age_max: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.teal }} />
                      <span style={{ background: C.tealL, color: C.tealD, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800, minWidth: 36, textAlign: "center" }}>{scoreConfig.age_max}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Expérience minimum (années)</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="range" min={0} max={20} value={scoreConfig.experience_min_ans} onChange={e => setScoreConfig(prev => ({ ...prev, experience_min_ans: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.teal }} />
                    <span style={{ background: C.tealL, color: C.tealD, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800, minWidth: 36, textAlign: "center" }}>{scoreConfig.experience_min_ans} ans</span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Sexe préféré</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["tous", "homme", "femme"].map(s => (
                      <button key={s} type="button" onClick={() => setScoreConfig(prev => ({ ...prev, sexe_prefere: s }))} style={{ flex: 1, padding: "7px", border: `1.5px solid ${scoreConfig.sexe_prefere === s ? C.teal : C.border}`, borderRadius: 8, background: scoreConfig.sexe_prefere === s ? C.tealL : "#fff", color: scoreConfig.sexe_prefere === s ? C.tealD : C.textSub, fontWeight: scoreConfig.sexe_prefere === s ? 700 : 500, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textTransform: "capitalize" }}>
                        {s === "tous" ? "Tous" : s === "homme" ? "Homme" : "Femme"}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.textSub, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Localisations acceptées</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Toute la Tunisie", "Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul", "Gabes"].map(loc => (
                      <button key={loc} type="button" onClick={() => {
                        const locs = scoreConfig.localisations_acceptees;
                        if (loc === "Toute la Tunisie") setScoreConfig(prev => ({ ...prev, localisations_acceptees: ["Toute la Tunisie"] }));
                        else {
                          const filtered = locs.filter(l => l !== "Toute la Tunisie");
                          if (filtered.includes(loc)) setScoreConfig(prev => ({ ...prev, localisations_acceptees: filtered.filter(l => l !== loc) }));
                          else setScoreConfig(prev => ({ ...prev, localisations_acceptees: [...filtered, loc] }));
                        }
                      }} style={{ padding: "5px 10px", border: `1.5px solid ${scoreConfig.localisations_acceptees.includes(loc) ? C.teal : C.border}`, borderRadius: 8, background: scoreConfig.localisations_acceptees.includes(loc) ? C.tealL : "#fff", color: scoreConfig.localisations_acceptees.includes(loc) ? C.tealD : C.textSub, fontWeight: scoreConfig.localisations_acceptees.includes(loc) ? 700 : 500, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveScoreConfig} disabled={savingConfig} style={{ width: "100%", padding: "8px", background: C.teal, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{savingConfig ? "Sauvegarde..." : "💾 Sauvegarder la formule"}</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>🔍 Analyse automatique du CV (modèle spaCy)</div>
                <button onClick={handleAnalyzeCV} disabled={analyzing} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: analyzing ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>{analyzing ? "⏳ Analyse..." : "Analyser le CV"}</button>
              </div>
              {analysisError && <div style={{ background: C.redL, border: `1px solid ${C.red}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.red, marginBottom: 8 }}>⚠️ {analysisError}</div>}
              {analysisResult && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: "#F0FDF4", border: `1.5px solid ${C.greenM}40`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Résultat de l'analyse (spaCy)</span>
                      <span style={{ background: analysisResult.decision === "accepted" ? C.greenL : analysisResult.decision === "pending" ? C.amberL : C.redL, color: analysisResult.decision === "accepted" ? C.green : analysisResult.decision === "pending" ? "#92400E" : C.red, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        {analysisResult.decision === "accepted" ? "Accepté" : analysisResult.decision === "pending" ? "En attente" : "Refusé"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                      <div><span style={{ fontSize: 12, color: C.textSub }}>Score :</span> <strong style={{ fontSize: 18, color: analysisResult.score >= 70 ? C.green : analysisResult.score >= 40 ? C.amber : C.red }}>{analysisResult.score} / 100</strong></div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 4 }}>Compétences détectées :</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(analysisResult.skills_found || []).map((skill: string, idx: number) => (
                          <span key={idx} style={{ background: C.tealL, borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: C.tealD }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {expert.statut === "en_attente" && (
                    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, marginBottom: 8, textTransform: "uppercase" }}>Décision finale admin</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={() => onRefuser(expert.id)}>❌ Refuser l'expert</button>
                        <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onValider(expert.id)}>✅ Accepter l'expert</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DÉTAIL STARTUP ====================
function ModalStartupDetail({startup,onClose,onValider,onRefuser}:any){
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:680}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.orange})`,padding:"22px 26px",borderRadius:"20px 20px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>S</div>
              <div>
                <div style={{color:"rgba(255,255,255,.7)",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Fiche Startup</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:19}}>{startup.nom_startup||`${startup.user?.prenom} ${startup.user?.nom}`}</div>
                <div style={{color:"rgba(255,255,255,.8)",fontSize:12,marginTop:2}}>{startup.secteur||"—"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
        <div style={{padding:"22px 26px",maxHeight:"75vh",overflowY:"auto"}}>
          <div style={{background:"#F8FAFC",borderRadius:14,padding:"16px 18px",marginBottom:16,border:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {label:"Nom complet",val:`${startup.user?.prenom||""} ${startup.user?.nom||""}`},
                {label:"Email",val:startup.user?.email||"—"},
                {label:"Téléphone",val:startup.user?.telephone||"—"},
                {label:"Startup",val:startup.nom_startup||"—"},
                {label:"Secteur",val:startup.secteur||"—"},
                {label:"Localisation",val:startup.localisation||startup.user?.localisation||"—"},
                {label:"Taille",val:startup.taille||"—"}
              ].map((row,i)=>(
                <div key={i} style={{background:C.white,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:4}}>{row.label}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          {startup.description&&<div style={{background:"#F8FAFC",borderRadius:14,padding:"16px 18px",border:`1px solid ${C.border}`}}><p style={{fontSize:13.5,color:"#334155",lineHeight:1.75,margin:0}}>{startup.description}</p></div>}
        </div>
        {startup.statut==="en_attente"&&<div style={{padding:"14px 26px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end",background:"#FAFCFE",borderRadius:"0 0 20px 20px"}}><button className="btn btn-red" onClick={()=>onRefuser(startup.id)}>Refuser</button><button className="btn btn-green" onClick={()=>onValider(startup.id)}>Valider et envoyer email</button></div>}
      </div>
    </div>
  );
}

// ==================== RESOLVE EXPERT CHOISI ====================
function resolveExpertChoisi(demande:any,experts:any[]):any|null{
  if(!demande) return null;
  for(const key of['expert_choisi','expert_assigne','expert_selectionne','expert','chosenExpert']){
    const value=demande[key];
    if(value&&typeof value==='object'){
      if(value.user) return value;
      if(value.id){const found=experts.find(e=>e.id===value.id);return found||{...value,user:{id:value.id,prenom:value.prenom||'',nom:value.nom||'',email:value.email||''}};}
    }
  }
  for(const key of['expert_assigne_id','expert_choisi_id','expert_id','chosenExpertId']){
    const id=demande[key];
    if(id&&typeof id==='number'){const found=experts.find(e=>e.id===id);if(found) return found;}
  }
  return null;
}

// ==================== MODAL DEMANDE SERVICE (SANS COMMENTAIRE ADMIN) ====================
function ModalDemandeService({demande,experts,onNotifierExperts,onAccepterFormation,onRefuserFormation,onClose,getDemandeDomaine,setSelectedExpertProfile,devisList,onLoadDevis}:any){
  const svc=demande?.service||"";
  const svcNorm = normalizeService(svc);
  const isFormationExistante = svcNorm === "formation-existante";
  const isFormationSurMesure = svcNorm === "formation-sur-mesure";
  const needsExpert = ["consulting","audit-sur-site","nos-plateformes","formation-sur-mesure"].includes(svcNorm);
  const allowRefuse = isFormationExistante;
  const demandeDomaine=getDemandeDomaine(demande);
  const expertsValides=experts.filter((e:any)=>e.statut==="valide");
  let expertsFiltres=expertsValides;
  if(demandeDomaine&&demandeDomaine!=="Autre"){const dl=demandeDomaine.toLowerCase().trim();expertsFiltres=expertsValides.filter((e:any)=>(e.domaine||"").toLowerCase().trim()===dl);}
  const expertsNotifiesIds:number[]=demande?.experts_notifies||[];
  const expertsAcceptesIds:number[]=demande?.experts_acceptes||[];
  const [selectedExperts,setSelectedExperts]=useState<number[]>([]);
  const toggleExpert=(id:number)=>setSelectedExperts(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const formation=demande?.formation;
  const placesRestantes=formation?.places_limitees?(formation?.places_disponibles??0):null;
  const peutAccepter=!isFormationExistante||!formation?.places_limitees||(placesRestantes!==null&&placesRestantes>0);
  const expertChoisi=resolveExpertChoisi(demande,experts);
  const [devis,setDevis] = useState<any[]>(devisList || []);
  useEffect(()=>{
    if(onLoadDevis && demande?.id) onLoadDevis(demande.id).then(setDevis);
  },[demande?.id, onLoadDevis]);

  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:720}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.blueM})`,padding:"22px 26px",borderRadius:"20px 20px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,background:"rgba(30,136,229,.3)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",fontWeight:700}}>D</div>
              <div>
                <div style={{color:"rgba(255,255,255,.7)",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Demande de service</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:19}}>{getServiceLabel(svc)}</div>
                {isFormationSurMesure&&<div style={{color:"#93C5FD",fontSize:11,marginTop:3,fontWeight:600}}>Formation sur mesure — Expert à notifier</div>}
                {isFormationExistante&&<div style={{color:"#86EFAC",fontSize:11,marginTop:3,fontWeight:600}}>Formation existante{placesRestantes!==null?` — ${placesRestantes} place(s) restante(s)`:" — Places illimitées"}</div>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <StatusBadge statut={demande.statut}/>
              <button onClick={onClose} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
            </div>
          </div>
        </div>
        <div style={{padding:"22px 26px",maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <span style={{background:isFormationExistante?C.greenL:isFormationSurMesure?C.blueL:C.tealL,color:isFormationExistante?C.green:isFormationSurMesure?C.blue:C.tealD,borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700}}>
              {getServiceLabel(svc)}
            </span>
            {isFormationSurMesure&&<span style={{background:C.amberL,color:"#92400E",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700}}>Expert requis</span>}
            {isFormationExistante&&placesRestantes!==null&&(
              <span style={{background:placesRestantes>0?C.greenL:C.redL,color:placesRestantes>0?C.green:C.red,borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700}}>
                {placesRestantes>0?`${placesRestantes} place(s)`:"Complet"}
              </span>
            )}
          </div>
          <div style={{background:"#F8FAFC",borderRadius:14,padding:"16px 18px",marginBottom:18,border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:12}}>Client</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {label:"Nom",val:`${demande.user?.prenom||""} ${demande.user?.nom||""}`},
                {label:"Email",val:demande.user?.email||"—"},
                {label:"Téléphone",val:demande.telephone||demande.user?.telephone||"—"},
                {label:"Startup",val:demande.user?.startup?.nom_startup||"—"},
                {label:"Secteur",val:demande.user?.startup?.secteur||"—"},
                {label:"Domaine",val:getDemandeDomaine(demande)},
              ].map((row,i)=>(
                <div key={i} style={{background:C.white,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:4}}>{row.label}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          {isFormationExistante&&formation&&(
            <div style={{background:C.greenL,border:`1.5px solid ${C.greenM}40`,borderRadius:14,padding:"16px 18px",marginBottom:18}}>
              <div style={{fontWeight:700,fontSize:13,color:C.green,marginBottom:10}}>Détails de la formation</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {label:"Titre",val:formation.titre||"—"},
                  {label:"Domaine",val:formation.domaine||"—"},
                  {label:"Mode",val:formation.mode==="en_ligne"?"En ligne":formation.mode==="presentiel"?"Présentiel":formation.mode||"—"},
                  {label:"Places dispo.",val:formation.places_limitees?(formation.places_disponibles??0)+" places":"Illimitées"},
                  {label:"Prix",val:formation.gratuit?"Gratuit":formation.prix?`${formation.prix} DT`:"—"},
                ].map((row,i)=>(
                  <div key={i} style={{background:C.white,borderRadius:8,padding:"8px 12px",border:`1px solid ${C.greenM}25`}}>
                    <div style={{fontSize:9.5,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:3}}>{row.label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {demande.description&&<div style={{background:C.white,borderRadius:12,padding:"14px 16px",marginBottom:18,border:`1px solid ${C.border}`}}><p style={{fontSize:13.5,color:"#334155",lineHeight:1.75,margin:0}}>{demande.description}</p></div>}
          {expertChoisi&&(
            <div style={{background:`linear-gradient(135deg, ${C.purpleL}, #F5F0FF)`,border:`2px solid ${C.purple}40`,borderRadius:16,padding:"20px 22px",marginBottom:18}}>
              <div style={{fontWeight:800,fontSize:14,color:C.purple,marginBottom:12}}>Expert sélectionné par le client</div>
              <div style={{background:C.white,borderRadius:12,padding:"18px 20px",border:`1px solid ${C.purple}25`,display:"flex",alignItems:"center",gap:16}}>
                <Avatar prenom={expertChoisi.user?.prenom} nom={expertChoisi.user?.nom} size={54} color={C.purple}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:17,color:C.text}}>{expertChoisi.user?.prenom} {expertChoisi.user?.nom}</div>
                  <div style={{fontSize:13,color:C.textSub,marginTop:3}}>{expertChoisi.domaine||"—"} · {expertChoisi.localisation||"—"}</div>
                </div>
                <button className="btn btn-gray" style={{fontSize:12,padding:"6px 13px"}} onClick={()=>setSelectedExpertProfile(expertChoisi)}>Voir profil</button>
              </div>
            </div>
          )}
          {needsExpert&&!isFormationExistante&&!expertChoisi&&(
            <div style={{border:`1.5px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:18}}>
              <div style={{padding:"12px 16px",background:"#F6F9FC",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:C.text}}>Notifier des experts</div>
                  <div style={{fontSize:11.5,color:C.textSub}}>Domaine : <strong>{demandeDomaine}</strong> · {expertsFiltres.length} disponible(s)</div>
                  {isFormationSurMesure&&<div style={{fontSize:11,color:C.blueM,fontWeight:600,marginTop:3}}>Formation sur mesure — les experts notifiés proposeront un programme</div>}
                </div>
                {expertsNotifiesIds.length>0&&<span style={{background:C.tealL,color:C.tealD,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>{expertsNotifiesIds.length} notifié(s)</span>}
              </div>
              <div style={{maxHeight:280,overflowY:"auto"}}>
                {expertsFiltres.length===0?<div style={{padding:"28px",textAlign:"center",color:C.textSub,fontSize:13}}>Aucun expert disponible</div>
                  :expertsFiltres.map((ex:any)=>{
                    const alreadyNotified=expertsNotifiesIds.includes(ex.id);
                    const hasAccepted=expertsAcceptesIds.includes(ex.id);
                    const isSelected=selectedExperts.includes(ex.id);
                    return(
                      <div key={ex.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid #F8FAFC`,background:isSelected?`${C.teal}08`:C.white}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <input type="checkbox" checked={isSelected} disabled={alreadyNotified} onChange={()=>{if(!alreadyNotified)toggleExpert(ex.id);}} style={{cursor:alreadyNotified?"not-allowed":"pointer",width:16,height:16,accentColor:C.teal}}/>
                          <Avatar prenom={ex.user?.prenom} nom={ex.user?.nom} size={36}/>
                          <div><div style={{fontWeight:600,fontSize:13.5,color:C.text}}>{ex.user?.prenom} {ex.user?.nom}</div><div style={{fontSize:11,color:C.textSub}}>{ex.domaine||"Expert"} · {ex.localisation||"—"}</div></div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <button className="btn btn-gray" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>setSelectedExpertProfile(ex)}>Profil</button>
                          {alreadyNotified?hasAccepted?<span style={{background:C.greenL,color:C.green,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>Accepté</span>:<span style={{background:C.amberL,color:"#92400E",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>Notifié</span>:<span style={{fontSize:11,color:C.textSub}}>Non notifié</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
              {selectedExperts.length>0&&(
                <div style={{padding:"12px 16px",background:`${C.teal}08`,borderTop:`1px solid ${C.teal}30`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,color:C.tealD,fontWeight:600}}>{selectedExperts.length} sélectionné(s)</span>
                  <button className="btn btn-teal" onClick={async()=>{await onNotifierExperts(demande.id,selectedExperts);setSelectedExperts([]);}}>Notifier</button>
                </div>
              )}
            </div>
          )}
          {devis.length>0&&(
            <div style={{border:`2px solid ${C.greenM}30`,borderRadius:16,padding:"16px 18px",marginBottom:18,background:`${C.greenL}10`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.greenL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}><FaCommentDollar/></div>
                <div style={{fontWeight:800,fontSize:14,color:C.text}}>Devis associés ({devis.length})</div>
              </div>
              {devis.map((dv:any)=>(
                <div key={dv.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>Montant : {dv.montant?.toLocaleString("fr-TN")} DT</div>
                      <div style={{fontSize:11,color:C.textSub}}>Expert : {dv.expert?.user?.prenom} {dv.expert?.user?.nom} · {new Date(dv.createdAt).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <StatusBadge statut={dv.statut}/>
                  </div>
                  {dv.description&&<div style={{fontSize:12,color:C.textSub,marginTop:6}}>{dv.description.slice(0,100)}</div>}
                </div>
              ))}
            </div>
          )}
          <div style={{background:"#F8FAFC",border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px"}}>
            <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:14}}>Actions admin</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
              {demande.statut==="en_attente"&&isFormationExistante&&(
                <React.Fragment><button className="btn btn-green" style={{flex:1,justifyContent:"center"}} disabled={!peutAccepter} onClick={()=>peutAccepter&&onAccepterFormation(demande.id)}>{peutAccepter?"Accepter":"Complet — impossible"}</button><button className="btn btn-red" style={{flex:1,justifyContent:"center"}} onClick={()=>onRefuserFormation(demande.id)}>Refuser</button></React.Fragment>
              )}
              {demande.statut==="en_attente"&&!isFormationExistante&&!allowRefuse&&(
                <div style={{background:C.blueL, color:C.blue, borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:500, textAlign:"center", width:"100%"}}>
                  ℹ️ Cette demande sera traitée par notification d'experts. Aucune action de refus direct n'est disponible.
                </div>
              )}
              {demande.statut==="notifie_experts"&&isFormationExistante&&(
                <button className="btn btn-red" style={{flex:1,justifyContent:"center"}} onClick={()=>onRefuserFormation(demande.id)}>Refuser</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== FORMATION FORM MODAL (CORRIGÉE) ====================
function FormationFormModal({ formation, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: formation?.titre || "",
    description: formation?.description || "",
    domaine: formation?.domaine || "",
    mode: formation?.mode || "en_ligne",
    duree: formation?.duree || "",
    localisation: formation?.localisation || "",
    niveau: formation?.niveau || "",
    lien_formation: formation?.lien_formation || "",
    dateDebut: formation?.dateDebut?.split("T")[0] || "",
    dateFin: formation?.dateFin?.split("T")[0] || "",
    type: formation?.type || "payant",
    gratuit: formation?.gratuit || false,
    prix: formation?.prix || "",
    places_limitees: formation?.places_limitees || false,
    places_disponibles: formation?.places_disponibles || "",
    certifiante: formation?.certifiante || false,
    statut: formation?.statut || "publie",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formateurs, setFormateurs] = useState<any[]>(() => {
    if (formation?.formateur_details && Array.isArray(formation.formateur_details))
      return formation.formateur_details.map((f: any) => ({
        prenom: f.prenom || "",
        nom: f.nom || "",
        domaine: f.domaine || "",
        bio: f.bio || "",
        imageFile: null,
        imagePreview: f.image ? `${BASE}/uploads/formateurs/${f.image}` : "",
      }));
    return [{ prenom: "", nom: "", domaine: "", bio: "", imageFile: null, imagePreview: "" }];
  });

  const DOMAINES = [
    "Marketing Digital", "Finance / Comptabilité", "Ressources Humaines",
    "Développement Web / Mobile", "Design UI/UX", "Stratégie Commerciale",
    "Logistique / Supply Chain", "Intelligence Artificielle / Data",
    "Management", "Communication", "Juridique", "Autre",
  ];

  const addFormateur = () => {
    setFormateurs(prev => [...prev, { prenom: "", nom: "", domaine: "", bio: "", imageFile: null, imagePreview: "" }]);
  };

  const removeFormateur = (index: number) => {
    if (formateurs.length === 1) return;
    setFormateurs(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormateur = (index: number, field: string, value: any) => {
    setFormateurs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const handleFormateurImage = (index: number, file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormateurs(prev => prev.map((f, i) =>
        i === index ? { ...f, imageFile: file, imagePreview: preview } : f
      ));
    } else {
      setFormateurs(prev => prev.map((f, i) =>
        i === index ? { ...f, imageFile: null, imagePreview: "" } : f
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      alert("Titre requis");
      return;
    }

    // Construction des formateur_details avec des valeurs par défaut pour éviter les undefined
    const formateursData = [];
    for (let i = 0; i < formateurs.length; i++) {
      const f = formateurs[i];
      formateursData.push({
        prenom: (f.prenom && f.prenom.trim() !== "") ? f.prenom.trim() : "",
        nom: (f.nom && f.nom.trim() !== "") ? f.nom.trim() : "",
        domaine: (f.domaine && f.domaine.trim() !== "") ? f.domaine.trim() : "",
        bio: (f.bio && f.bio.trim() !== "") ? f.bio.trim() : "",
      });
    }

    setLoading(true);
    const fd = new FormData();

    // Ajouter tous les champs du formulaire
    fd.append("titre", form.titre);
    if (form.description) fd.append("description", form.description);
    if (form.domaine) fd.append("domaine", form.domaine);
    fd.append("mode", form.mode);
    if (form.duree) fd.append("duree", form.duree);
    if (form.localisation) fd.append("localisation", form.localisation);
    if (form.niveau) fd.append("niveau", form.niveau);
    if (form.lien_formation) fd.append("lien_formation", form.lien_formation);
    if (form.dateDebut) fd.append("dateDebut", form.dateDebut);
    if (form.dateFin) fd.append("dateFin", form.dateFin);
    fd.append("type", form.type);
    fd.append("gratuit", String(form.gratuit));
    if (form.prix && !form.gratuit) fd.append("prix", form.prix);
    fd.append("places_limitees", String(form.places_limitees));
    if (form.places_limitees && form.places_disponibles) fd.append("places_disponibles", form.places_disponibles);
    fd.append("certifiante", String(form.certifiante));
    fd.append("statut", form.statut);
    if (imageFile) fd.append("image", imageFile);
    
    // Envoyer formateur_details en JSON (format attendu par le backend)
    fd.append("formateur_details", JSON.stringify(formateursData));

    // Ajouter les images des formateurs (une par formateur, index correspondant)
    for (let i = 0; i < formateurs.length; i++) {
      if (formateurs[i].imageFile) {
        fd.append(`formateur_image_${i}`, formateurs[i].imageFile);
      }
    }

    const url = formation
      ? `${BASE}/formations/admin/${formation.id}`
      : `${BASE}/formations/admin/create`;
    
    try {
      const res = await fetch(url, {
        method: formation ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: fd,
      });
      if (res.ok) {
        alert(formation ? "Formation modifiée avec succès !" : "Formation créée avec succès !");
        onSave();
        onClose();
      } else {
        const err = await res.text();
        alert(`Erreur: ${err}`);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 900 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.purple})`, padding: "24px 28px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>F</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{formation ? "Modifier" : "Créer"} une formation</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 16 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", maxHeight: "72vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 12 }}><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">Domaine</label><select className="inp" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })}><option value="">Sélectionner</option>{DOMAINES.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="lbl">Mode</label><select className="inp" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}><option value="en_ligne">En ligne</option><option value="presentiel">Présentiel</option><option value="hybride">Hybride</option></select></div>
            <div><label className="lbl">Durée</label><input className="inp" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="Ex: 2 jours"/></div>
            <div><label className="lbl">Niveau</label><select className="inp" value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}><option value="">Sélectionner</option>{["Débutant","Intermédiaire","Avancé","Tous niveaux"].map(n => <option key={n}>{n}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", background: "#FAFCFE" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label className="lbl" style={{ marginBottom: 0 }}>Formateur(s)</label>
              <button type="button" className="btn btn-teal" style={{ fontSize: 12, padding: "5px 12px" }} onClick={addFormateur}>+ Ajouter</button>
            </div>
            {formateurs.map((f, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", borderBottom: idx !== formateurs.length - 1 ? `1px solid ${C.border}` : "none", paddingBottom: 12 }}>
                <input 
                  className="inp" 
                  style={{ flex: 1, minWidth: 100 }} 
                  placeholder="Prénom" 
                  value={f.prenom} 
                  onChange={e => updateFormateur(idx, "prenom", e.target.value)} 
                />
                <input 
                  className="inp" 
                  style={{ flex: 1, minWidth: 100 }} 
                  placeholder="Nom" 
                  value={f.nom} 
                  onChange={e => updateFormateur(idx, "nom", e.target.value)} 
                />
                <input 
                  className="inp" 
                  style={{ flex: 1, minWidth: 100 }} 
                  placeholder="Domaine" 
                  value={f.domaine} 
                  onChange={e => updateFormateur(idx, "domaine", e.target.value)} 
                />
                <textarea 
                  className="inp" 
                  style={{ flex: 2, minWidth: 180 }} 
                  placeholder="Bio" 
                  rows={2} 
                  value={f.bio} 
                  onChange={e => updateFormateur(idx, "bio", e.target.value)} 
                />
                <label className="upload-zone" style={{ width: 80, height: 80, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fff" }}>
                  <input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleFormateurImage(idx, file); }} style={{ display: "none" }} />
                  {f.imagePreview ? <img src={f.imagePreview} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} alt="" /> : <FaImage style={{ fontSize: 20, color: "#94A3B8" }} />}
                </label>
                {formateurs.length > 1 && (
                  <button type="button" className="btn btn-red" style={{ padding: "6px 10px" }} onClick={() => removeFormateur(idx)}>
                    <FaTrashAlt size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">Localisation</label><input className="inp" value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} /></div>
            <div><label className="lbl">Lien</label><input className="inp" value={form.lien_formation} onChange={e => setForm({ ...form, lien_formation: e.target.value })} /></div>
            <div><label className="lbl">Date début</label><input className="inp" type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
            <div><label className="lbl">Date fin</label><input className="inp" type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
            <div><label className="lbl">Type</label><select className="inp" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="payant">Payant</option><option value="gratuit">Gratuit</option></select></div>
            <div><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}><option value="publie">Publié</option><option value="brouillon">Brouillon</option><option value="archive">Archivé</option></select></div>
          </div>
          {form.type === "payant" && (
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">Prix (DT)</label>
              <input className="inp" type="number" min="0" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Image de couverture</label>
            <label className="upload-zone" style={{ minHeight: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} style={{ display: "none" }} />
              {imageFile ? <img src={URL.createObjectURL(imageFile)} style={{ maxHeight: 70, borderRadius: 6 }} alt="" /> : (formation?.image ? <img src={`${BASE}/uploads/formations/${formation.image}`} style={{ maxHeight: 70, borderRadius: 6 }} alt="" /> : <div style={{ fontSize: 12, color: C.textSub }}>Importer une image</div>)}
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-teal" disabled={loading}>{loading ? "Enregistrement..." : (formation ? "Modifier" : "Créer")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== PODCAST FORM MODAL ====================
function PodcastFormModal({podcast,onClose,onSave}:any){
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState({titre:podcast?.titre||"",description:podcast?.description||"",domaine:podcast?.domaine||"",auteur:podcast?.auteur||"",statut:podcast?.statut||"publie",type_media:"video",video_url:podcast?.url_audio||""});
  const [useUrl,setUseUrl]=useState(!!(podcast?.url_audio&&!podcast?.url_audio?.startsWith("podcast-")));
  const [videoFile,setVideoFile]=useState<File|null>(null);
  const [imageFile,setImageFile]=useState<File|null>(null);
  const [imagePreview,setImagePreview]=useState(podcast?.image?`${BASE}/uploads/podcasts-images/${podcast.image}`:"");
  const [mediaName,setMediaName]=useState(podcast?.url_audio||"");
  const DOMAINES=["Marketing Digital","Finance / Comptabilité","Ressources Humaines","Développement Web / Mobile","Design UI/UX","Stratégie Commerciale","Logistique / Supply Chain","Intelligence Artificielle / Data","Management","Communication","Juridique","Autre"];
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.titre.trim()) { alert("Titre requis"); return; }
  if (!useUrl && !videoFile && !podcast?.url_audio) { alert("Veuillez uploader un fichier vidéo ou fournir un lien"); return; }
  
  setLoading(true);
  const fd = new FormData();
  fd.append("titre", form.titre);
  fd.append("description", form.description || "");
  fd.append("domaine", form.domaine || "");
  fd.append("auteur", form.auteur || "");
  fd.append("statut", form.statut);
  
  if (useUrl && form.video_url.trim()) {
    fd.append("url_audio", form.video_url);
  } else if (videoFile) {
    fd.append("video_file", videoFile);
  }
  
  if (imageFile) fd.append("image_file", imageFile);
  
  const url = podcast ? `${BASE}/admin/podcasts/${podcast.id}` : `${BASE}/admin/podcasts/create`;
  try {
    const res = await fetch(url, {
      method: podcast ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      body: fd
    });
    if (res.ok) {
      onSave();
      onClose();
    } else {
      const err = await res.text();
      alert(`Erreur : ${err || "Sauvegarde échouée"}`);
    }
  } catch {
    alert("Erreur réseau");
  }
  setLoading(false);

  };
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:640}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.cyan})`,padding:"24px 28px",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",fontWeight:700}}>P</div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>{podcast?"Modifier":"Ajouter"} un podcast</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:"24px 28px",maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{marginBottom:12}}><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})}/></div>
          <div style={{marginBottom:12}}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><label className="lbl">Auteur</label><input className="inp" value={form.auteur} onChange={e=>setForm({...form,auteur:e.target.value})}/></div>
            <div><label className="lbl">Domaine</label><select className="inp" value={form.domaine} onChange={e=>setForm({...form,domaine:e.target.value})}><option value="">Sélectionner</option>{DOMAINES.map(d=><option key={d}>{d}</option>)}</select></div>
          </div>
          <div style={{marginBottom:16,display:"flex",gap:24,background:"#F8FAFC",borderRadius:10,padding:"10px 14px"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={!useUrl} onChange={()=>setUseUrl(false)}/><span style={{fontWeight:600}}>Uploader MP4</span></label>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" checked={useUrl} onChange={()=>setUseUrl(true)}/><span style={{fontWeight:600}}>Lien externe (YouTube...)</span></label>
          </div>
          {!useUrl?(
            <div style={{marginBottom:12}}>
              <label className="lbl">Fichier vidéo (MP4)</label>
              <label className="upload-zone" style={{minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
                <input type="file" accept="video/mp4,video/*" onChange={e=>{const f=e.target.files?.[0];if(f){setVideoFile(f);setMediaName(f.name);}}} style={{display:"none"}}/>
                {mediaName?<div style={{fontSize:11,color:C.greenM,fontWeight:600,textAlign:"center",wordBreak:"break-all"}}>{mediaName}</div>:<div style={{fontSize:11,color:C.textSub}}>Cliquer pour sélectionner</div>}
              </label>
              {podcast?.url_audio&&!videoFile&&(
                <div style={{marginTop:10,background:"#F0F4F8",borderRadius:9,padding:"8px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.textSub,marginBottom:4}}>Fichier actuel</div>
                  <video src={`${BASE}/uploads/podcasts-audio/${podcast.url_audio}`} controls style={{width:"100%",maxHeight:140,borderRadius:6}}/>
                </div>
              )}
            </div>
          ):(
            <div style={{marginBottom:12}}>
              <label className="lbl">Lien URL</label>
              <input className="inp" placeholder="https://www.youtube.com/..." value={form.video_url} onChange={e=>setForm({...form,video_url:e.target.value})}/>
              <div style={{fontSize:11,color:C.textSub,marginTop:4}}>YouTube, Vimeo, SoundCloud, etc.</div>
            </div>
          )}
          <div style={{marginBottom:12}}>
            <label className="lbl">Image de couverture</label>
            <label className="upload-zone" style={{minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
              {imagePreview?<img src={imagePreview} style={{maxHeight:60,borderRadius:6}} alt=""/>:<div style={{fontSize:11,color:C.textSub}}>Image de couverture</div>}
            </label>
          </div>
          <div style={{marginBottom:16}}><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}><option value="publie">Publié</option><option value="brouillon">Brouillon</option><option value="archive">Archivé</option></select></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:12,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-cyan" disabled={loading}>{loading?"Enregistrement...":(podcast?"Modifier":"Créer")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ARTICLE FORM MODAL ====================
function ArticleFormModal({editingArticle,onClose,onSave,categoriesPredefinies}:any){
  const [form,setForm]=useState<any>({titre:editingArticle?.titre||"",description:editingArticle?.description||"",type:editingArticle?.type||"article",categorie:editingArticle?.categorie||"",statut:editingArticle?.statut||"brouillon",image:editingArticle?.image||"",pdf:editingArticle?.pdf||""});
  const [articleImageFile,setArticleImageFile]=useState<File|null>(null);
  const [articlePdfFile,setArticlePdfFile]=useState<File|null>(null);
  const [imagePreview,setImagePreview]=useState(editingArticle?.image?`${BASE}/uploads/articles-img/${editingArticle.image}`:"");
  const [pdfName,setPdfName]=useState(editingArticle?.pdf||"");
  const [categorieAutre,setCategorieAutre]=useState(!!editingArticle?.categorie&&!categoriesPredefinies.includes(editingArticle?.categorie));
  const [categoriePersonnalise,setCategoriePersonnalise]=useState(!categoriesPredefinies.includes(editingArticle?.categorie||"")?(editingArticle?.categorie||""):"");
  const [uploading,setUploading]=useState(false);
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    let categorieFinale=form.categorie;
    if(categorieAutre){categorieFinale=categoriePersonnalise;if(!categorieFinale.trim()){alert("Saisissez une catégorie");return;}}
    setUploading(true);
    const fd=new FormData();
    Object.entries(form).forEach(([k,v])=>{if(v!==null&&v!==undefined&&k!=="categorie"&&k!=="image"&&k!=="pdf")fd.append(k,String(v));});
    fd.append("categorie",categorieFinale);
    if(articleImageFile)fd.append("image",articleImageFile);
    if(articlePdfFile)fd.append("pdf",articlePdfFile);
    const url=editingArticle?`${BASE}/articles/admin/${editingArticle.id}`:`${BASE}/articles/admin/create`;
    try{const r=await fetch(url,{method:editingArticle?"PUT":"POST",headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`},body:fd});if(r.ok){onSave();onClose();}else{const err=await r.text();alert(`Erreur : ${err||"Sauvegarde échouée"}`);}}catch{alert("Erreur réseau");}
    setUploading(false);
  };
  return(
    <div className="modal-bg" onClick={onClose}>
      <div style={{background:C.white,borderRadius:20,width:"100%",maxWidth:900,maxHeight:"96vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 28px 70px rgba(0,0,0,.22)"}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.blueM})`,padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",fontWeight:700}}>A</div>
            <div style={{color:"#fff",fontWeight:800,fontSize:17}}>{editingArticle?"Modifier":"Nouvel article"}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:15}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{overflowY:"auto",flex:1}}>
          <div style={{padding:"22px 26px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 160px 200px 160px",gap:12,marginBottom:16}}>
              <div><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})}/></div>
              <div><label className="lbl">Type</label><select className="inp" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="article">Article</option><option value="conseil">Conseil</option></select></div>
              <div>
                <label className="lbl">Catégorie</label>
                <select className="inp" value={categorieAutre?"Autre":(form.categorie||"")} onChange={e=>{const val=e.target.value;if(val==="Autre"){setCategorieAutre(true);setForm({...form,categorie:""});}else{setCategorieAutre(false);setForm({...form,categorie:val});}}}>
                  <option value="">Sélectionner</option>
                  {categoriesPredefinies.map((c:string)=><option key={c}>{c}</option>)}
                  <option value="Autre">Autre...</option>
                </select>
                {categorieAutre&&<input type="text" className="inp" style={{marginTop:6}} placeholder="Catégorie personnalisée" value={categoriePersonnalise} onChange={e=>setCategoriePersonnalise(e.target.value)}/>}
              </div>
              <div><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}><option value="brouillon">Brouillon</option><option value="publie">Publié</option></select></div>
            </div>
            <div style={{marginBottom:18}}>
              <label className="lbl">Contenu de l'article *</label>
              <textarea className="inp" rows={10} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Rédigez le contenu de votre article ici..." style={{resize:"vertical",minHeight:220,fontSize:13.5,lineHeight:1.75}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div>
                <label className="lbl">Image de couverture</label>
                <label className="upload-zone" style={{minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                  <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){setArticleImageFile(f);setImagePreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
                  {imagePreview?<img src={imagePreview} style={{maxHeight:70,borderRadius:8}} alt=""/>:<div style={{fontSize:12,color:C.textSub}}>Importer une image</div>}
                </label>
              </div>
              <div>
                <label className="lbl">PDF (optionnel)</label>
                <label className="upload-zone" style={{minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                  <input type="file" accept=".pdf" onChange={e=>{const f=e.target.files?.[0];if(f){setArticlePdfFile(f);setPdfName(f.name);}}} style={{display:"none"}}/>
                  {pdfName?<div style={{fontSize:11,color:C.greenM}}>PDF: {pdfName}</div>:<div style={{fontSize:12,color:C.textSub}}>Ajouter un PDF</div>}
                </label>
              </div>
            </div>
          </div>
          <div style={{padding:"14px 26px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end",alignItems:"center",background:"#FAFCFE",flexShrink:0}}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-teal" disabled={uploading}>{uploading?"Envoi en cours...":(editingArticle?"Enregistrer":"Créer l'article")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MEDIA MODAL ====================
function MediaModal({media,onClose,onSave}:any){
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState({titre:media?.titre||"",description:media?.description||"",url:media?.url||"",emission:media?.emission||"",date_publication:media?.date_publication?.split("T")[0]||new Date().toISOString().split("T")[0],statut:media?.statut||"publie"});
  const [miniatureFile,setMiniatureFile]=useState<File|null>(null);
  const [previewUrl,setPreviewUrl]=useState(media?.miniature?`${BASE}/uploads/medias/${media.miniature}`:"");
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);
    const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,String(v)));
    if(miniatureFile)fd.append("miniature_file",miniatureFile);
    const url=media?`${BASE}/admin/medias/${media.id}`:`${BASE}/admin/medias/create`;
    try{const res=await fetch(url,{method:media?"PUT":"POST",headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`},body:fd});if(res.ok){onSave();onClose();}else alert("Erreur");}catch{alert("Erreur réseau");}
    setLoading(false);
  };
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:680}} onClick={e=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.red})`,padding:"20px 26px",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",fontWeight:700}}>M</div><div style={{color:"#fff",fontWeight:900,fontSize:18}}>{media?"Modifier":"Ajouter"} un média</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",color:"#fff"}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:"24px 28px",maxHeight:"70vh",overflowY:"auto"}}>
          <div style={{marginBottom:12}}><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})}/></div>
          <div style={{marginBottom:12}}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label className="lbl">URL</label><input className="inp" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..."/></div>
            <div><label className="lbl">Émission</label><input className="inp" value={form.emission} onChange={e=>setForm({...form,emission:e.target.value})}/></div>
            <div><label className="lbl">Date</label><input className="inp" type="date" value={form.date_publication} onChange={e=>setForm({...form,date_publication:e.target.value})}/></div>
            <div><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}><option value="publie">Publié</option><option value="brouillon">Brouillon</option></select></div>
          </div>
          <div style={{marginBottom:12}}>
            <label className="lbl">Miniature</label>
            <label className="upload-zone" style={{minHeight:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f){setMiniatureFile(f);setPreviewUrl(URL.createObjectURL(f));}}} style={{display:"none"}}/>
              {previewUrl?<img src={previewUrl} style={{maxHeight:70,borderRadius:8}} alt=""/>:<div style={{fontSize:12,color:C.textSub}}>Cliquer pour importer</div>}
            </label>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:16}}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-teal" disabled={loading}>{loading?"Enregistrement...":(media?"Modifier":"Créer")}</button></div>
        </form>
      </div>
    </div>
  );
}

// ==================== MODAL VALIDATION FORMATION ====================
function ModalFormationValidation({formation,onClose,onValider,onRefuser}:any){
  if(!formation) return null;
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:700}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.purple})`,padding:"22px 26px",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:12,background:`rgba(109,40,217,.25)`,border:`2px solid ${C.purple}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.purple,fontWeight:700}}>F</div><div><div style={{color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Validation formation</div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>{formation.titre}</div></div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"22px 26px",maxHeight:"75vh",overflowY:"auto"}}>
          <div style={{background:"#F8FAFC",borderRadius:14,padding:"16px 18px",marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{label:"Domaine",val:formation.domaine||"—"},{label:"Mode",val:formation.mode==="en_ligne"?"En ligne":formation.mode==="presentiel"?"Présentiel":formation.mode||"—"},{label:"Durée",val:formation.duree||"—"},{label:"Prix",val:formation.gratuit?"Gratuit":formation.prix?`${formation.prix} DT`:"—"},{label:"Expert",val:formation.expert?.user?.prenom?`${formation.expert.user.prenom} ${formation.expert.user.nom}`:"—"}].map((row,i)=>(
                <div key={i} style={{background:C.white,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}><div style={{fontSize:9.5,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:4}}>{row.label}</div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{row.val}</div></div>
              ))}
            </div>
          </div>
          {formation.description&&<p style={{fontSize:13.5,color:"#334155",lineHeight:1.75,marginBottom:16}}>{formation.description}</p>}
          {formation.image&&<img src={`${BASE}/uploads/formations/${formation.image}`} style={{maxWidth:"100%",maxHeight:200,borderRadius:8,border:`1px solid ${C.border}`,display:"block"}} alt=""/>}
        </div>
        <div style={{padding:"14px 26px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end",background:"#FAFCFE",borderRadius:"0 0 20px 20px"}}>
          <button className="btn btn-red" onClick={()=>onRefuser(formation.id)}>Refuser</button>
          <button className="btn btn-green" onClick={()=>onValider(formation.id)}>Valider et publier</button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL VALIDATION PODCAST ====================
function ModalPodcastValidation({podcast,onClose,onValider,onRefuser}:any){
  if(!podcast) return null;
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{maxWidth:700}} onClick={(e:any)=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg, ${C.sidebar}, ${C.cyan})`,padding:"22px 26px",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:12,background:"rgba(0,151,167,.25)",border:`2px solid ${C.cyan}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.cyan,fontWeight:700}}>V</div><div><div style={{color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Validation vidéo</div><div style={{color:"#fff",fontWeight:800,fontSize:18}}>{podcast.titre}</div></div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",color:"#fff",fontSize:16}}>×</button>
        </div>
        <div style={{padding:"22px 26px",maxHeight:"75vh",overflowY:"auto"}}>
          {podcast.description&&<p style={{fontSize:13.5,color:"#334155",lineHeight:1.75,marginBottom:16}}>{podcast.description}</p>}
          {podcast.url_video&&<div style={{marginBottom:16}}><video src={`${BASE}/uploads/podcasts-audio/${podcast.url_video}`} controls style={{width:"100%",maxHeight:260,borderRadius:8,border:`1px solid ${C.border}`}}/></div>}
          {podcast.image&&<img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} style={{maxWidth:"100%",maxHeight:200,borderRadius:8,border:`1px solid ${C.border}`,display:"block"}} alt=""/>}
        </div>
        <div style={{padding:"14px 26px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end",background:"#FAFCFE",borderRadius:"0 0 20px 20px"}}>
          <button className="btn btn-red" onClick={()=>onRefuser(podcast.id)}>Refuser</button>
          <button className="btn btn-green" onClick={()=>onValider(podcast.id)}>Valider et publier</button>
        </div>
      </div>
    </div>
  );
}

// ==================== ONGLET UTILISATEURS ====================
function UtilisateursView({ startups, experts, onValiderStartup, onRefuserStartup, onValiderExpert, onRefuserExpert, onSetSelectedStartup, onSetSelectedExpert, modificationsAtt, onValiderModification, onRefuserModification }: any) {
  const [subTab, setSubTab] = useState<"startups" | "experts">("startups");
  const enAttenteStartups = startups.filter((s: any) => s.statut === "en_attente");
  const enAttenteExperts = experts.filter((e: any) => e.statut === "en_attente");

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Gestion des comptes</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Utilisateurs</h1>
      </div>
      <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1.5px solid ${C.border}` }}>
          <button onClick={() => setSubTab("startups")} style={{ flex: 1, padding: "14px 22px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: subTab === "startups" ? 800 : 500, color: subTab === "startups" ? C.text : C.textSub, background: subTab === "startups" ? C.white : "#FAFCFE", borderBottom: subTab === "startups" ? `3px solid ${C.orange}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            Startups
            {enAttenteStartups.length > 0 && <span style={{ background: C.orange, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{enAttenteStartups.length}</span>}
          </button>
          <button onClick={() => setSubTab("experts")} style={{ flex: 1, padding: "14px 22px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: subTab === "experts" ? 800 : 500, color: subTab === "experts" ? C.text : C.textSub, background: subTab === "experts" ? C.white : "#FAFCFE", borderBottom: subTab === "experts" ? `3px solid ${C.teal}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            Experts
            {enAttenteExperts.length > 0 && <span style={{ background: C.teal, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{enAttenteExperts.length}</span>}
          </button>
        </div>
        <div style={{ padding: "18px" }}>
          {modificationsAtt.length > 0 && subTab === "experts" && (
            <div style={{ background: C.amberL, border: `1px solid ${C.amber}55`, borderRadius: 14, padding: "16px 20px", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13.5, marginBottom: 11 }}>Modifications en attente ({modificationsAtt.length})</div>
              {modificationsAtt.map((e: any) => (
                <div key={e.id} style={{ background: C.white, borderRadius: 10, padding: "11px 13px", marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar prenom={e.user?.prenom} nom={e.user?.nom} size={34} color={C.amber} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 11, color: C.textSub }}>{e.user?.email}</div></div></div>
                  <div style={{ display: "flex", gap: 6 }}><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => onValiderModification(e.id)}>Valider</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => onRefuserModification(e.id)}>Refuser</button><button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => onSetSelectedExpert(e)}>Voir</button></div>
                </div>
              ))}
            </div>
          )}
          {subTab === "startups" && (
            <DataTable
              title={`Startups — ${startups.length} total · ${enAttenteStartups.length} en attente`}
              columns={[{ key: "user.prenom", label: "Responsable", sortable: true }, { key: "user.email", label: "Email" }, { key: "nom_startup", label: "Startup", sortable: true }, { key: "secteur", label: "Secteur", sortable: true }, { key: "localisation", label: "Localisation", sortable: true }, { key: "taille", label: "Taille" }, { key: "statut", label: "Statut", sortable: true }, { key: "actions", label: "Actions" }]}
              data={startups}
              searchKeys={["user.prenom", "user.nom", "user.email", "nom_startup", "secteur", "localisation"]}
              filters={[{ key: "statut", label: "Filtrer", options: [{ value: "valide", label: "Validé" }, { value: "en_attente", label: "En attente" }, { value: "refuse", label: "Refusé" }] }]}
              renderRow={(s: any) => (
                <tr key={s.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar prenom={s.user?.prenom} nom={s.user?.nom} size={32} color={C.orange} /><span style={{ fontWeight: 700, fontSize: 13 }}>{s.user?.prenom} {s.user?.nom}</span></div></td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{s.user?.email}</td>
                  <td style={{ fontWeight: 700 }}>{s.nom_startup || "—"}</td>
                  <td><span style={{ background: `${C.orange}12`, color: C.orange, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{s.secteur || "—"}</span></td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{s.localisation || s.user?.localisation || "—"}</td>
                  <td style={{ color: C.textSub }}>{s.taille || "—"}</td>
                  <td><StatusBadge statut={s.statut} /></td>
                  <td><div style={{ display: "flex", gap: 5 }}><button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => onSetSelectedStartup(s)}>Voir</button>{s.statut === "en_attente" && (<React.Fragment><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => onValiderStartup(s.id)}>Valider</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => onRefuserStartup(s.id)}>Refuser</button></React.Fragment>)}</div></td>
                </tr>
              )}
              emptyText="Aucune startup"
            />
          )}
          {subTab === "experts" && (
            <DataTable
              title={`Experts — ${experts.length} total · ${enAttenteExperts.length} en attente`}
              columns={[{ key: "user.prenom", label: "Expert", sortable: true }, { key: "user.email", label: "Email", sortable: true }, { key: "domaine", label: "Domaine", sortable: true }, { key: "localisation", label: "Localisation" }, { key: "statut", label: "Statut", sortable: true }, { key: "actions", label: "Actions" }]}
              data={experts} searchKeys={["user.prenom", "user.nom", "user.email", "domaine", "localisation"]}
              filters={[{ key: "statut", label: "Filtrer", options: [{ value: "valide", label: "Validé" }, { value: "en_attente", label: "En attente" }, { value: "refuse", label: "Refusé" }] }]}
              renderRow={(e: any) => (
                <tr key={e.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar prenom={e.user?.prenom} nom={e.user?.nom} size={32} color={C.teal} /><div style={{ fontWeight: 700, fontSize: 13 }}>{e.user?.prenom} {e.user?.nom}</div></div></td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{e.user?.email}</td>
                  <td><span style={{ background: `${C.teal}12`, color: C.tealD, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{e.domaine || "—"}</span></td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{e.localisation || "—"}</td>
                  <td><StatusBadge statut={e.statut} /></td>
                  <td><div style={{ display: "flex", gap: 5 }}><button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => onSetSelectedExpert(e)}>Voir</button>{e.statut === "en_attente" && (<React.Fragment><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => onValiderExpert(e.id)}>Valider</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => onRefuserExpert(e.id)}>Refuser</button></React.Fragment>)}</div></td>
                </tr>
              )}
              emptyText="Aucun expert"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== DEMANDES STARTUPS ====================
function DemandesStartupsView({ demandes, experts, onOpenDemande, onLoadDevisForDemande }: any) {
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const countByService = (key: string) => {
    if (key === "all") return demandes.length;
    return demandes.filter((d: any) => normalizeService(d.service) === key).length;
  };
  const demandesFiltrees = serviceFilter === "all" ? demandes : demandes.filter((d: any) => normalizeService(d.service) === serviceFilter);
  return (
    <div>
      <div style={{ marginBottom: 22 }}><div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Gestion des demandes</div><h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Demandes de services (Startups)</h1></div>
      <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px 0", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Filtrer par service</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 14 }}>
            {SERVICE_FILTERS.map(sf => {
              const count = countByService(sf.key);
              const isActive = serviceFilter === sf.key;
              let color = C.teal;
              if (sf.key === "consulting") color = C.purple;
              else if (sf.key === "audit-sur-site") color = C.orange;
              else if (sf.key === "nos-plateformes") color = C.blueM;
              else if (sf.key === "formation-sur-mesure") color = C.amber;
              else if (sf.key === "formation-existante") color = C.green;
              return (
                <button key={sf.key} onClick={() => setServiceFilter(sf.key)} style={{ padding: "7px 14px", border: `1.5px solid ${isActive ? color : C.border}`, borderRadius: 9, background: isActive ? `${color}15` : C.white, color: isActive ? color : C.textSub, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, transition: "all .15s" }}>
                  <span>{sf.label}</span>
                  <span style={{ background: isActive ? color : "#E5E7EB", color: isActive ? "#fff" : C.textSub, borderRadius: 99, padding: "1px 7px", fontSize: 10.5, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "14px 18px" }}>
          <DataTable
            title={`Demandes de service${serviceFilter !== "all" ? ` — ${SERVICE_FILTERS.find(s => s.key === serviceFilter)?.label}` : ""} (${demandesFiltrees.length})`}
            columns={[{ key: "service", label: "Service", sortable: true }, { key: "user.prenom", label: "Client", sortable: true }, { key: "user.startup.nom_startup", label: "Startup" }, { key: "statut", label: "Statut", sortable: true }, { key: "createdAt", label: "Date", sortable: true }, { key: "actions", label: "" }]}
            data={demandesFiltrees}
            searchKeys={["service", "user.prenom", "user.nom", "user.startup.nom_startup"]}
            filters={[{ key: "statut", label: "Filtrer par statut", options: [{ value: "en_attente", label: "En attente" }, { value: "notifie_experts", label: "Experts notifiés" }, { value: "devis_envoye", label: "Devis envoyé" }, { value: "acceptee", label: "Acceptée" }, { value: "refusee", label: "Refusée" }] }]}
            renderRow={(d: any) => {
              const svcNorm = normalizeService(d.service);
              let svcColor = C.teal;
              if (svcNorm === "consulting") svcColor = C.purple;
              else if (svcNorm === "audit-sur-site") svcColor = C.orange;
              else if (svcNorm === "nos-plateformes") svcColor = C.blueM;
              else if (svcNorm === "formation-sur-mesure") svcColor = C.amber;
              else if (svcNorm === "formation-existante") svcColor = C.green;
              return (
                <tr key={d.id}>
                  <td><div style={{ display: "flex", flexDirection: "column", gap: 3 }}><span style={{ background: `${svcColor}14`, color: svcColor, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, display: "inline-block" }}>{getServiceLabel(d.service)}</span>{svcNorm === "formation-sur-mesure" && <span style={{ fontSize: 10, color: C.amber, fontWeight: 600 }}>Expert requis</span>}{svcNorm === "formation-existante" && d.formation?.places_limitees && <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>{d.formation.places_disponibles > 0 ? `${d.formation.places_disponibles} place(s)` : "Complet"}</span>}</div></td>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar prenom={d.user?.prenom} nom={d.user?.nom} size={30} color={C.blueM} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{d.user?.prenom} {d.user?.nom}</div><div style={{ fontSize: 11, color: C.textSub }}>{d.user?.email}</div></div></div></td>
                  <td>{d.user?.startup?.nom_startup || "—"}</td>
                  <td><StatusBadge statut={d.statut} /></td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td><button className="btn btn-teal" style={{ fontSize: 12, padding: "6px 13px" }} onClick={() => onOpenDemande(d)}>Voir</button></td>
                </tr>
              );
            }}
            emptyText="Aucune demande de service"
          />
        </div>
      </div>
    </div>
  );
}

// ==================== PROPOSITION EXPERTS ====================
function PropositionExpertView({ formationsEnAttente, podcastsEnAttente, onExaminerFormation, onValiderFormation, onRefuserFormation, onExaminerPodcast, onValiderPodcast, onRefuserPodcast }: any) {
  const [subTab, setSubTab] = useState<"formations" | "podcasts">("formations");
  return (
    <div>
      <div style={{ marginBottom: 22 }}><div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Contenu proposé par les experts</div><h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Propositions à valider</h1></div>
      <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1.5px solid ${C.border}` }}>
          <button onClick={() => setSubTab("formations")} style={{ flex: 1, padding: "14px 22px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: subTab === "formations" ? 800 : 500, color: subTab === "formations" ? C.text : C.textSub, background: subTab === "formations" ? C.white : "#FAFCFE", borderBottom: subTab === "formations" ? `3px solid ${C.purple}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            Formations
            {formationsEnAttente.length > 0 && <span style={{ background: C.purple, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{formationsEnAttente.length}</span>}
          </button>
          <button onClick={() => setSubTab("podcasts")} style={{ flex: 1, padding: "14px 22px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: subTab === "podcasts" ? 800 : 500, color: subTab === "podcasts" ? C.text : C.textSub, background: subTab === "podcasts" ? C.white : "#FAFCFE", borderBottom: subTab === "podcasts" ? `3px solid ${C.cyan}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            Podcasts & Vidéos
            {podcastsEnAttente.length > 0 && <span style={{ background: C.cyan, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{podcastsEnAttente.length}</span>}
          </button>
        </div>
        <div style={{ padding: "18px" }}>
          {subTab === "formations" && (
            formationsEnAttente.length === 0 ? (
              <div style={{ padding: "56px 0", textAlign: "center", color: C.textSub }}><div style={{ fontWeight: 700, fontSize: 15 }}>Aucune formation en attente de validation</div></div>
            ) : (
              formationsEnAttente.map((f: any) => (
                <div key={f.id} style={{ border: `1.5px solid ${C.purple}30`, borderRadius: 14, overflow: "hidden", background: C.white, marginBottom: 12 }}>
                  <div style={{ background: `linear-gradient(135deg, ${C.purpleL}, #EDE9FE)`, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>F</div>
                      <div><div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{f.titre}</div><div style={{ fontSize: 11.5, color: C.purple, marginTop: 2 }}>{f.expert?.user?.prenom} {f.expert?.user?.nom} · {f.expert?.domaine}</div></div>
                    </div>
                    <span style={{ background: C.amberL, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#92400E" }}>{new Date(f.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div style={{ padding: "12px 18px", display: "flex", gap: 9, flexWrap: "wrap" }}>
                    <button onClick={() => onExaminerFormation(f)} style={{ flex: 1, minWidth: 120, padding: "8px 13px", border: `1.5px solid ${C.purple}30`, borderRadius: 9, background: C.purpleL, color: C.purple, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Examiner</button>
                    <button onClick={() => onValiderFormation(f.id)} style={{ flex: 1, minWidth: 120, padding: "8px 13px", border: `1.5px solid ${C.greenM}40`, borderRadius: 9, background: C.greenL, color: C.green, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Valider et publier</button>
                    <button onClick={() => onRefuserFormation(f.id)} style={{ padding: "8px 13px", border: `1.5px solid ${C.red}30`, borderRadius: 9, background: C.redL, color: C.red, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Refuser</button>
                  </div>
                </div>
              ))
            )
          )}
          {subTab === "podcasts" && (
            podcastsEnAttente.length === 0 ? (
              <div style={{ padding: "56px 0", textAlign: "center", color: C.textSub }}><div style={{ fontWeight: 700, fontSize: 15 }}>Aucun podcast/vidéo en attente de validation</div></div>
            ) : (
              podcastsEnAttente.map((p: any) => (
                <div key={p.id} style={{ border: `1.5px solid ${C.cyan}30`, borderRadius: 14, overflow: "hidden", background: C.white, marginBottom: 12 }}>
                  <div style={{ background: `linear-gradient(135deg, ${C.cyanL}, #ECFEFF)`, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${C.cyan}, ${C.cyan}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>V</div>
                      <div><div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{p.titre}</div><div style={{ fontSize: 11.5, color: C.cyan, marginTop: 2 }}>{p.expert?.user?.prenom} {p.expert?.user?.nom}</div></div>
                    </div>
                    <span style={{ background: C.amberL, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#92400E" }}>{new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div style={{ padding: "12px 18px" }}>
                    {p.url_video && <div style={{ background: "#F0F4F8", borderRadius: 9, padding: "9px 13px", marginBottom: 10 }}><video src={`${BASE}/uploads/podcasts-audio/${p.url_video}`} controls style={{ width: "100%", maxHeight: 160, borderRadius: 6 }} /></div>}
                    <div style={{ display: "flex", gap: 9 }}>
                      <button onClick={() => onExaminerPodcast(p)} style={{ flex: 1, padding: "8px 13px", border: `1.5px solid ${C.cyan}30`, borderRadius: 9, background: C.cyanL, color: C.cyan, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Examiner</button>
                      <button onClick={() => onValiderPodcast(p.id)} style={{ flex: 1, padding: "8px 13px", border: `1.5px solid ${C.greenM}40`, borderRadius: 9, background: C.greenL, color: C.green, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Valider et publier</button>
                      <button onClick={() => onRefuserPodcast(p.id)} style={{ padding: "8px 13px", border: `1.5px solid ${C.red}30`, borderRadius: 9, background: C.redL, color: C.red, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>Refuser</button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== CONTENU ACCUEIL (Articles, Media, Page d'accueil) ====================
function ContenuAccueilView({ token, articles, medias, onPublierArticle, onSupprimerArticle, onEditArticle, onAddArticle, onEditMedia, onSupprimerMedia, onAddMedia }: any) {
  const [subTab, setSubTab] = useState<"blog" | "media" | "pages">("blog");
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Gestion du contenu</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Contenu d'accueil de la plateforme</h1>
      </div>
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "6px", marginBottom: 28, width: "fit-content" }}>
        <button onClick={() => setSubTab("blog")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: subTab === "blog" ? 800 : 600, background: subTab === "blog" ? C.blueM : "transparent", color: subTab === "blog" ? "#fff" : C.textSub, transition: "all .2s" }}>
          <FaNewspaper style={{ marginRight: 8 }} /> Articles
        </button>
        <button onClick={() => setSubTab("media")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: subTab === "media" ? 800 : 600, background: subTab === "media" ? C.red : "transparent", color: subTab === "media" ? "#fff" : C.textSub, transition: "all .2s" }}>
          <FaVideo style={{ marginRight: 8 }} /> Média
        </button>
        <button onClick={() => setSubTab("pages")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: subTab === "pages" ? 800 : 600, background: subTab === "pages" ? C.teal : "transparent", color: subTab === "pages" ? "#fff" : C.textSub, transition: "all .2s" }}>
          <FaEnvelope style={{ marginRight: 8 }} /> Page d'accueil
        </button>
      </div>
      {subTab === "blog" && (
        <DataTable
          title={`Articles — ${articles.length} articles`}
          columns={[{ key: "titre", label: "Titre", sortable: true }, { key: "type", label: "Type", sortable: true }, { key: "categorie", label: "Catégorie", sortable: true }, { key: "image", label: "Image" }, { key: "pdf", label: "PDF" }, { key: "statut", label: "Statut", sortable: true }, { key: "actions", label: "Actions" }]}
          data={articles} searchKeys={["titre", "description", "categorie"]}
          filters={[{ key: "statut", label: "Filtrer", options: [{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }, { value: "archive", label: "Archivé" }] }, { key: "type", label: "Type", options: [{ value: "article", label: "Article" }, { value: "conseil", label: "Conseil" }] }]}
          actions={<button className="btn btn-teal" style={{ fontSize: 12 }} onClick={onAddArticle}>Nouvel article</button>}
          renderRow={(a: any) => (
            <tr key={a.id}>
              <td><div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{a.titre}</div><div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{(a.description || "").slice(0, 60)}{(a.description || "").length > 60 ? "..." : ""}</div></td>
              <td><span style={{ background: C.blueL, color: C.blue, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{a.type}</span></td>
              <td style={{ color: C.textSub }}>{a.categorie || "—"}</td>
              <td>{a.image ? <a href={`${BASE}/uploads/articles-img/${a.image}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.tealL, color: C.tealD, textDecoration: "none", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}><FaImage />Image</a> : <span style={{ color: C.textSub, fontSize: 11 }}>—</span>}</td>
              <td>{a.pdf ? <a href={`${BASE}/uploads/articles-pdf/${a.pdf}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.cyanL, color: C.cyan, textDecoration: "none", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}><FaFilePdf />PDF</a> : <span style={{ color: C.textSub, fontSize: 11 }}>—</span>}</td>
              <td><StatusBadge statut={a.statut} /></td>
              <td><div style={{ display: "flex", gap: 5 }}>{a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => onPublierArticle(a.id)}>Publier</button>}<button className="btn btn-teal" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => onEditArticle(a)}>Modifier</button><button className="btn btn-red" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => onSupprimerArticle(a.id)}>Supprimer</button></div></td>
            </tr>
          )}
          emptyText="Aucun article"
        />
      )}
      {subTab === "media" && (
        <DataTable
          title={`Médias — ${medias.length} éléments`}
          columns={[{ key: "titre", label: "Titre", sortable: true }, { key: "emission", label: "Émission" }, { key: "date_publication", label: "Date" }, { key: "statut", label: "Statut" }, { key: "actions", label: "" }]}
          data={medias} searchKeys={["titre", "description", "emission"]}
          filters={[{ key: "statut", label: "Filtrer", options: [{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }] }]}
          actions={<button className="btn btn-teal" style={{ fontSize: 12 }} onClick={onAddMedia}>Ajouter un média</button>}
          renderRow={(m: any) => (
            <tr key={m.id}>
              <td><div style={{ fontWeight: 700, fontSize: 13 }}>{m.titre}</div><div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{m.description?.slice(0, 60)}</div></td>
              <td style={{ color: C.textSub }}>{m.emission || "—"}</td>
              <td style={{ fontSize: 12, color: C.textSub }}>{new Date(m.date_publication).toLocaleDateString("fr-FR")}</td>
              <td><StatusBadge statut={m.statut} /></td>
              <td><div style={{ display: "flex", gap: 5 }}><button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => onEditMedia(m)}>Modifier</button><button className="btn btn-red" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => onSupprimerMedia(m.id)}>Supprimer</button></div></td>
            </tr>
          )}
          emptyText="Aucun média"
        />
      )}
      {subTab === "pages" && <ContenuPlateformeView token={token} />}
    </div>
  );
}

// ==================== CONTENU PLATEFORME (Page d'accueil, À propos, Contact) ====================
function ContenuPlateformeView({ token }: { token: string }) {
  const [activeSection, setActiveSection] = useState<"histoire" | "contact">("histoire");
  const [hForm, setHForm] = useState<any>({});
  const [savingH, setSavingH] = useState(false);
  const [contactConfig, setContactConfig] = useState<any>(null);
  const [savingContact, setSavingContact] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });

  const notify = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3000);
  };

  const hf = (k: string) => hForm[k] || "";
  const setHF = (k: string, v: string) => setHForm((p: any) => ({ ...p, [k]: v }));

  const loadHistoire = async () => {
    try {
      const res = await fetch(`${BASE}/histoire`);
      if (res.ok) setHForm(await res.json());
    } catch (error) {
      console.error("Erreur chargement histoire:", error);
    }
  };

  const loadContactConfig = async () => {
    try {
      const res = await fetch(`${BASE}/contact/config`);
      if (res.ok) setContactConfig(await res.json());
    } catch (error) {
      console.error("Erreur chargement contact config:", error);
    }
  };

  useEffect(() => {
    loadHistoire();
    loadContactConfig();
  }, []);

  const saveHistoire = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingH(true);
    try {
      const res = await fetch(`${BASE}/histoire`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(hForm),
      });
      if (res.ok) {
        notify("✅ Page À propos mise à jour !");
        loadHistoire();
      } else {
        notify("❌ Erreur lors de la sauvegarde", false);
      }
    } catch {
      notify("❌ Erreur réseau", false);
    }
    setSavingH(false);
  };

  const saveContactConfig = async () => {
    setSavingContact(true);
    try {
      const res = await fetch(`${BASE}/contact/config`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(contactConfig),
      });
      if (res.ok) {
        notify("✅ Page Contact mise à jour !");
        loadContactConfig();
      } else {
        notify("❌ Erreur lors de la sauvegarde", false);
      }
    } catch {
      notify("❌ Erreur réseau", false);
    }
    setSavingContact(false);
  };

  return (
    <div>
      {toast.text && (
        <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, background: C.white, border: `1px solid ${toast.ok ? C.greenM + "50" : C.red + "50"}`, borderLeft: `4px solid ${toast.ok ? C.greenM : C.red}`, color: toast.ok ? C.green : C.red, borderRadius: 12, padding: "13px 18px", fontWeight: 700, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,.09)", maxWidth: 360 }}>
          {toast.text}
        </div>
      )}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Gestion du contenu</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Contenu de la Plateforme</h1>
          <p style={{ fontSize: 12.5, color: C.textSub, marginTop: 4 }}>Gérez les pages À propos et Contact</p>
        </div>
        <a href="/a-propos" target="_blank" className="btn btn-gray" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Voir la page À propos →</a>
      </div>
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "6px", marginBottom: 28, width: "fit-content" }}>
        <button onClick={() => setActiveSection("histoire")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: activeSection === "histoire" ? 800 : 600, background: activeSection === "histoire" ? C.teal : "transparent", color: activeSection === "histoire" ? "#fff" : C.textSub, transition: "all .2s" }}><FaNewspaper style={{ marginRight: 8 }} /> Page À propos</button>
        <button onClick={() => setActiveSection("contact")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: activeSection === "contact" ? 800 : 600, background: activeSection === "contact" ? C.blueM : "transparent", color: activeSection === "contact" ? "#fff" : C.textSub, transition: "all .2s" }}><FaEnvelope style={{ marginRight: 8 }} /> Page Contact</button>
      </div>
      {activeSection === "histoire" && (
        <form onSubmit={saveHistoire}>
          <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F7B500" }} /><span style={{ fontWeight: 800, fontSize: 13.5, color: C.text }}>Section Hero</span></div>
            <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, alignItems: "start" }}>
              <HField label="Année de création" cle="annee_creation" hf={hf} setHF={setHF} placeholder="2019" />
              <HField label="Description principale" cle="description_hero" rows={3} hf={hf} setHF={setHF} placeholder="Depuis 2019, nous connectons les startups…" />
            </div>
          </div>
          <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} /><span style={{ fontWeight: 800, fontSize: 13.5, color: C.text }}>Section Vision</span></div>
            <div style={{ padding: "18px 20px" }}>
              <HField label="Description vision" cle="description_vision" rows={3} hf={hf} setHF={setHF} placeholder="Notre vision est de créer un écosystème…" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                <HField label="Point fort 1" cle="vision_point1" hf={hf} setHF={setHF} placeholder="Accès universel à l'expertise…" />
                <HField label="Point fort 2" cle="vision_point2" hf={hf} setHF={setHF} placeholder="Réseau pan-africain…" />
                <HField label="Point fort 3" cle="vision_point3" hf={hf} setHF={setHF} placeholder="Technologie au service…" />
                <HField label="Point fort 4" cle="vision_point4" hf={hf} setHF={setHF} placeholder="1 000 startups à horizon 2027" />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 11, padding: "6px 0 4px" }}>
            <button type="button" className="btn btn-gray" onClick={loadHistoire}>Annuler les changements</button>
            <button type="submit" className="btn btn-teal" disabled={savingH} style={{ padding: "10px 28px", fontSize: 14 }}>{savingH ? "Sauvegarde en cours..." : "💾 Sauvegarder"}</button>
          </div>
        </form>
      )}
      {activeSection === "contact" && (
        <ContactConfigForm contactConfig={contactConfig} setContactConfig={setContactConfig} onSave={saveContactConfig} saving={savingContact} />
      )}
    </div>
  );
}

function ContactConfigForm({ contactConfig, setContactConfig, onSave, saving }: any) {
  const [form, setForm] = useState({
    email: contactConfig?.email || "contact@beh.com",
    telephone: contactConfig?.telephone || "+216 29 524 360",
    adresse: contactConfig?.adresse || "Tunis, Tunisie",
    horaires: contactConfig?.horaires || "Lun - Ven : 9h00 - 18h00",
    description_hero: contactConfig?.description_hero || "Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.",
    latitude: contactConfig?.latitude || "36.8065",
    longitude: contactConfig?.longitude || "10.1815",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setContactConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: "13px 20px", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F7B500" }} />
        <span style={{ fontWeight: 800, fontSize: 13.5, color: C.text }}>Page Contact — Informations modifiables</span>
      </div>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label className="lbl">Email de contact</label><div className="field-icon-wrap" style={{ position: "relative" }}><FaEnvelopeIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} /><input type="email" className="inp" value={form.email} onChange={e => handleChange("email", e.target.value)} style={{ paddingLeft: 38 }} /></div></div>
          <div><label className="lbl">Téléphone</label><div className="field-icon-wrap" style={{ position: "relative" }}><FaPhone style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} /><input type="text" className="inp" value={form.telephone} onChange={e => handleChange("telephone", e.target.value)} style={{ paddingLeft: 38 }} /></div></div>
          <div><label className="lbl">Adresse</label><div className="field-icon-wrap" style={{ position: "relative" }}><FaMapIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} /><input type="text" className="inp" value={form.adresse} onChange={e => handleChange("adresse", e.target.value)} style={{ paddingLeft: 38 }} /></div></div>
          <div><label className="lbl">Horaires</label><div className="field-icon-wrap" style={{ position: "relative" }}><FaClock style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }} /><input type="text" className="inp" value={form.horaires} onChange={e => handleChange("horaires", e.target.value)} style={{ paddingLeft: 38 }} /></div></div>
          <div style={{ gridColumn: "span 2" }}><label className="lbl">Description Hero</label><textarea className="inp" rows={2} value={form.description_hero} onChange={e => handleChange("description_hero", e.target.value)} /></div>
          <div><label className="lbl">Latitude (carte Google Maps)</label><input type="text" className="inp" value={form.latitude} onChange={e => handleChange("latitude", e.target.value)} placeholder="36.8065" /></div>
          <div><label className="lbl">Longitude (carte Google Maps)</label><input type="text" className="inp" value={form.longitude} onChange={e => handleChange("longitude", e.target.value)} placeholder="10.1815" /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button className="btn btn-gray" onClick={() => window.location.reload()}>Annuler</button>
          <button className="btn btn-teal" onClick={onSave} disabled={saving}>{saving ? "Sauvegarde..." : "💾 Sauvegarder"}</button>
        </div>
      </div>
    </div>
  );
}

// ==================== SERVICES VIEW ====================
function ServicesView({
  formations,
  podcasts,
  onPublierFormation,
  onArchiverFormation,
  onSupprimerFormation,
  onEditFormation,
  onAddFormation,
  onPublierPodcast,
  onArchiverPodcast,
  onSupprimerPodcast,
  onEditPodcast,
  onAddPodcast
}: any) {
  const [subTab, setSubTab] = useState<"formations" | "podcasts">("formations");
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Gestion des offres</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Services</h1>
        <p style={{ fontSize: 12.5, color: C.textSub, marginTop: 4 }}>Créez et gérez les formations et podcasts proposés aux startups</p>
      </div>
      <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1.5px solid ${C.border}` }}>
          <button
            onClick={() => setSubTab("formations")}
            style={{
              flex: 1,
              padding: "14px 22px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: subTab === "formations" ? 800 : 500,
              color: subTab === "formations" ? C.text : C.textSub,
              background: subTab === "formations" ? C.white : "#FAFCFE",
              borderBottom: subTab === "formations" ? `3px solid ${C.purple}` : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            <FaChalkboardTeacher /> Formations
            <span style={{ background: C.purple + "20", color: C.purple, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{formations.length}</span>
          </button>
          <button
            onClick={() => setSubTab("podcasts")}
            style={{
              flex: 1,
              padding: "14px 22px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: subTab === "podcasts" ? 800 : 500,
              color: subTab === "podcasts" ? C.text : C.textSub,
              background: subTab === "podcasts" ? C.white : "#FAFCFE",
              borderBottom: subTab === "podcasts" ? `3px solid ${C.cyan}` : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            <FaPodcast /> Podcasts & Vidéos
            <span style={{ background: C.cyan + "20", color: C.cyan, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{podcasts.length}</span>
          </button>
        </div>
        <div style={{ padding: "18px" }}>
          {subTab === "formations" && (
            <DataTable
              title={`Formations — ${formations.length} au total`}
              columns={[
                { key: "titre", label: "Formation", sortable: true },
                { key: "domaine", label: "Domaine", sortable: true },
                { key: "formateurs", label: "Formateur(s)" },
                { key: "mode", label: "Mode", sortable: true },
                { key: "prix", label: "Prix" },
                { key: "statut", label: "Statut", sortable: true },
                { key: "actions", label: "Actions" }
              ]}
              data={formations}
              searchKeys={["titre", "domaine", "description", "formateur"]}
              filters={[
                { key: "statut", label: "Tous les statuts", options: [{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }, { value: "archive", label: "Archivé" }] },
                { key: "mode", label: "Tous les modes", options: [{ value: "en_ligne", label: "En ligne" }, { value: "presentiel", label: "Présentiel" }, { value: "hybride", label: "Hybride" }] }
              ]}
              actions={<button className="btn btn-teal" style={{ fontSize: 12 }} onClick={onAddFormation}>Nouvelle formation</button>}
              renderRow={(f: any) => {
                // Afficher les formateurs correctement
                let formateursText = "—";
                if (f.formateur_details && Array.isArray(f.formateur_details) && f.formateur_details.length > 0) {
                  formateursText = f.formateur_details.map((fd: any) => `${fd.prenom} ${fd.nom}`.trim()).join(", ");
                } else if (f.formateur && f.formateur.trim()) {
                  formateursText = f.formateur;
                }
                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        {f.image ? <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} alt="" /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>F</div>}
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{f.titre}</div>
                      </div>
                    </td>
                    <td><span style={{ background: `${C.purple}12`, color: C.purple, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{f.domaine || "—"}</span></td>
                    <td><span style={{ color: C.textSub, fontSize: 12 }}>{formateursText}</span></td>
                    <td><span style={{ color: C.textSub, fontSize: 12 }}>{f.mode === "en_ligne" ? "En ligne" : f.mode === "presentiel" ? "Présentiel" : f.mode || "—"}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{f.gratuit ? <span style={{ color: C.greenM }}>Gratuit</span> : f.prix ? `${f.prix} DT` : "—"}</span></td>
                    <td><StatusBadge statut={f.statut} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {f.statut !== "publie" && <button className="btn btn-green" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onPublierFormation(f.id)}>Publier</button>}
                        {f.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onArchiverFormation(f.id)}>Archiver</button>}
                        {!f.expert_id && <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onEditFormation(f)}>Modifier</button>}
                        <button className="btn btn-red" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onSupprimerFormation(f.id)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              }}
              emptyText="Aucune formation"
            />
          )}
          {subTab === "podcasts" && (
            <DataTable
              title={`Podcasts et Vidéos — ${podcasts.length} au total`}
              columns={[
                { key: "titre", label: "Titre", sortable: true },
                { key: "auteur", label: "Auteur", sortable: true },
                { key: "domaine", label: "Domaine", sortable: true },
                { key: "type_media", label: "Format" },
                { key: "statut", label: "Statut", sortable: true },
                { key: "actions", label: "Actions" }
              ]}
              data={podcasts}
              searchKeys={["titre", "auteur", "domaine", "description"]}
              filters={[{ key: "statut", label: "Statut", options: [{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }, { value: "archive", label: "Archivé" }] }]}
              actions={<button className="btn btn-cyan" style={{ fontSize: 12 }} onClick={onAddPodcast}>Ajouter un podcast</button>}
              renderRow={(p: any) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyan}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>V</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.titre}</div>
                    </div>
                  </td>
                  <td style={{ color: C.textSub }}>{p.auteur || "—"}</td>
                  <td><span style={{ background: `${C.cyan}12`, color: C.cyan, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{p.domaine || "—"}</span></td>
                  <td>{p.url_audio && p.url_audio.startsWith("http") ? <span style={{ background: `${C.blueM}12`, color: C.blueM, borderRadius: 6, padding: "2px 9px", fontSize: 11.5, fontWeight: 700 }}>Lien</span> : <span style={{ background: `${C.purple}12`, color: C.purple, borderRadius: 6, padding: "2px 9px", fontSize: 11.5, fontWeight: 700 }}>MP4</span>}</td>
                  <td><StatusBadge statut={p.statut} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {p.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onPublierPodcast(p.id)}>Publier</button>}
                      {p.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onArchiverPodcast(p.id)}>Archiver</button>}
                      {!p.expert_id && <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onEditPodcast(p)}>Modifier</button>}
                      <button className="btn btn-red" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => onSupprimerPodcast(p.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              )}
              emptyText="Aucun podcast"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ADMIN ====================
export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [realUser, setRealUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [selectedExpertProfile, setSelectedExpertProfile] = useState<any>(null);
  const [selectedFormationValidation, setSelectedFormationValidation] = useState<any>(null);
  const [selectedPodcastValidation, setSelectedPodcastValidation] = useState<any>(null);
  const [showFormationForm, setShowFormationForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [replyModal, setReplyModal] = useState<any>({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [devisCache, setDevisCache] = useState<Record<number, any[]>>({});

  const tokenVal = () => (typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "");
  const hdr = () => ({ Authorization: `Bearer ${tokenVal()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tokenVal()}`, "Content-Type": "application/json" });
  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  useEffect(() => {
    const h1 = () => setIsOnline(true), h2 = () => setIsOnline(false);
    window.addEventListener("online", h1); window.addEventListener("offline", h2);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener("online", h1); window.removeEventListener("offline", h2); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = tokenVal();
    if (!t) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(async res => {
        if (!res.ok) { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        const user = await res.json();
        if (user.role !== "admin") { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        setRealUser(user);
        loadAll(); loadArticles(); loadContactMessages(); loadFormations(); loadPodcasts(); loadDemandes(); loadMedias();
      })
      .catch(() => { localStorage.removeItem("access_token"); router.replace("/connexion"); })
      .finally(() => setLoadingAuth(false));
  }, []);

  async function loadAll() { setLoading(true); try { const [e, s, t] = await Promise.all([fetch(`${BASE}/admin/experts?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()), fetch(`${BASE}/admin/startups?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()), fetch(`${BASE}/temoignages/all?_=${Date.now()}`, { headers: hdr() }).then(r => r.json())]); setExperts(Array.isArray(e) ? e : []); setStartups(Array.isArray(s) ? s : []); setTemoignages(Array.isArray(t) ? t : []); } catch { notify("Erreur chargement", false); } setLoading(false); }
  async function loadFormations() { try { const r = await fetch(`${BASE}/formations/admin/all?_=${Date.now()}`, { headers: hdr() }); setFormations(r.ok ? await r.json() : []); } catch { setFormations([]); } }
  async function loadPodcasts() { try { const r = await fetch(`${BASE}/admin/podcasts/all?_=${Date.now()}`, { headers: hdr() }); let all = r.ok ? await r.json() : []; all = all.filter((p: any) => p.type_media === "video" || !p.type_media); setPodcasts(all); } catch { setPodcasts([]); } }
  async function loadDemandes() { try { const r = await fetch(`${BASE}/demandes-service/all?_=${Date.now()}`, { headers: hdr() }); setDemandes(r.ok ? await r.json() : []); } catch { setDemandes([]); } }
  async function loadArticles() { try { const r = await fetch(`${BASE}/articles/admin/all?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setArticles(await r.json()); } catch { } }
  async function loadContactMessages() { try { const r = await fetch(`${BASE}/contact/messages?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setContactMsgs(await r.json()); } catch { } }
  async function loadMedias() { try { const r = await fetch(`${BASE}/admin/medias/all`, { headers: hdr() }); setMedias(r.ok ? await r.json() : []); } catch { setMedias([]); } }
  async function loadDevisForDemande(demandeId: number) { if (devisCache[demandeId]) return devisCache[demandeId]; try { const r = await fetch(`${BASE}/devis/admin/by-demande/${demandeId}`, { headers: hdr() }); const data = r.ok ? await r.json() : []; setDevisCache(prev => ({ ...prev, [demandeId]: data })); return data; } catch { return []; } }

  async function supprimerMedia(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/admin/medias/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadMedias(); } else notify("Erreur", false); }
  async function valider(type: string, id: number) { if (!confirm("Valider ?")) return; const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Validé !"); setSelectedExpert(null); setSelectedStartup(null); loadAll(); } else { notify("Erreur", false); } }
  async function refuser(type: string, id: number) { if (!confirm("Refuser ?")) return; const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("❌ Refusé"); setSelectedExpert(null); setSelectedStartup(null); loadAll(); } else { notify("Erreur", false); } }
  async function validerModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/valider-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("Modification validée"); else notify("Erreur", false); loadAll(); }
  async function refuserModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/refuser-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("Modification refusée"); else notify("Erreur", false); loadAll(); }
  async function validerTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Publié !"); loadAll(); } else notify("Erreur", false); }
  async function refuserTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); loadAll(); } else notify("Erreur", false); }
  async function supprimerTemo(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/temoignages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) notify("Supprimé"); loadAll(); }
  async function marquerLu(id: number) { const r = await fetch(`${BASE}/contact/messages/${id}/lu`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Lu"); loadContactMessages(); } else notify("Erreur", false); }
  async function supprimerMessage(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/contact/messages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadContactMessages(); } else notify("Erreur", false); }
  async function envoyerReponse(e: React.FormEvent) { e.preventDefault(); if (!replyText.trim()) { notify("Écrivez une réponse", false); return; } setSendingReply(true); try { const r = await fetch(`${BASE}/contact/messages/${replyModal.messageId}/repondre`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ reponse: replyText }) }); if (r.ok) { notify("Envoyé !"); setReplyModal({ open: false, messageId: 0, email: "", nom: "", prenom: "" }); setReplyText(""); loadContactMessages(); } else notify("Erreur", false); } catch { notify("Erreur", false); } setSendingReply(false); }
  async function changerStatutDemande(id: number, statut: string) { const body: any = { statut }; const r = await fetch(`${BASE}/demandes-service/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) }); if (r.ok) { notify("Statut mis à jour"); setSelectedDemande(null); loadDemandes(); } else notify("Erreur", false); }
  async function accepterFormationDemande(demandeId: number) { const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, { method: "PATCH", headers: hdrJ() }); if (r.ok) { notify("Acceptée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false); }
  async function refuserFormationDemande(demandeId: number) { if (!confirm("Refuser ?")) return; const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, { method: "PATCH", headers: hdrJ() }); if (r.ok) { notify("Refusée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false); }
  async function notifierExperts(demandeId: number, expertIds: number[]) {
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/notifier-experts`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_ids: expertIds }) });
      if (r.ok) {
        await changerStatutDemande(demandeId, "notifie_experts");
        notify(`${expertIds.length} expert(s) notifié(s)`);
        await loadDemandes();
        setSelectedDemande((prev: any) => prev && prev.id === demandeId ? { ...prev, experts_notifies: [...(prev.experts_notifies || []), ...expertIds] } : prev);
      } else {
        const err = await r.text();
        notify(`Erreur : ${err}`, false);
      }
    } catch { notify("Erreur réseau", false); }
  }
  function getDemandeDomaine(demande: any): string { if (demande.domaine) return demande.domaine; const match = demande.description?.match(/\[Domaine:\s*([^\]]+)\]/i); return match ? match[1] : "Autre"; }
  async function publierFormationExpert(id: number) { try { let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("Formation publiée !"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function refuserFormationExpert(id: number) { if (!confirm("Refuser ?")) return; try { let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (r.ok) { notify("Refusée"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function publierPodcastExpert(id: number) { try { let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("Média publié !"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function refuserPodcastExpert(id: number) { if (!confirm("Refuser ?")) return; try { let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (r.ok) { notify("Refusé"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function publierFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("Publiée"); else notify("Erreur", false); loadFormations(); }
  async function archiverFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("Archivée"); else notify("Erreur", false); loadFormations(); }
  async function supprimerFormation(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimée"); loadFormations(); } else notify("Erreur", false); }
  async function publierPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("Publié"); else notify("Erreur", false); loadPodcasts(); }
  async function archiverPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("Archivé"); else notify("Erreur", false); loadPodcasts(); }
  async function supprimerPodcast(id: number) { if (!confirm("Supprimer ?")) return; let r = await fetch(`${BASE}/admin/podcasts/${id}`, { method: "DELETE", headers: hdr() }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadPodcasts(); } else notify("Erreur", false); }
  async function publierArticle(id: number) { const r = await fetch(`${BASE}/articles/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("Publié"); loadArticles(); } else { const err = await r.text(); notify(`Erreur: ${err || "impossible"}`, false); } }
  async function supprimerArticle(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/articles/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadArticles(); } else notify("Erreur", false); }

  const enAttenteExperts = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAtt = experts.filter(e => e.modification_demandee);
  const temosAttente = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus = contactMsgs.filter(m => !m.is_read).length;
  const brouillons = articles.filter(a => a.statut === "brouillon").length;
  const formationsEnAttenteExpert = formations.filter(f => f.statut !== "publie" && f.statut !== "archive");
  const podcastsEnAttenteExpert = podcasts.filter(p => p.statut !== "publie" && p.statut !== "archive");
  const totalNotifs = enAttenteExperts.length + enAttenteStartups.length + modificationsAtt.length + temosAttente.length + brouillons + formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + msgsNonLus + demandes.filter(d => d.statut === "en_attente").length;

  const navItems: { id: Tab; label: string; count?: number; color: string }[] = [
    { id: "dashboard", label: "Tableau de bord", color: C.teal },
    { id: "utilisateurs", label: "Utilisateurs", count: enAttenteExperts.length + enAttenteStartups.length, color: C.orange },
    { id: "demandes", label: "Demandes", count: demandes.filter(d => d.statut === "en_attente").length, color: C.blueM },
    { id: "proposition", label: "Proposition", count: formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length, color: C.purple },
    { id: "services", label: "Services", count: 0, color: "#8B5CF6" },
    { id: "temoignages", label: "Témoignages", count: temosAttente.length, color: C.amber },
    { id: "contacts", label: "Messages", count: msgsNonLus, color: C.greenM },
    { id: "contenu_accueil", label: "Contenu d'accueil", color: "#8B5CF6" },
  ];

  if (loadingAuth) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement...</div>;
  if (!realUser || realUser.role !== "admin") return null;

  // Rendu principal
  return (
    <React.Fragment>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.text};}
        .inp{width:100%;padding:9px 13px;border:1.5px solid ${C.border};border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;transition:all .18s;background:#FAFCFE;color:${C.text};outline:none;}
        .inp:focus{border-color:${C.teal};box-shadow:0 0 0 3px ${C.teal}18;}
        textarea.inp{resize:vertical;}
        select.inp{cursor:pointer;}
        .lbl{font-size:10.5px;font-weight:700;color:${C.textSub};textTransform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:5px;}
        .btn{font-family:'DM Sans',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;padding:8px 15px;font-size:13px;transition:all .16s;display:inline-flex;align-items:center;gap:6px;line-height:1.4;}
        .btn-teal{background:${C.teal};color:#fff;}.btn-teal:hover{background:${C.tealD};}
        .btn-green{background:${C.greenL};color:${C.green};}.btn-green:hover{background:${C.greenM};color:#fff;}
        .btn-red{background:${C.redL};color:${C.red};}.btn-red:hover{background:${C.red};color:#fff;}
        .btn-blue{background:${C.blueL};color:${C.blue};}.btn-blue:hover{background:${C.blue};color:#fff;}
        .btn-cyan{background:${C.cyan};color:#fff;}.btn-cyan:hover{opacity:.9;}
        .btn-gray{background:#F1F5F9;color:${C.textSub};}.btn-gray:hover{background:${C.border};}
        .btn-orange{background:${C.orange};color:#fff;}.btn-orange:hover{opacity:.9;}
        .btn-purple{background:${C.purple};color:#fff;}.btn-purple:hover{opacity:.9;}
        .modal-bg{position:fixed;inset:0;background:rgba(27,58,75,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(5px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 70px rgba(27,58,75,.22);}
        .upload-zone{display:block;border:2px dashed ${C.border};border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:${C.teal};}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;font-size:10.5px;font-weight:700;color:${C.textSub};text-transform:uppercase;padding:10px 15px;border-bottom:1.5px solid ${C.border};letter-spacing:.7px;white-space:nowrap;}
        td{padding:12px 15px;border-bottom:1px solid #F6F9FC;font-size:13px;color:${C.text};vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#F8FBFE;}
        ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn .25s ease;}
        .sidebar-btn{width:100%;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:600;color:rgba(255,255,255,.5);background:transparent;transition:all .18s;text-align:left;position:relative;}
        .sidebar-btn:hover{background:rgba(255,255,255,.07);color:#fff;}
        .sidebar-btn.active{background:rgba(247,181,0,.14);color:#F7B500;font-weight:800;}
        .field-icon-wrap{position:relative;}
        .field-icon-wrap .field-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:14px;pointer-events:none;}
        .field-icon-wrap .inp{padding-left:38px;}
      `}</style>

      {toast.text && <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, background: C.white, border: `1px solid ${toast.ok ? C.greenM + "50" : C.red + "50"}`, borderLeft: `4px solid ${toast.ok ? C.greenM : C.red}`, color: toast.ok ? C.green : C.red, borderRadius: 12, padding: "13px 18px", fontWeight: 700, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,.09)", maxWidth: 360, animation: "slideIn .2s ease" }}>{toast.text}</div>}

      {selectedExpert && <ModalExpertDetail expert={selectedExpert} onClose={() => setSelectedExpert(null)} onValider={(id: number) => valider("experts", id)} onRefuser={(id: number) => refuser("experts", id)} />}
      {selectedStartup && <ModalStartupDetail startup={selectedStartup} onClose={() => setSelectedStartup(null)} onValider={(id: number) => valider("startups", id)} onRefuser={(id: number) => refuser("startups", id)} />}
      {selectedDemande && <ModalDemandeService demande={selectedDemande} experts={experts} onNotifierExperts={notifierExperts} onAccepterFormation={accepterFormationDemande} onRefuserFormation={refuserFormationDemande} onClose={() => { setSelectedDemande(null); }} getDemandeDomaine={getDemandeDomaine} setSelectedExpertProfile={setSelectedExpertProfile} devisList={devisCache[selectedDemande?.id] || []} onLoadDevis={loadDevisForDemande} />}
      {selectedExpertProfile && <ModalExpertDetail expert={selectedExpertProfile} onClose={() => setSelectedExpertProfile(null)} onValider={(id: number) => valider("experts", id)} onRefuser={(id: number) => refuser("experts", id)} />}
      {showFormationForm && <FormationFormModal formation={editingFormation} onClose={() => { setShowFormationForm(false); setEditingFormation(null); }} onSave={() => loadFormations()} />}
      {showPodcastForm && <PodcastFormModal podcast={editingPodcast} onClose={() => { setShowPodcastForm(false); setEditingPodcast(null); }} onSave={() => loadPodcasts()} />}
      {showArticleModal && <ArticleFormModal editingArticle={editingArticle} categoriesPredefinies={["Développement", "Intelligence artificielle", "Business", "Sécurité", "Design", "Autre"]} onClose={() => { setShowArticleModal(false); setEditingArticle(null); }} onSave={() => loadArticles()} />}
      {selectedFormationValidation && <ModalFormationValidation formation={selectedFormationValidation} onClose={() => setSelectedFormationValidation(null)} onValider={publierFormationExpert} onRefuser={refuserFormationExpert} />}
      {selectedPodcastValidation && <ModalPodcastValidation podcast={selectedPodcastValidation} onClose={() => setSelectedPodcastValidation(null)} onValider={publierPodcastExpert} onRefuser={refuserPodcastExpert} />}
      {replyModal.open && (
        <div className="modal-bg" onClick={() => setReplyModal({ ...replyModal, open: false })}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFCFE", borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Répondre à {replyModal.prenom} {replyModal.nom}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => setReplyModal({ ...replyModal, open: false })}>×</button>
            </div>
            <form onSubmit={envoyerReponse} style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 12 }}><label className="lbl">Email</label><input className="inp" value={replyModal.email} disabled /></div>
              <div style={{ marginBottom: 16 }}><label className="lbl">Réponse *</label><textarea className="inp" rows={6} value={replyText} onChange={e => setReplyText(e.target.value)} required /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={() => setReplyModal({ ...replyModal, open: false })}>Annuler</button><button type="submit" className="btn btn-teal" disabled={sendingReply}>{sendingReply ? "Envoi en cours..." : "Envoyer"}</button></div>
            </form>
          </div>
        </div>
      )}
      {showMediaModal && <MediaModal media={editingMedia} onClose={() => { setShowMediaModal(false); setEditingMedia(null); }} onSave={() => loadMedias()} />}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: sideCollapsed ? 64 : 240, background: C.sidebar, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden", zIndex: 90 }}>
          <div style={{ padding: "12px 10px 8px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: "#F7B500", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 10, flexShrink: 0 }}>BEH</div>
              {!sideCollapsed && <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 12.5 }}>Espace Admin</div><div style={{ color: "rgba(255,255,255,.3)", fontSize: 10 }}>Business Expert Hub</div></div>}
            </div>
            <button onClick={() => router.push("/")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.09)", cursor: "pointer", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.6)", fontSize: 11.5, fontWeight: 700, fontFamily: "inherit", transition: "all .18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(247,181,0,.12)"; e.currentTarget.style.color = "#F7B500"; e.currentTarget.style.borderColor = "rgba(247,181,0,.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.09)"; }}>
              <FaArrowLeft size={10} style={{ flexShrink: 0 }} />{!sideCollapsed && <span>Retour</span>}
            </button>
          </div>

          <div style={{ margin: "8px 8px", background: "rgba(247,181,0,.07)", border: "1px solid rgba(247,181,0,.15)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: sideCollapsed ? 32 : 40, height: sideCollapsed ? 32 : 40, borderRadius: "50%", background: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: sideCollapsed ? 12 : 15, color: "#0A2540", border: "2px solid rgba(247,181,0,.5)" }}>
                  {realUser?.prenom?.[0]}{realUser?.nom?.[0]}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444", border: "2px solid #1B3A4B" }} />
              </div>
              {!sideCollapsed && (
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{realUser?.prenom} {realUser?.nom}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: isOnline ? "#10B981" : "#EF4444" }}>{isOnline ? "Connecté" : "Hors ligne"}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginLeft: "auto" }}>Admin</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav style={{ flex: 1, padding: "6px 8px", overflowY: "auto" }}>
            {navItems.map(item => {
              const isActive = tab === item.id;
              return (
                <button key={item.id} className={`sidebar-btn${isActive ? " active" : ""}`} onClick={() => setTab(item.id)} title={sideCollapsed ? item.label : ""} style={{ marginBottom: 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? item.color : "rgba(255,255,255,.18)", flexShrink: 0, display: "inline-block" }} />
                  {!sideCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {item.count != null && item.count > 0 && (
                    <span style={{ background: item.color, color: "#fff", borderRadius: 99, padding: sideCollapsed ? "0 3px" : "1px 6px", fontSize: 9, fontWeight: 800, lineHeight: 1.8, position: sideCollapsed ? "absolute" : "static", top: sideCollapsed ? 2 : undefined, right: sideCollapsed ? 2 : undefined, minWidth: 15, textAlign: "center" }}>
                      {item.count}
                    </span>
                  )}
                  {isActive && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2.5, background: item.color, borderRadius: "0 3px 3px 0" }} />}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <button onClick={() => setSideCollapsed(!sideCollapsed)} className="sidebar-btn" style={{ marginBottom: 2, fontSize: 11 }}>
              <span style={{ fontSize: 11 }}>{sideCollapsed ? "→" : "←"}</span>
              {!sideCollapsed && <span>Réduire</span>}
            </button>
            <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); router.push("/"); }} className="sidebar-btn" style={{ fontSize: 11 }}>
              <span style={{ fontSize: 11 }}>🚪</span>
              {!sideCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 22px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 80, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{navItems.find(n => n.id === tab)?.label}</div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: isOnline ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${isOnline ? "#A7F3D0" : "#FECACA"}`, borderRadius: 99, padding: "4px 11px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#10B981" : "#EF4444" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: isOnline ? "#059669" : "#DC2626" }}>{isOnline ? "En ligne" : "Hors ligne"}</span>
              </div>
              {totalNotifs > 0 && <div style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{totalNotifs} notification{totalNotifs > 1 ? "s" : ""}</div>}
              <button className="btn btn-gray" style={{ fontSize: 11, padding: "6px 12px" }} onClick={async () => { await loadAll(); await loadDemandes(); notify("Données actualisées"); }}>
                <FaSync size={10} /> Actualiser
              </button>
            </div>
          </header>

          <main style={{ padding: "24px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.textSub }}><div style={{ width: 36, height: 36, border: `3px solid ${C.teal}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />Chargement...</div>
            ) : (
              <div className="fade-in">
                {tab === "dashboard" && <BIDashboardView experts={experts} startups={startups} temoignages={temoignages} demandes={demandes} formationsProposees={formationsEnAttenteExpert} podcastsProposees={podcastsEnAttenteExpert} formations={formations} podcasts={podcasts} articles={articles} setTab={setTab} isOnline={isOnline} />}
                {tab === "utilisateurs" && <UtilisateursView startups={startups} experts={experts} onValiderStartup={(id: number) => valider("startups", id)} onRefuserStartup={(id: number) => refuser("startups", id)} onValiderExpert={(id: number) => valider("experts", id)} onRefuserExpert={(id: number) => refuser("experts", id)} onSetSelectedStartup={setSelectedStartup} onSetSelectedExpert={setSelectedExpert} modificationsAtt={modificationsAtt} onValiderModification={validerModification} onRefuserModification={refuserModification} />}
                {tab === "demandes" && <DemandesStartupsView demandes={demandes} experts={experts} onOpenDemande={(d: any) => { setSelectedDemande(d); }} onLoadDevisForDemande={loadDevisForDemande} />}
                {tab === "proposition" && <PropositionExpertView formationsEnAttente={formationsEnAttenteExpert} podcastsEnAttente={podcastsEnAttenteExpert} onExaminerFormation={setSelectedFormationValidation} onValiderFormation={publierFormationExpert} onRefuserFormation={refuserFormationExpert} onExaminerPodcast={setSelectedPodcastValidation} onValiderPodcast={publierPodcastExpert} onRefuserPodcast={refuserPodcastExpert} />}
                {tab === "services" && <ServicesView 
                  formations={formations} 
                  podcasts={podcasts}
                  onPublierFormation={publierFormation}
                  onArchiverFormation={archiverFormation}
                  onSupprimerFormation={supprimerFormation}
                  onEditFormation={(f: any) => { setEditingFormation(f); setShowFormationForm(true); }}
                  onAddFormation={() => { setEditingFormation(null); setShowFormationForm(true); }}
                  onPublierPodcast={publierPodcast}
                  onArchiverPodcast={archiverPodcast}
                  onSupprimerPodcast={supprimerPodcast}
                  onEditPodcast={(p: any) => { setEditingPodcast(p); setShowPodcastForm(true); }}
                  onAddPodcast={() => { setEditingPodcast(null); setShowPodcastForm(true); }}
                />}
                {tab === "temoignages" && (
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 20 }}>Témoignages ({temoignages.length})</h1>
                    {temoignages.length === 0 ? <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "56px 0", textAlign: "center", color: C.textSub }}>Aucun témoignage</div> : temoignages.map((t: any) => (
                      <div key={t.id} style={{ background: C.white, border: `2px solid ${t.statut === "en_attente" ? C.amber + "40" : t.statut === "valide" ? C.greenM + "30" : C.border}`, borderRadius: 13, padding: "16px 18px", marginBottom: 11, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}><Avatar prenom={t.user?.prenom} nom={t.user?.nom} size={36} color={C.amber} /><div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.user?.prenom} {t.user?.nom}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? C.amber : C.border, fontSize: 13 }}>★</span>)}<span style={{ fontSize: 11, color: C.textSub }}>· {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div></div></div>
                          <div style={{ background: "#F8FAFC", borderRadius: 9, padding: "11px 13px" }}><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}><StatusBadge statut={t.statut === "valide" ? "publie" : t.statut === "refuse" ? "refuse" : "en_attente"} /><div style={{ display: "flex", gap: 5 }}>{t.statut === "en_attente" && <React.Fragment><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerTemo(t.id)}>Publier</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserTemo(t.id)}>Refuser</button></React.Fragment>}<button className="btn btn-gray" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => supprimerTemo(t.id)}>Supprimer</button></div></div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "contacts" && (
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 20 }}>Messages ({contactMsgs.length}) — <span style={{ color: C.greenM }}>{msgsNonLus} non lus</span></h1>
                    {contactMsgs.length === 0 ? <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "56px 0", textAlign: "center", color: C.textSub }}>Aucun message</div> : contactMsgs.map((msg: any) => (
                      <div key={msg.id} style={{ background: C.white, border: `2px solid ${msg.is_read ? C.border : C.greenM + "35"}`, borderRadius: 13, padding: "16px 18px", marginBottom: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}><Avatar prenom={msg.prenom} nom={msg.nom} size={40} color={C.greenM} /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{msg.prenom} {msg.nom}</div><div style={{ fontSize: 11.5, color: C.textSub }}>{msg.email}</div></div>{!msg.is_read && <span style={{ background: C.greenL, color: C.green, borderRadius: 99, padding: "2px 9px", fontSize: 10.5, fontWeight: 700 }}>NOUVEAU</span>}</div>
                          <div style={{ background: "#F8FAFC", borderRadius: 9, padding: "11px 13px", marginBottom: 7 }}><div style={{ fontSize: 12, color: C.textSub, marginBottom: 5 }}><strong>{msg.subject}</strong></div><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, margin: 0 }}>{msg.message}</p></div>
                          {msg.admin_reply && <div style={{ background: C.blueL, borderRadius: 9, padding: "11px 13px", borderLeft: `3px solid ${C.blueM}` }}><div style={{ fontSize: 11.5, fontWeight: 700, color: C.blue, marginBottom: 4 }}>Réponse envoyée</div><p style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.7, margin: 0 }}>{msg.admin_reply}</p></div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                          {!msg.is_read && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => marquerLu(msg.id)}>Marquer lu</button>}
                          <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setReplyModal({ open: true, messageId: msg.id, email: msg.email, nom: msg.nom, prenom: msg.prenom })}>Répondre</button>
                          <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => supprimerMessage(msg.id)}>Supprimer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "contenu_accueil" && <ContenuAccueilView token={tokenVal()} articles={articles} medias={medias} onPublierArticle={publierArticle} onSupprimerArticle={supprimerArticle} onEditArticle={(a: any) => { setEditingArticle(a); setShowArticleModal(true); }} onAddArticle={() => { setEditingArticle(null); setShowArticleModal(true); }} onEditMedia={(m: any) => { setEditingMedia(m); setShowMediaModal(true); }} onSupprimerMedia={supprimerMedia} onAddMedia={() => { setEditingMedia(null); setShowMediaModal(true); }} />}
              </div>
            )}
          </main>

          <footer style={{ background: "#0A2540", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.3)", margin: 0 }}>© 2026 Business Expert Hub — Tous droits réservés</p>
            <p style={{ color: "rgba(255,255,255,.18)", fontSize: 11, margin: 0 }}>Tarifs en Dinar Tunisien (HT)</p>
          </footer>
        </div>
      </div>
    </React.Fragment>
  );
}