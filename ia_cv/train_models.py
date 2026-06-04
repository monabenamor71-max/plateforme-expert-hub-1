import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

df = pd.read_csv("resume_clean.csv")
X = df["clean_text"]
y = df["Category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "LogisticRegression": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1,2))),
        ("clf",   LogisticRegression(max_iter=1000))
    ]),
    "SVM": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1,2))),
        ("clf",   SVC(kernel="linear", probability=True))
    ]),
    "RandomForest": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000)),
        ("clf",   RandomForestClassifier(n_estimators=100, random_state=42))
    ]),
}

results = {}
for name, model in models.items():
    print(f"\nEntrainement {name}...")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc   = accuracy_score(y_test, preds)
    results[name] = (acc, model)
    print(f"Accuracy : {acc:.3f}")
    print(classification_report(y_test, preds))

best_name = max(results, key=lambda k: results[k][0])
best_score, best_model = results[best_name]
print(f"\nMeilleur modele : {best_name} | Accuracy : {best_score:.3f}")
joblib.dump(best_model, "best_model.pkl")
print("Modele sauvegarde : best_model.pkl")