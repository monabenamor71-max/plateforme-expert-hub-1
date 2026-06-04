import pandas as pd
import joblib
import warnings
warnings.filterwarnings("ignore")
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

print("="*65)
print("   PIPELINE ML - ENTRAINEMENT ET EVALUATION DES MODELES NLP")
print("="*65)

# ETAPE 1 - Charger les données
print("\nETAPE 1 - Chargement des donnees...")
df = pd.read_csv("resume_clean.csv")
X = df["clean_text"]
y = df["Category"]
print(f"Total CVs    : {len(df)}")
print(f"Categories   : {df['Category'].nunique()}")
print(f"Distribution : \n{df['Category'].value_counts().to_string()}")

# ETAPE 2 - Diviser en train/test
print("\nETAPE 2 - Division Train/Test (80% / 20%)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train : {len(X_train)} CVs")
print(f"Test  : {len(X_test)} CVs")

# ETAPE 3 - Définir les modèles
print("\nETAPE 3 - Modeles NLP a entrainer...")
models = {
    "LogisticRegression": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=8000, ngram_range=(1,2))),
        ("clf",   LogisticRegression(max_iter=1000))
    ]),
    "SVM": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=8000, ngram_range=(1,2))),
        ("clf",   SVC(kernel="linear", probability=True))
    ]),
    "RandomForest": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=8000)),
        ("clf",   RandomForestClassifier(n_estimators=200, random_state=42))
    ]),
    "GradientBoosting": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000)),
        ("clf",   GradientBoostingClassifier(n_estimators=100, random_state=42))
    ]),
    "NaiveBayes": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=8000)),
        ("clf",   MultinomialNB())
    ]),
}
for name in models:
    print(f"  - {name}")

# ETAPE 4 - Entraîner et tester chaque modèle
print("\nETAPE 4 - Entrainement et Test de chaque modele...")
print("="*65)
print(f"{'Modele':<22} {'Accuracy':>9} {'Precision':>10} {'Recall':>8} {'F1':>8} {'CrossVal':>9}")
print("="*65)

results = {}
for name, model in models.items():
    print(f"Entrainement {name}...", flush=True)
    
    # Entraînement
    model.fit(X_train, y_train)
    
    # Test
    preds = model.predict(X_test)
    
    # Métriques
    acc  = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, average="weighted", zero_division=0)
    rec  = recall_score(y_test, preds, average="weighted", zero_division=0)
    f1   = f1_score(y_test, preds, average="weighted", zero_division=0)
    cv   = cross_val_score(model, X, y, cv=3, scoring="accuracy").mean()
    
    results[name] = {
        "accuracy":  acc,
        "precision": prec,
        "recall":    rec,
        "f1":        f1,
        "cv_score":  cv,
        "model":     model,
        "preds":     preds
    }
    
    print(f"{name:<22} {acc:>9.3f} {prec:>10.3f} {rec:>8.3f} {f1:>8.3f} {cv:>9.3f}")

print("="*65)

# ETAPE 5 - Choisir le meilleur
print("\nETAPE 5 - Comparaison et choix du meilleur modele...")
print("-"*65)
for name, r in results.items():
    etoile = " ← MEILLEUR" if name == max(results, key=lambda k: results[k]["f1"]) else ""
    print(f"{name:<22} F1={r['f1']:.3f}  Accuracy={r['accuracy']:.3f}  CrossVal={r['cv_score']:.3f}{etoile}")

best_name = max(results, key=lambda k: results[k]["f1"])
best      = results[best_name]

print("-"*65)
print(f"\nMEILLEUR MODELE  : {best_name}")
print(f"Accuracy         : {best['accuracy']*100:.1f}%")
print(f"Precision        : {best['precision']*100:.1f}%")
print(f"Recall           : {best['recall']*100:.1f}%")
print(f"F1 Score         : {best['f1']*100:.1f}%")
print(f"Cross-Val Score  : {best['cv_score']*100:.1f}%")

# ETAPE 6 - Rapport détaillé
print(f"\nETAPE 6 - Rapport detaille du meilleur modele ({best_name}) :")
print("="*65)
print(classification_report(y_test, best["preds"], zero_division=0))

# ETAPE 7 - Sauvegarder
print("ETAPE 7 - Sauvegarde du meilleur modele...")
joblib.dump(best["model"], "best_model.pkl")
print(f"best_model.pkl sauvegarde !")
print(f"\nCe modele sera utilise par l'API pour analyser les CVs PDF.")
print("="*65)