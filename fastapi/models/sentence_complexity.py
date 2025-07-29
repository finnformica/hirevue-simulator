from models.pipelines import zero_shot_pipe

def analyse_sentence_complexity(text: str):
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    candidate_labels = ["simple", "compound", "complex", "compound-complex"]
    results = [zero_shot_pipe(s, candidate_labels=candidate_labels) for s in sentences]
    counts = {label: 0 for label in candidate_labels}
    for r in results:
        label = r['labels'][0]
        counts[label] += 1
    total = sum(counts.values())
    complexity_ratio = (counts["complex"] + counts["compound-complex"]) / total if total else 0
    rating = "Balanced" if 0.3 <= complexity_ratio <= 0.7 else "Too Simple" if complexity_ratio < 0.3 else "Too Complex"
    return {
        **counts,
        "averageLength": sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0,
        "complexityRatio": complexity_ratio,
        "rating": rating
    } 