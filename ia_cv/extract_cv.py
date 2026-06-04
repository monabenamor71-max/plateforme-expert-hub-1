import re

def extract_info(text):
    info = {
        "nom":        None,
        "email":      None,
        "telephone":  None,
        "ville":      None,
        "age":        None,
        "experience": None,
        "sexe":       None,
        "skills":     []
    }

    email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email:
        info["email"] = email.group()

    tel = re.search(r'(\+?\d[\d\s\-]{8,15})', text)
    if tel:
        info["telephone"] = tel.group().strip()

    age = re.search(r'(\d{2})\s*(ans|years|year old|yo)', text.lower())
    if age:
        info["age"] = int(age.group(1))

    exp = re.search(r'(\d+)\+?\s*(ans|years|yr)?\s*(experience|exp)', text.lower())
    if exp:
        info["experience"] = int(exp.group(1))

    villes = ["tunis", "sfax", "sousse", "bizerte", "nabeul",
              "monastir", "gabes", "ariana", "ben arous", "manouba"]
    text_lower = text.lower()
    for ville in villes:
        if ville in text_lower:
            info["ville"] = ville.capitalize()
            break

    if re.search(r'\b(mr|monsieur|he|his|male|homme)\b', text_lower):
        info["sexe"] = "Homme"
    elif re.search(r'\b(mme|madame|she|her|female|femme)\b', text_lower):
        info["sexe"] = "Femme"

    skills_list = [
        "python", "java", "javascript", "react", "nodejs", "nestjs",
        "nextjs", "sql", "mongodb", "django", "fastapi", "docker",
        "git", "excel", "powerpoint", "php", "laravel", "angular",
        "machine learning", "data analysis", "project management"
    ]
    info["skills"] = [s for s in skills_list if s in text_lower]

    return info