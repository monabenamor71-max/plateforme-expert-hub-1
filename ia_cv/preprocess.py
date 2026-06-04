import pandas as pd
import re
import warnings
warnings.filterwarnings("ignore")

def clean_text(text):
    if not isinstance(text, str) or len(text) < 10:
        return ""
    text = re.sub(r'\s+', ' ', text.lower())
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    words = text.split()
    stopwords = {"the","a","an","and","or","but","in","on","at","to","for",
                 "of","with","by","from","is","was","are","were","be","been",
                 "have","has","had","do","did","will","would","could","should"}
    tokens = [w for w in words if w not in stopwords and len(w) > 2]
    return " ".join(tokens)

if __name__ == "__main__":
    print("Chargement Resume.csv...")
    df = pd.read_csv("Resume/Resume.csv")
    print(f"Total : {len(df)} CVs")
    print(f"Categories : {df['Category'].nunique()} categories")
    print("Nettoyage en cours...")
    df["clean_text"] = df["Resume_str"].apply(clean_text)
    df = df[df["clean_text"].str.len() > 50]
    df.to_csv("resume_clean.csv", index=False)
    print(f"DONE - resume_clean.csv cree ! ({len(df)} CVs)")