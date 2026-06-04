def calculer_score(cv_info: dict) -> dict:
    score = 0
    details = {}

    exp = cv_info.get("experience") or 0
    if exp >= 10:
        score_exp = 30
    elif exp >= 5:
        score_exp = 20
    elif exp >= 2:
        score_exp = 10
    else:
        score_exp = 5
    score += score_exp
    details["experience"] = f"{score_exp}/30 ({exp} ans)"

    skills = cv_info.get("skills") or []
    score_skills = min(len(skills) * 5, 30)
    score += score_skills
    details["skills"] = f"{score_skills}/30 ({len(skills)} skills)"

    confidence = cv_info.get("confidence") or 0
    score_ia = int(confidence * 30)
    score += score_ia
    details["ia_confidence"] = f"{score_ia}/30 ({confidence*100:.0f}%)"

    ville = cv_info.get("ville") or ""
    score_ville = 10 if ville else 0
    score += score_ville
    details["ville"] = f"{score_ville}/10 ({ville})"

    return {
        "score_final":    score,
        "niveau":         "Excellent" if score >= 80 else "Bon" if score >= 60 else "Moyen" if score >= 40 else "Faible",
        "details":        details,
        "recommandation": "ACCEPTER" if score >= 60 else "REFUSER"
    }