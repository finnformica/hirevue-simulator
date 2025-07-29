from utils import cosine_similarity
from models.pipelines import grammar_pipe, embed_pipe

def analyse_grammar(text: str):
    # 1. Correct the whole text
    corrected = grammar_pipe(text, max_length=512)[0]['generated_text']
    # 2. Get embeddings
    orig_embed = embed_pipe(text)[0][0]
    corr_embed = embed_pipe(corrected)[0][0]
    # 3. Cosine similarity
    similarity = cosine_similarity(orig_embed, corr_embed)
    error_rate = (1 - similarity) * 100
    rating = "Excellent" if error_rate <= 2 else "Good" if error_rate <= 5 else "Needs Improvement"
    # 4. Sentence-level examples (Jaccard)
    orig_sentences = [s.strip() for s in text.split('.') if s.strip()]
    corr_sentences = [s.strip() for s in corrected.split('.') if s.strip()]
    errors = []
    for orig in orig_sentences:
        best_match = max(corr_sentences, key=lambda corr: len(set(orig.split()) & set(corr.split())) / len(set(orig.split()) | set(corr.split())), default="")
        score = len(set(orig.split()) & set(best_match.split())) / len(set(orig.split()) | set(best_match.split())) if best_match else 0
        if score < 0.8 and orig != best_match:
            errors.append({
                "type": "grammar",
                "original": orig,
                "suggestion": best_match,
                "context": f"Jaccard similarity: {score:.2f}"
            })
    return {
        "errorRate": error_rate,
        "totalErrors": len(errors),
        "errors": errors,
        "rating": rating
    } 