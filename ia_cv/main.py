import io
import joblib
import re
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from extract_cv import extract_info

app = FastAPI(title="CV Analyzer API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Chargement du modèle
model = joblib.load("best_model.pkl")

# Configuration par défaut
score_config = {
    "poids_competences": 8,
    "poids_experience": 5,
    "bonus_diplome": 15,
    "seuil_accepte": 70,
    "seuil_pending": 40,
    "age_min": 18,
    "age_max": 60,
    "sexe_prefere": "tous",
    "localisations_acceptees": ["Toute la Tunisie"],
    "experience_min_ans": 0
}

class ConfigUpdate(BaseModel):
    poids_competences: Optional[int] = None
    poids_experience: Optional[int] = None
    bonus_diplome: Optional[int] = None
    seuil_accepte: Optional[int] = None
    seuil_pending: Optional[int] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    sexe_prefere: Optional[str] = None
    localisations_acceptees: Optional[List[str]] = None
    experience_min_ans: Optional[int] = None

def clean_text(text):
    text = re.sub(r'\s+', ' ', text.lower())
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    stop = {"the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","was","are","were"}
    return " ".join([w for w in text.split() if w not in stop and len(w) > 2])

def extract_pdf_text(file_bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + " "
    return text.strip()

def score_cv(info, ville, age_min, age_max, exp_min, sexe, skills):
    score = 0
    details = {}

    # Ville 20 points
    if ville:
        v = (info.get("ville") or "").lower()
        if ville.lower() in v:
            score += 20
            details["ville"] = 20
        else:
            details["ville"] = 0
    else:
        score += 20
        details["ville"] = 20

    # Age 20 points
    age = info.get("age")
    if age and (age_min or age_max):
        ok = True
        if age_min and age < age_min:
            ok = False
        if age_max and age > age_max:
            ok = False
        pts = 20 if ok else 0
        score += pts
        details["age"] = pts
    else:
        score += 20
        details["age"] = 20

    # Experience 25 points
    exp = info.get("experience") or 0
    if exp_min:
        if exp >= exp_min:
            pts = 25
            score += pts
            details["experience"] = pts
        elif exp >= exp_min - 1:
            pts = 15
            score += pts
            details["experience"] = pts
        else:
            details["experience"] = 0
    else:
        score += 25
        details["experience"] = 25

    # Skills 25 points
    skills_list = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    if skills_list:
        cv_skills = [s.lower() for s in (info.get("skills") or [])]
        matches = [s for s in skills_list if s.lower() in cv_skills]
        pts = int((len(matches) / len(skills_list)) * 25)
        score += pts
        details["skills"] = pts
    else:
        score += 25
        details["skills"] = 25

    # Sexe 10 points
    if sexe and sexe.lower() not in ["tous", ""]:
        if sexe.lower() == (info.get("sexe") or "").lower():
            score += 10
            details["sexe"] = 10
        else:
            details["sexe"] = 0
    else:
        score += 10
        details["sexe"] = 10

    score_final = min(score, 100)

    return {
        "score_final": score_final,
        "details_score": details,
        "recommandation": "ACCEPTER" if score_final >= 60 else "REFUSER",
        "niveau": "Excellent" if score_final >= 80 else "Bon" if score_final >= 60 else "Moyen" if score_final >= 40 else "Faible"
    }

@app.get("/")
def root():
    return {"message": "CV Analyzer API is running"}

@app.get("/config")
async def get_config():
    """Récupère la configuration actuelle"""
    return score_config

@app.post("/config")
async def update_config(config: ConfigUpdate):
    """Met à jour la configuration"""
    for key, value in config.dict().items():
        if value is not None:
            score_config[key] = value
    return {"message": "Configuration mise à jour", "config": score_config}

@app.post("/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...),
    ville: str = Form(""),
    age_min: int = Form(0),
    age_max: int = Form(0),
    exp_min: int = Form(0),
    sexe: str = Form("tous"),
    skills: str = Form(""),
):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Le fichier doit etre un PDF")
    
    content = await file.read()
    raw_text = extract_pdf_text(content)
    
    if len(raw_text) < 50:
        raise HTTPException(400, "PDF illisible ou vide")

    cleaned = clean_text(raw_text)
    
    # Prédiction du modèle
    try:
        category = model.predict([cleaned])[0]
        confidence = float(max(model.predict_proba([cleaned])[0]))
    except:
        category = "EXPERT"
        confidence = 0.5
    
    SEUIL_CONFIANCE = 0.35
    if confidence < SEUIL_CONFIANCE:
        category = "AUTRE / NON RECONNU"
    
    info = extract_info(raw_text)
    resultat = score_cv(info, ville, age_min, age_max, exp_min, sexe, skills)

    # Utiliser la configuration globale pour les seuils
    final_recommandation = "ACCEPTER" if resultat["score_final"] >= score_config["seuil_accepte"] else "REFUSER"

    return {
        "category": category,
        "confidence": round(confidence, 3),
        "is_valid_cv": confidence > 0.5,
        "email": info.get("email"),
        "telephone": info.get("telephone"),
        "age": info.get("age"),
        "experience": info.get("experience"),
        "ville": info.get("ville"),
        "sexe": info.get("sexe"),
        "skills": info.get("skills"),
        "skills_found": info.get("skills", []),
        "score_final": resultat["score_final"],
        "niveau": resultat["niveau"],
        "recommandation": final_recommandation,
        "details_score": resultat["details_score"],
    }