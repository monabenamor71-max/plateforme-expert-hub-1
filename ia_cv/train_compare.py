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
from sklearn.metrics import accuracy_score, classification_report

print("Chargement des donnees...")
df = pd.read_csv("resume_clean.csv")
X = df["clean_text"]
y = df["Category"]
print(f"Total CVs : {len(df)}")

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

print("\n" + "="*55)
print(f"{'Modele':<20} {'Accuracy':>10} {'Cross-Val':>12}")
print("="*55)

results = {}
for name, model in models.items():
    print(f"Entrainement {name}...")
    model.fit(X_train, y_train)
    preds    = model.predict(X_test)
    acc      = accuracy_score(y_test, preds)
    cv_score = cross_val_score(model, X, y, cv=3, scoring="accuracy").mean()
    results[name] = {"accuracy": acc, "cv_score": cv_score, "model": model}
    print(f"{name:<20} {acc:>10.3f} {cv_score:>12.3f}")

print("="*55)

best_name = max(results, key=lambda k: results[k]["cv_score"])
best_info = results[best_name]

print(f"\nMEILLEUR MODELE  : {best_name}")
print(f"Accuracy         : {best_info['accuracy']*100:.1f}%")
print(f"Cross-Val Score  : {best_info['cv_score']*100:.1f}%")
print(f"\nRapport detaille :")
print(classification_report(y_test, best_info["model"].predict(X_test)))

joblib.dump(best_info["model"], "best_model.pkl")
print("Modele sauvegarde : best_model.pkl")