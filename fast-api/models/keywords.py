from transformers import pipeline
from utils import cosine_similarity
from utils import to_python_type

embed_pipe = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")

def analyse_keywords(text: str, required_keywords: list):
    # Batch embedding for all keywords
    text_embed = embed_pipe(text)[0][0]
    keyword_embeds = [embed_pipe(k)[0][0] for k in required_keywords]
    similarities = [cosine_similarity(text_embed, k_emb) for k_emb in keyword_embeds]
    threshold = 0.7
    matches = []
    for i, sim in enumerate(similarities):
        matches.append({
            "keyword": required_keywords[i],
            "weight": sim,
            "matched": sim > threshold,
            "similarity": sim
        })
    matched = [m for m in matches if m["matched"]]
    missed = [m["keyword"] for m in matches if not m["matched"]]
    score = sum(m["similarity"] for m in matched)
    coverage = (len(matched) / len(required_keywords)) * 100 if required_keywords else 0
    return to_python_type({
        "matched": matched,
        "missed": missed,
        "score": score,
        "coverage": coverage
    }) 