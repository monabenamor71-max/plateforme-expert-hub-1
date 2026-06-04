import pandas as pd
import joblib
import warnings
import numpy as np
warnings.filterwarnings("ignore")

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

print("="*60)
print("   PIPELINE NLP - ENTRAINEMENT 3 MODELES")
print("="*60)

# ETAPE 1 - Charger données
print("\nETAPE 1 - Chargement des donnees...")
df = pd.read_csv("resume_clean.csv")
X = df["clean_text"]
y = df["Category"]
print(f"Total CVs    : {len(df)}")
print(f"Categories   : {df['Category'].nunique()}")

# ETAPE 2 - Diviser
print("\nETAPE 2 - Division 80% train / 20% test...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train : {len(X_train)} CVs")
print(f"Test  : {len(X_test)} CVs")

# ETAPE 3 - Définir modèles NLP
print("\nETAPE 3 - Definition des 3 modeles NLP...")

models = {
    "TF-IDF + SVM": {
        "description": "TF-IDF transforme le texte en vecteurs. SVM trouve la meilleure frontiere entre categories.",
        "pipeline": Pipeline([
            ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1,3), sublinear_tf=True)),
            ("clf",   SVC(kernel="linear", probability=True, C=1.0))
        ])
    },
    "TF-IDF + LogisticRegression": {
        "description": "TF-IDF + regression logistique. Simple mais efficace pour classification de texte.",
        "pipeline": Pipeline([
            ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1,3), sublinear_tf=True)),
            ("clf",   LogisticRegression(max_iter=1000, C=5.0, solver="saga"))
        ])
    },
    "TF-IDF + GradientBoosting": {
        "description": "TF-IDF + GradientBoosting. Apprend de ses erreurs a chaque iteration.",
        "pipeline": Pipeline([
            ("tfidf", TfidfVectorizer(max_features=8000, sublinear_tf=True)),
            ("clf",   GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, random_state=42))
        ])
    },
}

# ETAPE 4 - Entraîner et tester
print("\nETAPE 4 - Entrainement et Test...")
print("="*60)
print(f"{'Modele':<35} {'Acc':>6} {'F1':>6} {'CV':>6}")
print("="*60)

results = {}
for name, info in models.items():
    print(f"\nModele : {name}")
    print(f"Description : {info['description']}")
    print(f"Entrainement en cours...", flush=True)
    
    model = info["pipeline"]
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    
    acc  = accuracy_score(y_test, preds)
    f1   = f1_score(y_test, preds, average="weighted", zero_division=0)
    prec = precision_score(y_test, preds, average="weighted", zero_division=0)
    rec  = recall_score(y_test, preds, average="weighted", zero_division=0)
    cv   = cross_val_score(model, X, y, cv=5, scoring="accuracy").mean()
    
    results[name] = {
        "accuracy": acc, "f1": f1,
        "precision": prec, "recall": rec,
        "cv_score": cv, "model": model, "preds": preds
    }
    
    print(f"Accuracy  : {acc*100:.1f}%")
    print(f"Precision : {prec*100:.1f}%")
    print(f"Recall    : {rec*100:.1f}%")
    print(f"F1 Score  : {f1*100:.1f}%")
    print(f"CrossVal  : {cv*100:.1f}%")
    print("-"*60)

# ETAPE 5 - Comparer
print("\nETAPE 5 - Comparaison des modeles...")
print("="*60)
print(f"{'Modele':<35} {'Accuracy':>9} {'F1':>8} {'CrossVal':>9}")
print("="*60)

best_name = max(results, key=lambda k: results[k]["f1"])
for name, r in results.items():
    tag = " <- MEILLEUR" if name == best_name else ""
    print(f"{name:<35} {r['accuracy']*100:>8.1f}% {r['f1']*100:>7.1f}% {r['cv_score']*100:>8.1f}%{tag}")

print("="*60)

# ETAPE 6 - Rapport détaillé du meilleur
best = results[best_name]
print(f"\nETAPE 6 - Rapport detaille : {best_name}")
print(classification_report(y_test, best["preds"], zero_division=0))

# ETAPE 7 - Sauvegarder
print("ETAPE 7 - Sauvegarde du meilleur modele...")
joblib.dump(best["model"], "best_model.pkl")
print(f"Modele sauvegarde : best_model.pkl")
print(f"Modele choisi     : {best_name}")
print(f"F1 Score final    : {best['f1']*100:.1f}%")
print(f"Accuracy finale   : {best['accuracy']*100:.1f}%")
print("="*60)