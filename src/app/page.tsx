"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaEnvelope, FaArrowRight, FaLock, FaCheck,
  FaCalendarAlt, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaChevronDown, FaMapMarkerAlt, FaPhone, FaEye, FaEyeSlash,
  FaRocket, FaUserPlus, FaClock, FaGlobe, FaPlay, FaTimes,
} from "react-icons/fa";

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    nav_home:"Accueil",nav_about:"À propos",nav_services:"Services",nav_experts:"Experts",nav_blog:"Blog",nav_contact:"Contact",
    btn_login:"Connexion",btn_signup:"S'inscrire",
    hero_badge:"Cabinet de consulting & conseil",hero_h1_a:"Propulsez votre",hero_h1_b:"startup",hero_h1_c:"vers l'excellence",
    hero_p:"Plateforme d'experts spécialisée dans l'accompagnement stratégique des startups et entreprises en croissance.",
    hero_cta1:"Découvrir nos services",hero_cta2:"Contactez-nous",hero_demo:"Voir la démo",
    adn_title:"Notre",adn_title2:"ADN",adn_link:"En savoir plus",adn_more:"En savoir plus sur nous",
    adn0_title:"Notre Vision",adn0_body:"Devenir la référence absolue en accompagnement de startups innovantes, en connectant les meilleurs experts aux projets les plus ambitieux de demain.",
    adn1_title:"Notre Mission",adn1_body:"Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds.",
    adn2_title:"Nos Valeurs",adn2_body:"Excellence, transparence et engagement humain. Chaque accompagnement est unique et conçu pour maximiser l'impact durable de votre entreprise.",
    experts_badge:"Notre équipe",experts_title:"Nos",experts_title2:"Experts",experts_title3:"certifiés",experts_exp:"Expérience",
    experts_msg:"💬 Message",experts_book:"📅 Réserver",experts_all:"Voir tous nos experts",experts_empty:"Aucun expert disponible pour le moment.",
    modal_title:"Accès réservé",modal_p:"Créez un compte gratuit ou connectez-vous pour accéder aux profils experts et réserver un rendez-vous.",modal_create:"Créer un compte",modal_login:"Se connecter",
    partners_title:"Nos",partners_title2:"Partenaires",
    temo_badge:"Témoignages",temo_title:"Ce que disent nos",temo_title2:"clients",temo_empty:"Aucun témoignage pour l'instant",temo_empty_sub:"Les témoignages apparaîtront ici après validation.",
    nl_badge:"Newsletter",nl_title:"Restez",nl_title2:"informé",nl_p:"Recevez nos actualités et ressources exclusives pour accélérer la croissance de votre startup.",
    nl_placeholder:"Votre adresse e-mail",nl_btn:"S'inscrire",nl_loading:"⏳ Inscription...",nl_success:"✅ Vous êtes inscrit avec succès !",nl_not_registered:"⚠️ Cet email n'est pas enregistré sur BEH. Créez un compte pour vous abonner.",
    art_badge:"Actualités",art_title:"Nos derniers",art_title2:"articles",art_all:"Voir tous les articles",art_empty:"Aucun article pour le moment",art_read:"Lire l'article",art_members:"Membres",
    foot_nav:"Navigation",foot_services:"Services",foot_contact:"Contact",foot_social:"Réseaux sociaux",foot_legal:"Mentions légales",foot_privacy:"Confidentialité",
    foot_copy:"© 2026 Business Expert Hub. Tous droits réservés.",foot_desc:"Plateforme premium de mise en relation entre startups ambitieuses et experts certifiés.",
    pop_badge:"Plateforme exclusive",pop_h2:"Rejoignez notre plateforme",pop_p:"Accédez à nos experts, services et opportunités exclusives",
    pop_f1:"Accès aux profils experts",pop_f2:"Réservation de rendez-vous",pop_f3:"Conseils stratégiques exclusifs",
    pop_form_badge:"Inscription gratuite",pop_form_title:"Créer votre compte",pop_email:"E-mail",pop_email_ph:"Votre adresse e-mail",
    pop_pass:"Mot de passe",pop_pass_ph:"Créer un mot de passe",pop_btn:"Créer mon compte gratuitement",pop_or:"ou",
    pop_login:"J'ai déjà un compte — Se connecter",pop_terms:"En vous inscrivant, vous acceptez nos",pop_terms_link:"conditions d'utilisation",
    pop_skip:"Continuer en tant que visiteur",pop_welcome:"Bienvenue !",pop_redirect:"Redirection en cours...",
    str_weak:"Faible",str_medium:"Moyen",str_strong:"Fort",
    demo_title:"Découvrez BEH en action",demo_subtitle:"Une présentation complète de notre plateforme",demo_duration:"3 min 42 sec",
    demo_feature1:"✅ Présentation complète",demo_feature2:"🔐 Plateforme sécurisée",demo_feature3:"🚀 Interface intuitive",
    demo_cta:"S'inscrire gratuitement",hero_trust:"+100 startups accompagnées",hero_rating:"98% de satisfaction",
  },
  en: {
    nav_home:"Home",nav_about:"About",nav_services:"Services",nav_experts:"Experts",nav_blog:"Blog",nav_contact:"Contact",
    btn_login:"Login",btn_signup:"Sign up",
    hero_badge:"Consulting & advisory firm",hero_h1_a:"Launch your",hero_h1_b:"startup",hero_h1_c:"toward excellence",
    hero_p:"An expert platform specialised in strategic support for startups and growing companies.",
    hero_cta1:"Discover our services",hero_cta2:"Contact us",hero_demo:"Watch demo",
    adn_title:"Our",adn_title2:"DNA",adn_link:"Learn more",adn_more:"Learn more about us",
    adn0_title:"Our Vision",adn0_body:"To become the absolute reference in innovative startup support, connecting the best experts with the most ambitious projects.",
    adn1_title:"Our Mission",adn1_body:"Give startups privileged access to certified experts to structure their strategy, accelerate growth and succeed in fundraising.",
    adn2_title:"Our Values",adn2_body:"Excellence, transparency and human commitment. Every engagement is unique and designed to maximise lasting impact.",
    experts_badge:"Our team",experts_title:"Our",experts_title2:"Certified",experts_title3:"Experts",experts_exp:"Experience",
    experts_msg:"💬 Message",experts_book:"📅 Book",experts_all:"See all our experts",experts_empty:"No experts available at the moment.",
    modal_title:"Restricted access",modal_p:"Create a free account or log in to access expert profiles and book an appointment.",modal_create:"Create an account",modal_login:"Log in",
    partners_title:"Our",partners_title2:"Partners",
    temo_badge:"Testimonials",temo_title:"What our",temo_title2:"clients say",temo_empty:"No testimonials yet",temo_empty_sub:"Testimonials will appear here after validation.",
    nl_badge:"Newsletter",nl_title:"Stay",nl_title2:"informed",nl_p:"Receive our exclusive news and resources to accelerate your startup's growth.",
    nl_placeholder:"Your email address",nl_btn:"Subscribe",nl_loading:"⏳ Subscribing...",nl_success:"✅ Successfully subscribed!",nl_not_registered:"⚠️ This email is not registered on BEH. Please create an account first.",
    art_badge:"News",art_title:"Our latest",art_title2:"articles",art_all:"See all articles",art_empty:"No articles yet",art_read:"Read article",art_members:"Members",
    foot_nav:"Navigation",foot_services:"Services",foot_contact:"Contact",foot_social:"Social media",foot_legal:"Legal notice",foot_privacy:"Privacy policy",
    foot_copy:"© 2026 Business Expert Hub. All rights reserved.",foot_desc:"Premium platform connecting ambitious startups with certified experts.",
    pop_badge:"Exclusive platform",pop_h2:"Join our platform",pop_p:"Access our experts, services and exclusive opportunities",
    pop_f1:"Expert profile access",pop_f2:"Appointment booking",pop_f3:"Exclusive strategic advice",
    pop_form_badge:"Free registration",pop_form_title:"Create your account",pop_email:"Email",pop_email_ph:"Your email address",
    pop_pass:"Password",pop_pass_ph:"Create a password",pop_btn:"Create my free account",pop_or:"or",
    pop_login:"Already have an account — Log in",pop_terms:"By signing up, you agree to our",pop_terms_link:"terms of use",
    pop_skip:"Continue as a visitor",pop_welcome:"Welcome!",pop_redirect:"Redirecting...",
    str_weak:"Weak",str_medium:"Medium",str_strong:"Strong",
    demo_title:"See BEH in action",demo_subtitle:"A complete walkthrough of our platform",demo_duration:"3 min 42 sec",
    demo_feature1:"✅ Full presentation",demo_feature2:"🔐 Secure platform",demo_feature3:"🚀 Intuitive interface",
    demo_cta:"Sign up for free",hero_trust:"+100 startups supported",hero_rating:"98% satisfaction rate",
  },
};

interface ExpertAPI { id:number; user_id:number; nom:string; prenom:string; domaine:string; description:string; experience:string; annee_debut_experience?:number; localisation:string; tarif:string; note:number; nb_avis:number; photo?:string; statut?:string; user?:{nom:string;prenom:string;email:string}; }
interface TemoAPI   { id:number; texte:string; statut:string; note?:number; user?:{nom:string;prenom:string;role:string}; startup?:{nom_startup:string;fonction:string;secteur:string}; createdAt:string; }
interface ArticleAPI{ id:number; titre:string; description:string; contenu:string; type:string; categorie:string; tags:string[]; couleur_point:string; duree_lecture:string; statut:string; acces_prive:boolean; tres_tendance:boolean; image:string; fichier_pdf:string; vues:number; createdAt:string; }

function useInView(thr=0.12):[React.RefObject<HTMLDivElement|null>,boolean]{const ref=useRef<HTMLDivElement>(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:thr});o.observe(el);return()=>o.disconnect();},[thr]);return[ref,v];}
function Reveal({children,delay=0}:{children:ReactNode;delay?:number}){const[ref,v]=useInView();return(<div ref={ref} style={{opacity:v?1:0,transform:v?"none":"translateY(36px)",transition:`opacity .85s cubic-bezier(.22,1,.36,1) ${delay}s, transform .85s cubic-bezier(.22,1,.36,1) ${delay}s`}}>{children}</div>);}
function StarDisplay({rating,size=16}:{rating:number;size?:number}){return(<div style={{display:"flex",alignItems:"center",gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=rating?"#F7B500":"#E2E8F0",fontSize:size}}>★</span>)}</div>);}
function getName(ex:ExpertAPI){const p=ex.user?.prenom||ex.prenom||"";const n=ex.user?.nom||ex.nom||"";return`${p} ${n}`.trim()||ex.domaine||"Expert";}
function getIni(ex:ExpertAPI){const p=ex.user?.prenom||ex.prenom||"";const n=ex.user?.nom||ex.nom||"";return((p[0]||"")+(n[0]||"")).toUpperCase()||"EX";}
function getTemoInfo(t:TemoAPI){const pr=t.user?.prenom||"";const nm=t.user?.nom||"";const full=`${pr} ${nm}`.trim()||"Client BEH";const ini=((pr[0]||"")+(nm[0]||"")).toUpperCase()||"??";const st=t.startup?.nom_startup||"";const fn=t.startup?.fonction||(t.user?.role==="expert"?"Expert BEH":"");let sub="";if(fn&&st)sub=`${fn} — ${st}`;else if(fn)sub=fn;else if(st)sub=st;else if(t.user?.role==="expert")sub="Expert BEH";else sub="Startup BEH";return{full,ini,sub,note:t.note||5};}
const calculerExp=(a:number|null|undefined):string=>{if(!a)return"";const n=new Date().getFullYear()-a;if(n<0)return"";return`${n} ${n>1?"ans":"an"}`;};
const afficherExperience=(ex:ExpertAPI):string=>{if(ex.annee_debut_experience){const c=calculerExp(ex.annee_debut_experience);return c?`${c} d'expérience`:"Non renseignée";}if(ex.experience)return ex.experience;return"Non renseignée";};

const ADN_COLORS=["#3B82F6","#F7B500","#10B981"];
const ADN_IMGS=["/vision.png","/mission.png","/valeurs.png"];
const ADN_ANCHORS=["vision","mission","valeurs"];
const SERVICES=[{label:{fr:"Consulting",en:"Consulting"},slug:"consulting"},{label:{fr:"Audit sur site",en:"On-site Audit"},slug:"audit-sur-site"},{label:{fr:"Nos plateformes",en:"Our platforms"},slug:"nos-plateformes"},{label:{fr:"Formations",en:"Training"},slug:"formations"}];
const LOGOS=["/logos/partenaire1.png","/logos/partenaire2.png","/logos/partenaire3.png","/logos/partenaire4.png","/logos/partenaire5.png","/logos/partenaire6.png","/logos/partenaire7.png"];

// ── Sélecteur de langue ──
function LangSwitcher({lang,setLang}:{lang:Lang;setLang:(l:Lang)=>void}){
  const[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const LANGS=[{code:"fr" as Lang,label:"Français",short:"FR"},{code:"en" as Lang,label:"English",short:"EN"}];
  const current=LANGS.find(l=>l.code===lang)!;
  function select(code:Lang){setLang(code);setOpen(false);if(typeof window!=="undefined")localStorage.setItem("beh_lang",code);}
  return(
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",padding:"6px 8px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13.5,fontWeight:600,color:"#374151",borderRadius:8,transition:"color .18s,background .18s",outline:"none"}}
        onMouseEnter={e=>{e.currentTarget.style.color="#0A2540";e.currentTarget.style.background="#F3F4F6";}}
        onMouseLeave={e=>{if(!open){e.currentTarget.style.color="#374151";e.currentTarget.style.background="transparent";}}}>
        <FaGlobe size={15} style={{color:"#6B7280",flexShrink:0}}/>
        <span style={{letterSpacing:".3px"}}>{current.short}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#fff",borderRadius:12,boxShadow:"0 8px 32px rgba(10,37,64,.13)",border:"1px solid #E5E7EB",overflow:"hidden",minWidth:140,zIndex:400,animation:"langDrop .15s cubic-bezier(.22,1,.36,1)"}}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>select(l.code)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:l.code===lang?"#F9FAFB":"transparent",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13.5,fontWeight:l.code===lang?700:500,color:l.code===lang?"#0A2540":"#6B7280",transition:"background .12s,color .12s",textAlign:"left"}}
              onMouseEnter={e=>{if(l.code!==lang){e.currentTarget.style.background="#F3F4F6";e.currentTarget.style.color="#374151";}}}
              onMouseLeave={e=>{if(l.code!==lang){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6B7280";}}}>
              <FaGlobe size={13} style={{color:l.code===lang?"#F7B500":"#9CA3AF",flexShrink:0}}/>
              <span style={{flex:1}}>{l.label}</span>
              {l.code===lang&&<span style={{width:16,height:16,borderRadius:"50%",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}><FaCheck size={7} style={{color:"#F7B500"}}/></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal Démo ──
function DemoModal({onClose,tr}:{onClose:()=>void;tr:Record<string,string>}){
  const videoRef=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    function onKey(e:KeyboardEvent){if(e.key==="Escape")onClose();}
    document.addEventListener("keydown",onKey);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";};
  },[onClose]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(4,12,24,.92)",backdropFilter:"blur(18px)"}}/>
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:1000,animation:"demoIn .36s cubic-bezier(.22,1,.36,1)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"0 4px"}}>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:19,marginBottom:4,fontFamily:"'Outfit',sans-serif"}}>{tr.demo_title}</div>
            <div style={{color:"rgba(255,255,255,.45)",fontSize:13}}>{tr.demo_subtitle}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(247,181,0,.1)",border:"1px solid rgba(247,181,0,.28)",borderRadius:99,padding:"5px 14px"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#F7B500",display:"inline-block",animation:"demoDot 2s ease-in-out infinite"}}/>
              <span style={{fontSize:12,color:"#F7B500",fontWeight:700}}>{tr.demo_duration}</span>
            </div>
            <button onClick={onClose} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",outline:"none"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.2)";e.currentTarget.style.transform="scale(1.08)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)";e.currentTarget.style.transform="scale(1)";}}>
              <FaTimes/>
            </button>
          </div>
        </div>
        <div style={{borderRadius:22,overflow:"hidden",background:"#000",boxShadow:"0 48px 120px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.07)",position:"relative"}}>
          <div style={{height:3,background:"linear-gradient(90deg,#F7B500,#e6a800 40%,rgba(247,181,0,.25) 100%)"}}/>
          <video ref={videoRef} src="/video/demo.mp4" controls autoPlay playsInline style={{width:"100%",display:"block",maxHeight:"68vh",background:"#000",objectFit:"contain"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14,padding:"0 4px",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[tr.demo_feature1,tr.demo_feature2,tr.demo_feature3].map((feat,i)=>(
              <span key={i} style={{fontSize:13,color:"rgba(255,255,255,.45)",fontWeight:500,fontFamily:"'Outfit',sans-serif"}}>{feat}</span>
            ))}
          </div>
          <Link href="/inscription" onClick={onClose} style={{display:"inline-flex",alignItems:"center",gap:8,background:"#F7B500",color:"#0A2540",borderRadius:10,padding:"10px 24px",fontWeight:800,fontSize:14,textDecoration:"none",fontFamily:"'Outfit',sans-serif",transition:"all .22s",flexShrink:0}} onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="#e6a800";el.style.transform="translateY(-2px)";el.style.boxShadow="0 8px 24px rgba(247,181,0,.4)";}} onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.background="#F7B500";el.style.transform="none";el.style.boxShadow="none";}}>
            {tr.demo_cta} <FaArrowRight size={11}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Popup Inscription ──
function SignupPopup({onClose,t}:{onClose:()=>void;t:Record<string,string>}){
  const[email,setEmail]=useState("");const[pass,setPass]=useState("");const[showPass,setShowPass]=useState(false);const[step,setStep]=useState<"form"|"success">("form");
  const strength=pass.length===0?0:pass.length<6?1:pass.length<10?2:3;
  const strColor=["","#EF4444","#F59E0B","#10B981"][strength];const strLabel=["",t.str_weak,t.str_medium,t.str_strong][strength];
  function submit(e:React.FormEvent){e.preventDefault();localStorage.setItem("beh_popup_dismissed","1");setStep("success");setTimeout(()=>{window.location.href="/inscription";},1500);}
  return(
    <div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{position:"absolute",inset:0,background:"rgba(4,12,24,.82)",backdropFilter:"blur(12px)"}} onClick={onClose}/>
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:960,borderRadius:28,overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",boxShadow:"0 40px 120px rgba(0,0,0,.65)",animation:"popIn .4s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{background:"linear-gradient(145deg,#0A2540 0%,#0f3564 50%,#1a4a80 100%)",padding:"52px 44px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(247,181,0,.07)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-40,left:-40,width:160,height:160,borderRadius:"50%",background:"rgba(247,181,0,.05)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
          <div style={{position:"relative",zIndex:2}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(247,181,0,.15)",border:"1px solid rgba(247,181,0,.3)",borderRadius:99,padding:"5px 14px",marginBottom:28}}><FaRocket size={10} style={{color:"#F7B500"}}/><span style={{fontSize:10.5,fontWeight:800,letterSpacing:"2px",textTransform:"uppercase",color:"#F7B500"}}>{t.pop_badge}</span></div>
            <h2 style={{fontSize:"clamp(28px,3vw,40px)",fontWeight:700,color:"#fff",lineHeight:1.15,marginBottom:14}}>{t.pop_h2}</h2>
            <p style={{fontSize:14.5,color:"rgba(255,255,255,.5)",lineHeight:1.8,marginBottom:36}}>{t.pop_p}</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>{[t.pop_f1,t.pop_f2,t.pop_f3].map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:26,height:26,borderRadius:8,background:"rgba(247,181,0,.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FaCheck size={10} style={{color:"#F7B500"}}/></div><span style={{fontSize:14,color:"rgba(255,255,255,.7)",fontWeight:500}}>{p}</span></div>))}</div>
          </div>
          <div style={{position:"relative",zIndex:2,display:"flex",alignItems:"center",gap:10,marginTop:40}}><svg width="32" height="32" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="rgba(247,181,0,.15)"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="13" fontWeight="900" fontFamily="Arial">BEH</text></svg><span style={{fontWeight:600,fontSize:14,color:"rgba(255,255,255,.45)"}}>Business Expert Hub</span></div>
        </div>
        <div style={{background:"#fff",padding:"48px 44px",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative"}}>
          {step==="success"?(
            <div style={{textAlign:"center",padding:"20px 0"}}><div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#10B981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 8px 28px rgba(16,185,129,.3)"}}><FaCheck size={28} style={{color:"#fff"}}/></div><h3 style={{fontSize:26,fontWeight:700,color:"#0A2540",marginBottom:10}}>{t.pop_welcome}</h3><p style={{fontSize:14,color:"#64748B",lineHeight:1.7}}>{t.pop_redirect}</p><div style={{marginTop:20,height:3,borderRadius:99,background:"#EEF2F7",overflow:"hidden"}}><div style={{height:"100%",background:"#10B981",animation:"progress 1.4s linear forwards",borderRadius:99}}/></div></div>
          ):(
            <>
              <div style={{marginBottom:28}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#F7B500,#e6a800)",display:"flex",alignItems:"center",justifyContent:"center"}}><FaUserPlus size={15} style={{color:"#0A2540"}}/></div><div><div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"1.5px"}}>{t.pop_form_badge}</div><div style={{fontSize:17,fontWeight:800,color:"#0A2540",marginTop:1}}>{t.pop_form_title}</div></div></div></div>
              <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={{fontSize:11.5,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:6}}>{t.pop_email}</label><div style={{position:"relative"}}><FaEnvelope style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#94A3B8",fontSize:13}}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.pop_email_ph} required style={{width:"100%",background:"#F8FAFC",border:"1.5px solid #E2EAF4",borderRadius:11,padding:"12px 14px 12px 38px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#0A2540",outline:"none"}} onFocus={e=>e.currentTarget.style.borderColor="#F7B500"} onBlur={e=>e.currentTarget.style.borderColor="#E2EAF4"}/></div></div>
                <div><label style={{fontSize:11.5,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:6}}>{t.pop_pass}</label><div style={{position:"relative"}}><FaLock style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#94A3B8",fontSize:13}}/><input type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.pop_pass_ph} required style={{width:"100%",background:"#F8FAFC",border:"1.5px solid #E2EAF4",borderRadius:11,padding:"12px 40px 12px 38px",fontFamily:"'Outfit',sans-serif",fontSize:14,color:"#0A2540",outline:"none"}} onFocus={e=>e.currentTarget.style.borderColor="#F7B500"} onBlur={e=>e.currentTarget.style.borderColor="#E2EAF4"}/><button type="button" onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94A3B8",display:"flex",alignItems:"center",padding:4}}>{showPass?<FaEyeSlash size={14}/>:<FaEye size={14}/>}</button></div>{pass.length>0&&(<div style={{marginTop:7,display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:3,borderRadius:99,background:"#EEF2F7",overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:strColor,width:`${strength*33}%`,transition:"width .3s,background .3s"}}/></div><span style={{fontSize:11,fontWeight:600,color:strColor}}>{strLabel}</span></div>)}</div>
                <button type="submit" style={{background:"linear-gradient(135deg,#0A2540,#163d72)",color:"#F7B500",border:"none",borderRadius:11,padding:"14px",fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,boxShadow:"0 6px 20px rgba(10,37,64,.25)",transition:"all .22s"}} onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,#F7B500,#e6a800)";e.currentTarget.style.color="#0A2540";}} onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,#0A2540,#163d72)";e.currentTarget.style.color="#F7B500";}}><FaRocket size={13}/> {t.pop_btn}</button>
                <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}><div style={{flex:1,height:1,background:"#EEF2F7"}}/><span style={{fontSize:12,color:"#94A3B8",fontWeight:500}}>{t.pop_or}</span><div style={{flex:1,height:1,background:"#EEF2F7"}}/></div>
                <Link href="/connexion"><button type="button" style={{width:"100%",background:"transparent",color:"#334155",border:"1.5px solid #E2EAF4",borderRadius:11,padding:"12px",fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#0A2540";e.currentTarget.style.color="#0A2540";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2EAF4";e.currentTarget.style.color="#334155";}}>{t.pop_login}</button></Link>
              </form>
              <div style={{marginTop:16,textAlign:"center"}}><p style={{fontSize:11.5,color:"#94A3B8",lineHeight:1.7}}>{t.pop_terms}{" "}<Link href="#" style={{color:"#F7B500",fontWeight:600,textDecoration:"none"}}>{t.pop_terms_link}</Link></p><button onClick={onClose} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:12.5,color:"#B8C4D6",fontFamily:"'Outfit',sans-serif",textDecoration:"underline",textUnderlineOffset:2}} onMouseEnter={e=>e.currentTarget.style.color="#64748B"} onMouseLeave={e=>e.currentTarget.style.color="#B8C4D6"}>{t.pop_skip}</button></div>
            </>
          )}
          <button onClick={onClose} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:18,color:"#CBD5E1",cursor:"pointer",lineHeight:1,zIndex:20}} onMouseEnter={e=>e.currentTarget.style.color="#0A2540"} onMouseLeave={e=>e.currentTarget.style.color="#CBD5E1"}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════ PAGE PRINCIPALE ══════════════════════
export default function Home(){
  const router=useRouter();
  const[lang,setLang]=useState<Lang>("fr");
  useEffect(()=>{if(typeof window==="undefined")return;const saved=localStorage.getItem("beh_lang") as Lang|null;if(saved==="fr"||saved==="en")setLang(saved);},[]);
  const tr=T[lang];

  useEffect(()=>{if(typeof window==="undefined")return;const raw=localStorage.getItem("user");if(!raw)return;try{const user=JSON.parse(raw);const role=user?.role;if(role==="admin")router.replace("/dashboard/admin");else if(role==="expert")router.replace("/dashboard/expert");else if(role==="startup")router.replace("/dashboard/startup");else if(role==="client")router.replace("/dashboard/client");}catch{}},[router]);

  const[servOpen,setServOpen]=useState(false);
  const[tIdx,setTIdx]=useState(0);const[tAnim,setTAnim]=useState(false);
  const[mail,setMail]=useState("");const[sent,setSent]=useState(false);const[nlLoading,setNlLoading]=useState(false);
  const[nlError,setNlError]=useState<string>("");
  const[modal,setModal]=useState(false);
  const[showDemo,setShowDemo]=useState(false);
  const[experts,setExperts]=useState<ExpertAPI[]>([]);const[loading,setLoading]=useState(true);
  const[temos,setTemos]=useState<TemoAPI[]>([]);const[temoLoad,setTemoLoad]=useState(true);
  const[showPopup,setShowPopup]=useState(false);const popupShown=useRef(false);
  const[articlesAccueil,setArticlesAccueil]=useState<ArticleAPI[]>([]);

  useEffect(()=>{if(typeof window!=="undefined"&&localStorage.getItem("beh_popup_dismissed"))return;const timer=setTimeout(()=>{if(!popupShown.current){popupShown.current=true;setShowPopup(true);}},8000);const onScroll=()=>{if(popupShown.current)return;const pct=window.scrollY/(document.body.scrollHeight-window.innerHeight);if(pct>=0.45){popupShown.current=true;setShowPopup(true);}};window.addEventListener("scroll",onScroll,{passive:true});return()=>{clearTimeout(timer);window.removeEventListener("scroll",onScroll);};},[]);
  useEffect(()=>{fetch("http://localhost:3001/experts/liste").then(r=>r.ok?r.json():[]).then((d:ExpertAPI[])=>{if(Array.isArray(d))setExperts(d.slice(0,4));setLoading(false);}).catch(()=>setLoading(false));},[]);
  useEffect(()=>{fetch("http://localhost:3001/temoignages/publics").then(r=>r.ok?r.json():[]).then((d:TemoAPI[])=>{if(Array.isArray(d))setTemos(d);setTemoLoad(false);}).catch(()=>setTemoLoad(false));},[]);
  useEffect(()=>{fetch("http://localhost:3001/articles/public").then(r=>r.ok?r.json():[]).then((data:ArticleAPI[])=>{if(Array.isArray(data)){const sorted=[...data].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());setArticlesAccueil(sorted.slice(0,3));}}).catch(()=>{});},[]);
  useEffect(()=>{if(!temos.length)return;const t=setInterval(()=>{if(!tAnim)setTIdx(p=>(p+1)%temos.length);},5500);return()=>clearInterval(t);},[temos.length,tAnim]);

  function goT(i:number){if(tAnim||!temos.length)return;setTAnim(true);setTimeout(()=>{setTIdx(i);setTAnim(false);},280);}

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!mail) return;
    setNlLoading(true);
    setNlError("");
    try {
      const checkRes = await fetch(`http://localhost:3001/auth/check-email?email=${encodeURIComponent(mail)}`);
      if (!checkRes.ok) { setNlError(tr.nl_not_registered); setNlLoading(false); return; }
      const data = await checkRes.json();
      if (!data.exists) { setNlError(tr.nl_not_registered); setNlLoading(false); return; }
      const subRes = await fetch("http://localhost:3001/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail, nom: "Abonné newsletter" })
      });
      if (subRes.ok) { setSent(true); setMail(""); setNlError(""); }
      else { const err = await subRes.text(); setNlError(err || "Erreur lors de l'abonnement"); }
    } catch { setNlError("Erreur réseau. Vérifiez votre connexion."); }
    finally { setNlLoading(false); }
  }

  const curTemo=temos[tIdx%Math.max(temos.length,1)];const tInfo=curTemo?getTemoInfo(curTemo):null;
  const ADN_ITEMS=[{title:tr.adn0_title,body:tr.adn0_body},{title:tr.adn1_title,body:tr.adn1_body},{title:tr.adn2_title,body:tr.adn2_body}];

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#2D3748"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ey{display:inline-flex;align-items:center;gap:8px;font-size:10.5px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#F7B500;}
        .ey::before{content:'';display:block;width:24px;height:2px;background:#F7B500;border-radius:2px;}
        .bg{display:inline-flex;align-items:center;gap:8px;background:#F7B500;color:#0A2540;border:none;border-radius:10px;padding:13px 26px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bg:hover{background:#e6a800;transform:translateY(-3px);box-shadow:0 12px 32px rgba(247,181,0,.35);}
        .bd{display:inline-flex;align-items:center;gap:8px;background:#0A2540;color:#fff;border:none;border-radius:10px;padding:13px 26px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bd:hover{background:#F7B500;color:#0A2540;transform:translateY(-3px);}
        .bol{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.28);border-radius:10px;padding:13px 26px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bol:hover{border-color:#F7B500;color:#F7B500;transform:translateY(-3px);}
        .btn-demo{display:inline-flex;align-items:center;gap:10px;background:transparent;color:rgba(255,255,255,.75);border:1.5px solid rgba(255,255,255,.25);border-radius:10px;padding:11px 22px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;position:relative;overflow:hidden;}
        .btn-demo:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.5);color:#fff;transform:translateY(-3px);}
        .demo-play-ring{width:30px;height:30px;border-radius:50%;background:rgba(247,181,0,.9);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .25s,background .25s;animation:demoRipple 2.6s ease-out infinite;}
        .btn-demo:hover .demo-play-ring{background:#F7B500;transform:scale(1.1);}
        @keyframes demoRipple{0%{box-shadow:0 0 0 0 rgba(247,181,0,.5);}70%{box-shadow:0 0 0 10px rgba(247,181,0,0);}100%{box-shadow:0 0 0 0 rgba(247,181,0,0);}}
        @keyframes demoDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);}}
        .bno{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;transition:all .22s;font-family:inherit;}
        .bno:hover{background:#F7B500;border-color:#F7B500;}
        .bns{background:#F7B500;color:#0A2540;border:none;padding:9px 22px;border-radius:9px;font-weight:800;font-size:13.5px;cursor:pointer;transition:all .22s;font-family:inherit;}
        .bns:hover{background:#e6a800;box-shadow:0 8px 20px rgba(247,181,0,.38);}
        .nl{color:#475569;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .2s;}
        .nl:hover{color:#F7B500;}
        .di{display:block;padding:10px 18px;color:#334155;text-decoration:none;font-size:14px;font-weight:500;transition:background .15s,color .15s;white-space:nowrap;}
        .di:hover{background:#FFFBEB;color:#F7B500;}
        .ac-card{background:#fff;border-radius:22px;overflow:hidden;border:1px solid rgba(10,37,64,.07);box-shadow:0 4px 24px rgba(10,37,64,.07);display:flex;flex-direction:column;transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .4s;}
        .ac-card:hover{transform:translateY(-12px);box-shadow:0 36px 72px rgba(10,37,64,.15);border-color:rgba(247,181,0,.3);}
        .ac-card:hover .ai{transform:scale(1.06);}
        .ai{transition:transform .8s cubic-bezier(.22,1,.36,1);}
        .ec{background:#fff;border-radius:16px;border:1px solid #EEF2F7;box-shadow:0 2px 12px rgba(10,37,64,.05);display:flex;flex-direction:column;transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s,border-color .32s;}
        .ec:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(10,37,64,.11);border-color:rgba(247,181,0,.35);}
        .sb{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;text-decoration:none;transition:all .22s;border:none;cursor:pointer;}
        .sb:hover{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.25);}
        .art-card{background:#fff;border-radius:20px;overflow:hidden;border:1px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.06);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s,border-color .35s;text-decoration:none;}
        .art-card:hover{transform:translateY(-10px);box-shadow:0 28px 60px rgba(10,37,64,.14);border-color:rgba(247,181,0,.3);}
        .art-card:hover .art-img{transform:scale(1.05);}
        .art-img{transition:transform .6s cubic-bezier(.22,1,.36,1);}
        @keyframes marqueeLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes marqueeRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        .mL{display:flex;align-items:center;gap:64px;width:max-content;animation:marqueeLeft 25s linear infinite;}
        .mR{display:flex;align-items:center;gap:64px;width:max-content;animation:marqueeRight 25s linear infinite;}
        .mL:hover,.mR:hover{animation-play-state:paused;}
        @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes demoIn{from{opacity:0;transform:scale(.96) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes progress{from{width:0}to{width:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes hzoom{0%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes hfi{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .hi{animation:hzoom 2.2s cubic-bezier(.22,1,.36,1) forwards;}
        .hc>*{animation:hfi .9s cubic-bezier(.22,1,.36,1) both;}
        .hc>*:nth-child(1){animation-delay:.04s}.hc>*:nth-child(2){animation-delay:.16s}.hc>*:nth-child(3){animation-delay:.3s}
        .hc>*:nth-child(4){animation-delay:.46s}.hc>*:nth-child(5){animation-delay:.58s}
      `}</style>

      {showDemo&&<DemoModal tr={tr} onClose={()=>setShowDemo(false)}/>}
      {showPopup&&<SignupPopup t={tr} onClose={()=>{localStorage.setItem("beh_popup_dismissed","1");setShowPopup(false);}}/>}

      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"rgba(6,14,26,.75)",backdropFilter:"blur(10px)"}} onClick={()=>setModal(false)}>
          <div style={{background:"#fff",borderRadius:28,padding:"52px 44px",maxWidth:440,width:"100%",textAlign:"center",position:"relative",boxShadow:"0 48px 120px rgba(10,37,64,.32)"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:68,height:68,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"#0A2540",margin:"0 auto 22px",background:"linear-gradient(135deg,#F7B500,#e6a800)",boxShadow:"0 10px 28px rgba(247,181,0,.32)"}}><FaLock/></div>
            <h2 style={{fontSize:26,fontWeight:700,color:"#0A2540",marginBottom:12}}>{tr.modal_title}</h2>
            <p style={{color:"#64748B",fontSize:14.5,lineHeight:1.8,marginBottom:28}}>{tr.modal_p}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Link href="/inscription" onClick={()=>setModal(false)}><button style={{width:"100%",background:"#0A2540",color:"#F7B500",border:"none",borderRadius:11,padding:"14px",fontFamily:"inherit",fontWeight:800,fontSize:15,cursor:"pointer"}}>{tr.modal_create}</button></Link>
              <Link href="/connexion"   onClick={()=>setModal(false)}><button style={{width:"100%",background:"transparent",color:"#0A2540",border:"1.5px solid #E2EAF4",borderRadius:11,padding:"12px",fontFamily:"inherit",fontWeight:600,fontSize:14,cursor:"pointer"}}>{tr.modal_login}</button></Link>
            </div>
            <button onClick={()=>setModal(false)} style={{position:"absolute",top:14,right:18,background:"none",border:"none",fontSize:22,color:"#CBD5E1",cursor:"pointer",lineHeight:1}}>✕</button>
          </div>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <header style={{background:"#fff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 0 #EEF2F7,0 4px 18px rgba(10,37,64,.05)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 28px",height:76,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:11,textDecoration:"none",flexShrink:0}}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="11" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <span style={{fontWeight:700,fontSize:18,color:"#0A2540",letterSpacing:"-0.3px"}}>Business <span style={{color:"#F7B500"}}>Expert</span> Hub</span>
          </Link>
          <nav style={{display:"flex",gap:20,alignItems:"center",flex:1,justifyContent:"center"}}>
            <Link href="/" className="nl" style={{color:"#F7B500",fontWeight:700}}>{tr.nav_home}</Link>
            <Link href="/a-propos" className="nl">{tr.nav_about}</Link>
            <div style={{position:"relative"}} onMouseEnter={()=>setServOpen(true)} onMouseLeave={()=>setServOpen(false)}>
              <Link href="/services" className="nl" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{tr.nav_services} <FaChevronDown size={9}/></Link>
              {servOpen&&(<ul style={{position:"absolute",top:"calc(100% + 10px)",left:0,background:"#fff",borderRadius:14,listStyle:"none",padding:"8px",margin:0,zIndex:200,minWidth:210,boxShadow:"0 16px 48px rgba(10,37,64,.14)",border:"1px solid #EEF2F7"}}>{SERVICES.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="di">{s.label[lang]}</Link></li>)}</ul>)}
            </div>
            <Link href="/experts" className="nl">{tr.nav_experts}</Link>
            <Link href="/blog" className="nl">{tr.nav_blog}</Link>
            <Link href="/contact" className="nl">{tr.nav_contact}</Link>
          </nav>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <div style={{width:1,height:24,background:"#E5E7EB",margin:"0 2px"}}/>
            <LangSwitcher lang={lang} setLang={setLang}/>
            <div style={{width:1,height:24,background:"#E5E7EB",margin:"0 2px"}}/>
            <Link href="/connexion"><button className="bno">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="bns">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section style={{position:"relative",color:"#fff",overflow:"hidden",minHeight:660}}>
        <div style={{position:"absolute",inset:0,zIndex:0}}>
          <Image src="/image.png" alt="Hero" fill priority className="hi" style={{objectFit:"cover"}} sizes="100vw"/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(108deg,rgba(6,14,26,.96) 0%,rgba(10,30,60,.8) 44%,rgba(10,37,64,.18) 100%)"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none"}}/>
        </div>
        <div className="hc" style={{position:"relative",zIndex:10,maxWidth:1280,margin:"0 auto",padding:"130px 32px 150px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:9,marginBottom:28,background:"rgba(247,181,0,.1)",border:"1px solid rgba(247,181,0,.22)",borderRadius:99,padding:"6px 16px 6px 10px"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#F7B500",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#F7B500"}}>{tr.hero_badge}</span>
          </div>
          <h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:700,marginBottom:24,lineHeight:1.1}}>
            {tr.hero_h1_a} <span style={{color:"#F7B500"}}>{tr.hero_h1_b}</span><br/>{tr.hero_h1_c}
          </h1>
          <p style={{fontSize:16.5,color:"rgba(255,255,255,.7)",maxWidth:500,lineHeight:1.9,marginBottom:44}}>{tr.hero_p}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
            <Link href="/services" className="bg">{tr.hero_cta1} <FaArrowRight size={12}/></Link>
            <Link href="/contact" className="bol">{tr.hero_cta2} <FaArrowRight size={12}/></Link>
            <button className="btn-demo" onClick={()=>setShowDemo(true)}>
              <span className="demo-play-ring"><FaPlay style={{color:"#0A2540",fontSize:11,marginLeft:2}}/></span>
              {tr.hero_demo}
            </button>
          </div>
        </div>
      </section>

      {/* ══ ADN ══ */}
      <section style={{padding:"110px 28px",overflow:"hidden",position:"relative",background:"#F8FAFC"}}>
        <div style={{position:"relative",zIndex:10,maxWidth:1200,margin:"0 auto"}}>
          <Reveal><div style={{textAlign:"center",marginBottom:72}}><h2 style={{fontWeight:700,fontSize:"clamp(34px,4vw,52px)",color:"#0A2540"}}>{tr.adn_title} <span style={{color:"#F7B500"}}>{tr.adn_title2}</span></h2></div></Reveal>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
            {ADN_ITEMS.map((card,i)=>(
              <Reveal key={i} delay={i*.13}>
                <div className="ac-card" style={{height:"100%"}}>
                  <div style={{position:"relative",overflow:"hidden",height:220}}>
                    <Image src={ADN_IMGS[i]} alt={card.title} fill className="ai" style={{objectFit:"cover"}} sizes="400px"/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 25%,rgba(10,37,64,.68) 100%)"}}/>
                    <div style={{position:"absolute",bottom:20,left:20}}><h3 style={{color:"white",fontSize:18,fontWeight:700}}>{card.title}</h3></div>
                  </div>
                  <div style={{padding:"22px 24px 24px",display:"flex",flexDirection:"column",flex:1}}>
                    <div style={{width:32,height:3,borderRadius:2,background:ADN_COLORS[i],marginBottom:14}}/>
                    <p style={{fontSize:13.5,color:"#64748B",lineHeight:1.85,flex:1,marginBottom:20}}>{card.body}</p>
                    <Link href={`/a-propos#${ADN_ANCHORS[i]}`}><button style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:"inherit",fontWeight:700,fontSize:13,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",background:`${ADN_COLORS[i]}18`,color:ADN_COLORS[i],transition:"all .2s"}}>{tr.adn_link} <FaArrowRight size={10}/></button></Link>
                  </div>
                  <div style={{height:3,background:`linear-gradient(90deg,${ADN_COLORS[i]},${ADN_COLORS[i]}22)`}}/>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={.42}><div style={{textAlign:"center",marginTop:56}}><Link href="/a-propos" className="bd">{tr.adn_more} <FaArrowRight size={12}/></Link></div></Reveal>
        </div>
      </section>

      {/* ══ EXPERTS ══ */}
      <section style={{padding:"100px 28px",position:"relative",overflow:"hidden",background:"#FFFFFF"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(0,0,0,.02) 1px,transparent 1px)",backgroundSize:"44px 44px",pointerEvents:"none"}}/>
        <div style={{maxWidth:1240,margin:"0 auto",position:"relative",zIndex:10}}>
          <Reveal><div style={{textAlign:"center",marginBottom:68}}><span className="ey" style={{justifyContent:"center",marginBottom:16}}>{tr.experts_badge}</span><h2 style={{fontWeight:700,fontSize:"clamp(34px,4vw,52px)",color:"#0A2540",marginBottom:16}}>{tr.experts_title} <span style={{color:"#F7B500"}}>{tr.experts_title2}</span> {tr.experts_title3}</h2></div></Reveal>
          {loading?(<div style={{textAlign:"center",padding:"72px 0"}}><div style={{width:42,height:42,border:"3px solid #F7B500",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/></div>):experts.length===0?(<div style={{textAlign:"center",padding:"72px 0",color:"#94A3B8",fontSize:15}}>{tr.experts_empty}</div>):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:24}}>
              {experts.map((ex,i)=>{const name=getName(ex);const ini=getIni(ex);const expText=afficherExperience(ex);return(
                <Reveal key={ex.id} delay={i*.09}>
                  <div className="ec" style={{height:"100%",borderRadius:20,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                    <div style={{height:4,background:"linear-gradient(90deg,#0A2540,#F7B500)",flexShrink:0}}/>
                    <div style={{position:"relative",height:180,background:"linear-gradient(135deg,#0A2540,#1a3f6f)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                      {ex.photo?<img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none";}}/>:<div style={{width:80,height:80,borderRadius:"50%",background:"rgba(247,181,0,.2)",border:"3px solid #F7B500",display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontWeight:800,fontSize:28}}>{ini}</div>}
                    </div>
                    <div style={{padding:"20px 22px 0",flex:1,display:"flex",flexDirection:"column"}}>
                      <div style={{marginBottom:14}}><h3 style={{fontWeight:700,color:"#0A2540",fontSize:20,marginBottom:6}}>{name}</h3><span style={{fontSize:12,fontWeight:700,color:"#92400E",background:"#FEF3C7",borderRadius:6,padding:"3px 10px"}}>{ex.domaine||"Expert"}</span></div>
                      {ex.description&&<p style={{fontSize:13,color:"#64748B",lineHeight:1.75,marginBottom:14,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical" as any,overflow:"hidden"}}>{ex.description}</p>}
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:12,color:"#94A3B8"}}>{tr.experts_exp}</span><span style={{fontSize:12,color:"#334155",fontWeight:600}}>{expText}</span></div>
                    </div>
                    <div style={{padding:"14px 22px 22px",display:"flex",gap:8,marginTop:"auto"}}>
                      <button onClick={()=>setModal(true)} style={{flex:1,fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#0A2540",color:"#fff",border:"none",borderRadius:10,padding:"11px 14px",cursor:"pointer",transition:"all .22s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onMouseEnter={e=>{e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}} onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="#fff";}}>{tr.experts_msg}</button>
                      <button onClick={()=>setModal(true)} style={{flex:1,fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#F7B500",color:"#0A2540",border:"none",borderRadius:10,padding:"11px 14px",cursor:"pointer",transition:"all .22s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onMouseEnter={e=>e.currentTarget.style.background="#e6a800"} onMouseLeave={e=>e.currentTarget.style.background="#F7B500"}>{tr.experts_book}</button>
                    </div>
                  </div>
                </Reveal>
              );})}
            </div>
          )}
          <Reveal delay={.38}><div style={{textAlign:"center",marginTop:52}}><Link href="/experts" className="bg">{tr.experts_all} <FaArrowRight size={12}/></Link></div></Reveal>
        </div>
      </section>

      {/* ══ PARTENAIRES ══ */}
      <section style={{padding:"72px 0",background:"#FFFFFF",overflow:"hidden"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 28px",marginBottom:48}}><Reveal><div style={{textAlign:"center"}}><h2 style={{fontWeight:700,fontSize:"clamp(30px,3.5vw,48px)",color:"#0A2540"}}>{tr.partners_title} <span style={{color:"#F7B500"}}>{tr.partners_title2}</span></h2></div></Reveal></div>
        {[{cls:"mL",dir:true},{cls:"mR",dir:false}].map(({cls},ri)=>(
          <div key={ri} style={{overflow:"hidden",position:"relative",marginBottom:ri===0?32:0}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:120,background:"linear-gradient(90deg,#FFFFFF,transparent)",zIndex:10,pointerEvents:"none"}}/>
            <div style={{position:"absolute",right:0,top:0,bottom:0,width:120,background:"linear-gradient(270deg,#FFFFFF,transparent)",zIndex:10,pointerEvents:"none"}}/>
            <div className={cls}>
              {[...LOGOS,...LOGOS,...LOGOS,...LOGOS].map((logo,i)=>(
                <img key={`r${ri}-${i}`} src={logo} alt="" style={{height:62,width:"auto",maxWidth:170,objectFit:"contain",flexShrink:0,opacity:.7,transition:"opacity .3s,transform .3s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLImageElement).style.opacity="1";(e.currentTarget as HTMLImageElement).style.transform="scale(1.08)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLImageElement).style.opacity=".7";(e.currentTarget as HTMLImageElement).style.transform="scale(1)";}}
                  onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none";}}/>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section style={{padding:"100px 28px",background:"#FFFFFF"}}>
        <div style={{maxWidth:900,margin:"0 auto",width:"100%"}}>
          <Reveal><div style={{textAlign:"center",marginBottom:60}}><span className="ey" style={{justifyContent:"center",marginBottom:16}}>{tr.temo_badge}</span><h2 style={{fontWeight:700,fontSize:"clamp(30px,4vw,48px)",color:"#0A2540"}}>{tr.temo_title} <span style={{color:"#F7B500"}}>{tr.temo_title2}</span></h2></div></Reveal>
          {temoLoad&&<div style={{textAlign:"center",padding:"60px 0"}}><div style={{width:42,height:42,border:"3px solid #F7B500",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/></div>}
          {!temoLoad&&temos.length===0&&(<div style={{background:"#0A2540",borderRadius:28,padding:"60px 40px",textAlign:"center",maxWidth:600,margin:"0 auto",border:"1px solid rgba(247,181,0,.2)"}}><div style={{fontSize:48,marginBottom:16}}>💬</div><div style={{fontSize:24,fontWeight:700,color:"#fff",marginBottom:12}}>{tr.temo_empty}</div><div style={{fontSize:14,color:"rgba(255,255,255,.7)",lineHeight:1.7}}>{tr.temo_empty_sub}</div></div>)}
          {!temoLoad&&temos.length>0&&tInfo&&(
            <div style={{width:"100%"}}>
              <Reveal delay={.14}>
                <div style={{display:"flex",justifyContent:"center",width:"100%"}}>
                  <div style={{background:"#0A2540",borderRadius:28,padding:"48px 56px",boxShadow:"0 20px 48px -12px rgba(0,0,0,.08)",position:"relative",border:"1px solid rgba(247,181,0,.2)",maxWidth:800,width:"100%",margin:"0 auto",opacity:tAnim?0:1,transform:tAnim?"scale(.97)":"scale(1)",transition:"all .3s ease"}}>
                    <FaQuoteLeft style={{position:"absolute",top:32,left:40,fontSize:42,color:"rgba(247,181,0,.15)"}}/>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><StarDisplay rating={tInfo.note} size={22}/></div>
                    <p style={{fontStyle:"italic",color:"#fff",lineHeight:1.8,textAlign:"center",marginBottom:36,fontSize:"clamp(18px,2.2vw,24px)",fontWeight:500}}>&ldquo;{curTemo?.texte}&rdquo;</p>
                    <div style={{textAlign:"center"}}>
                      <div style={{width:64,height:64,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#0A2540",fontWeight:700,fontSize:20,margin:"0 auto 16px",background:"linear-gradient(135deg,#F7B500,#e6a800)",boxShadow:"0 8px 20px rgba(247,181,0,.3)"}}>{tInfo.ini}</div>
                      <div style={{fontWeight:700,color:"#fff",fontSize:20,marginBottom:6}}>{tInfo.full}</div>
                      <div style={{color:"#F7B500",fontSize:13,fontWeight:600,letterSpacing:.8,textTransform:"uppercase"}}>{tInfo.sub}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              {temos.length>1&&(
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:16,marginTop:40}}>
                  <button onClick={()=>goT((tIdx-1+temos.length)%temos.length)} style={{width:48,height:48,background:"#0A2540",color:"#fff",borderRadius:"50%",border:"1px solid rgba(247,181,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}} onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="#fff";}}><FaChevronLeft/></button>
                  <div style={{display:"flex",justifyContent:"center",gap:10,alignItems:"center"}}>{temos.map((_,i)=><button key={i} onClick={()=>goT(i)} style={{height:8,borderRadius:99,border:"none",cursor:"pointer",padding:0,transition:"all .3s",width:i===tIdx?32:8,background:i===tIdx?"#F7B500":"rgba(10,37,64,.2)"}}/>)}</div>
                  <button onClick={()=>goT((tIdx+1)%temos.length)} style={{width:48,height:48,background:"#0A2540",color:"#fff",borderRadius:"50%",border:"1px solid rgba(247,181,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}} onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="#fff";}}><FaChevronRight/></button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <section style={{padding:"88px 28px",background:"#FFFFFF"}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <Reveal>
            <div style={{borderRadius:24,overflow:"hidden",background:"#FFF8E1",boxShadow:"0 24px 60px rgba(0,0,0,.08)",position:"relative",padding:"52px 48px",textAlign:"center"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(247,181,0,.08) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
              <div style={{position:"relative",zIndex:10}}>
                <div style={{width:64,height:64,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#0A2540",background:"linear-gradient(135deg,#F7B500,#e6a800)",boxShadow:"0 8px 20px rgba(247,181,0,.28)",margin:"0 auto 24px"}}><FaEnvelope/></div>
                <span className="ey" style={{justifyContent:"center",marginBottom:16}}>{tr.nl_badge}</span>
                <h2 style={{fontSize:24,fontWeight:700,color:"#0A2540",marginBottom:16}}>{tr.nl_title} <span style={{color:"#F7B500"}}>{tr.nl_title2}</span></h2>
                <p style={{color:"#64748B",fontSize:15,lineHeight:1.8,maxWidth:500,margin:"0 auto 32px"}}>{tr.nl_p}</p>
                {sent?(<div style={{maxWidth:450,margin:"0 auto",borderRadius:14,padding:"20px 24px",color:"#059669",fontSize:16,fontWeight:700,background:"#ECFDF5",border:"1px solid #A7F3D0",textAlign:"center"}}><FaCheck style={{marginBottom:8,fontSize:22,display:"block",margin:"0 auto 8px"}}/> {tr.nl_success}</div>):(
                  <form onSubmit={handleNewsletter} style={{maxWidth:450,margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>
                    <input type="email" value={mail} onChange={e=>{setMail(e.target.value);setNlError("");}} placeholder={tr.nl_placeholder} required style={{width:"100%",padding:"16px 20px",border:"1.5px solid #0A2540",borderRadius:14,fontSize:14,outline:"none",transition:"all .2s",backgroundColor:"#FFFFFF",fontFamily:"'Outfit',sans-serif"}} onFocus={e=>{e.currentTarget.style.borderColor="#F7B500";e.currentTarget.style.boxShadow="0 0 0 3px rgba(247,181,0,.1)";}} onBlur={e=>{e.currentTarget.style.borderColor="#0A2540";e.currentTarget.style.boxShadow="none";}}/>
                    <button type="submit" disabled={nlLoading} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"16px",background:"#0A2540",color:"#F7B500",borderRadius:14,fontSize:14,fontWeight:600,cursor:nlLoading?"not-allowed":"pointer",border:"none",fontFamily:"'Outfit',sans-serif",transition:"all .2s",opacity:nlLoading?.7:1}} onMouseEnter={e=>{if(!nlLoading){e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}}} onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="#F7B500";}}>{nlLoading?tr.nl_loading:<><span>{tr.nl_btn}</span><FaArrowRight size={12}/></>}</button>
                    {nlError&&<div style={{marginTop:8,color:"#DC2626",fontSize:13,textAlign:"center"}}>{nlError}</div>}
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ ARTICLES ══ */}
      <section style={{padding:"88px 28px 100px",background:"#F8FAFC"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <Reveal>
            <div style={{textAlign:"center",marginBottom:52}}>
              <span className="ey" style={{justifyContent:"center",marginBottom:16}}>{tr.art_badge}</span>
              <h2 style={{fontWeight:700,fontSize:"clamp(30px,4vw,48px)",color:"#0A2540"}}>
                {tr.art_title} <span style={{color:"#F7B500"}}>{tr.art_title2}</span>
              </h2>
            </div>
          </Reveal>
          {articlesAccueil.length===0?(
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>📝</div>
              <div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>{tr.art_empty}</div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:28}}>
              {articlesAccueil.map((art,i)=>(
                <Reveal key={art.id||i} delay={i*.12}>
                  <Link href={`/blog/${art.id}`} className="art-card">
                    <div style={{position:"relative",height:220,background:"linear-gradient(135deg,#0A2540,#1a3f6f)",overflow:"hidden",flexShrink:0}}>
                      {art.image?<img src={`http://localhost:3001/uploads/articles-img/${art.image}`} alt={art.titre} className="art-img" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none";}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>📝</div>}
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 40%,rgba(10,37,64,.6) 100%)"}}/>
                      <div style={{position:"absolute",top:16,left:16}}><span style={{background:art.couleur_point||"#3B82F6",color:"#fff",borderRadius:99,padding:"4px 12px",fontSize:11.5,fontWeight:700}}>{art.categorie||art.type||"Article"}</span></div>
                    </div>
                    <div style={{padding:"22px 24px 24px",display:"flex",flexDirection:"column",flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <FaCalendarAlt size={11} style={{color:"#94A3B8"}}/>
                        <span style={{fontSize:12,color:"#94A3B8",fontWeight:500}}>{new Date(art.createdAt).toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                        {art.acces_prive&&<span style={{display:"flex",alignItems:"center",gap:3,background:"#FFF8E1",color:"#B45309",borderRadius:99,padding:"2px 8px",fontSize:10.5,fontWeight:700}}><FaLock size={8}/> {tr.art_members}</span>}
                      </div>
                      <h3 style={{fontWeight:700,color:"#0A2540",fontSize:19,lineHeight:1.35,marginBottom:12,flex:1}}>{art.titre}</h3>
                      <p style={{fontSize:13,color:"#64748B",lineHeight:1.78,marginBottom:20,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical" as any,overflow:"hidden"}}>{art.description}</p>
                      <div style={{display:"flex",alignItems:"center",gap:6,color:"#F7B500",fontSize:13,fontWeight:700}}>{tr.art_read} <FaArrowRight size={11}/></div>
                    </div>
                    <div style={{height:3,background:`linear-gradient(90deg,${art.couleur_point||"#3B82F6"},${art.couleur_point||"#3B82F6"}33)`,flexShrink:0}}/>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
          <Reveal delay={.38}>
            <div style={{textAlign:"center",marginTop:52}}>
              <Link href="/blog" className="bd">{tr.art_all} <FaArrowRight size={12}/></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER — VERSION RÉDUITE ══ */}
      <footer style={{background:"#05101E",color:"#fff",padding:"24px 28px 0"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>

          {/* Ligne principale — une seule rangée compacte */}
          <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 1.2fr",gap:20,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,.06)"}}>

            {/* Marque */}
            <div>
              <Link href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none",marginBottom:10}}>
                <svg width="24" height="24" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="12" fontWeight="900" fontFamily="Arial">BEH</text></svg>
                <span style={{fontWeight:700,fontSize:13,color:"#fff"}}>Business <span style={{color:"#F7B500"}}>Expert</span> Hub</span>
              </Link>
              <p style={{color:"rgba(255,255,255,.22)",fontSize:11,lineHeight:1.6,marginBottom:12,maxWidth:220}}>{tr.foot_desc}</p>
              <div style={{display:"flex",gap:6}}>
                {[
                  {Icon:FaFacebookF,href:"https://facebook.com",bg:"#1877F2"},
                  {Icon:FaInstagram,href:"https://instagram.com",bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"},
                  {Icon:FaLinkedinIn,href:"https://linkedin.com",bg:"#0A66C2"}
                ].map((s,i)=>(
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{width:28,height:28,borderRadius:7,background:s.bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",transition:"all .2s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="translateY(-3px)";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 6px 16px rgba(0,0,0,.3)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="none";(e.currentTarget as HTMLAnchorElement).style.boxShadow="none";}}>
                    <s.Icon style={{fontSize:10}}/>
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{color:"rgba(255,255,255,.3)",fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{tr.foot_nav}</h4>
              <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:5}}>
                {[
                  {l:tr.nav_home,h:"/"},
                  {l:tr.nav_about,h:"/a-propos"},
                  {l:tr.nav_services,h:"/services"},
                  {l:tr.nav_experts,h:"/experts"},
                  {l:tr.nav_blog,h:"/blog"},
                  {l:tr.nav_contact,h:"/contact"}
                ].map(({l,h})=>(
                  <li key={l}>
                    <Link href={h}
                      style={{color:"rgba(255,255,255,.25)",fontSize:11.5,textDecoration:"none",display:"flex",alignItems:"center",gap:6,transition:"color .2s"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.25)"}>
                      <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(247,181,0,.3)",flexShrink:0}}/>{l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 style={{color:"rgba(255,255,255,.3)",fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{tr.foot_services}</h4>
              <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:5}}>
                {SERVICES.map(s=>(
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`}
                      style={{color:"rgba(255,255,255,.25)",fontSize:11.5,textDecoration:"none",display:"flex",alignItems:"center",gap:6,transition:"color .2s"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.25)"}>
                      <span style={{width:3,height:3,borderRadius:"50%",background:"rgba(247,181,0,.3)",flexShrink:0}}/>{s.label[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{color:"rgba(255,255,255,.3)",fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{tr.foot_contact}</h4>
              <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:7}}>
                {[
                  {Icon:FaEnvelope,text:"contact@beh.com",href:"mailto:contact@beh.com"},
                  {Icon:FaPhone,text:"+216 00 000 000",href:"tel:+21600000000"},
                  {Icon:FaMapMarkerAlt,text:"Tunis, Tunisie",href:"#"}
                ].map((item,i)=>(
                  <li key={i}>
                    <a href={item.href}
                      style={{color:"rgba(255,255,255,.25)",fontSize:11.5,textDecoration:"none",display:"flex",alignItems:"center",gap:7,transition:"color .2s"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.25)"}>
                      <div style={{width:22,height:22,borderRadius:6,background:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10}}>
                        <item.Icon/>
                      </div>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bas du footer — copyright minimaliste */}
          <div style={{padding:"10px 0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
            <p style={{margin:0,color:"rgba(255,255,255,.14)",fontSize:10}}>{tr.foot_copy}</p>
            <div style={{display:"flex",gap:12}}>
              {[tr.foot_legal,tr.foot_privacy].map(l=>(
                <Link key={l} href="#"
                  style={{color:"rgba(255,255,255,.14)",fontSize:10,textDecoration:"none",transition:"color .2s"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.14)"}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}