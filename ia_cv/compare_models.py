import pandas as pd
import joblib
import warnings
import matplotlib.pyplot as plt
import numpy as np
warnings.filterwarnings("ignore")
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

print("Chargement des donnees...")
df = pd.read_csv("resume_clean.csv")
X = df["clean_text"]
y = df["Category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

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

# Explications de chaque modèle
explications = {
    "LogisticRegression": "Modele lineaire simple et rapide. Bien pour texte.",
    "SVM":                "Trouve la meilleure separation entre categories.",
    "RandomForest":       "Combine plusieurs arbres de decision. Robuste.",
    "GradientBoosting":   "Apprend des erreurs precedentes. Tres performant.",
    "NaiveBayes":         "Base sur probabilites. Rapide mais moins precis.",
}

results = {}
print("\nEntrainement et test de chaque modele...\n")

for name, model in models.items():
    print(f"Modele : {name}")
    print(f"Description : {explications[name]}")
    
    # Entraînement
    model.fit(X_train, y_train)
    
    # Test
    preds = model.predict(X_test)
    
    # Scores
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
        "model":     model
    }
    
    print(f"Accuracy  : {acc*100:.1f}%")
    print(f"Precision : {prec*100:.1f}%")
    print(f"Recall    : {rec*100:.1f}%")
    print(f"F1 Score  : {f1*100:.1f}%")
    print(f"CrossVal  : {cv*100:.1f}%")
    print("-"*45)

# Choisir le meilleur
best_name = max(results, key=lambda k: results[k]["f1"])
best = results[best_name]

print(f"\nMEILLEUR MODELE : {best_name}")
print(f"F1 Score        : {best['f1']*100:.1f}%")
print(f"Accuracy        : {best['accuracy']*100:.1f}%")

# Sauvegarder
joblib.dump(best["model"], "best_model.pkl")
print(f"best_model.pkl sauvegarde !")

# Histogramme de comparaison
names     = list(results.keys())
accuracy  = [results[n]["accuracy"]  * 100 for n in names]
precision = [results[n]["precision"] * 100 for n in names]
recall    = [results[n]["recall"]    * 100 for n in names]
f1_scores = [results[n]["f1"]        * 100 for n in names]

x     = np.arange(len(names))
width = 0.2

fig, ax = plt.subplots(figsize=(14, 7))
ax.bar(x - 1.5*width, accuracy,  width, label="Accuracy",  color="#4C9BE8")
ax.bar(x - 0.5*width, precision, width, label="Precision", color="#E8844C")
ax.bar(x + 0.5*width, recall,    width, label="Recall",    color="#4CE8A0")
ax.bar(x + 1.5*width, f1_scores, width, label="F1 Score",  color="#A04CE8")

ax.set_xlabel("Modeles NLP")
ax.set_ylabel("Score (%)")
ax.set_title("Comparaison des modeles NLP pour analyse de CVs")
ax.set_xticks(x)
ax.set_xticklabels(names, rotation=15)
ax.set_ylim(0, 100)
ax.legend()
ax.grid(axis="y", alpha=0.3)

# Marquer le meilleur
best_idx = names.index(best_name)
ax.axvline(x=best_idx, color="red", linestyle="--", alpha=0.5, label=f"Meilleur: {best_name}")
ax.annotate(f"MEILLEUR\n{best_name}", xy=(best_idx, 80),
            ha="center", color="red", fontweight="bold")

plt.tight_layout()
plt.savefig("comparaison_modeles.png")
plt.show()
print("Graphique sauvegarde : comparaison_modeles.png")