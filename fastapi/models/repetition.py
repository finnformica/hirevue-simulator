from collections import Counter
from utils import to_python_type

def analyse_repetition(text: str):
    words = [w.lower() for w in text.split() if len(w) > 3]
    word_counts = Counter(words)
    word_frequency = [
        {"word": word, "count": count}
        for word, count in word_counts.items() if count > 2
    ]
    unique_words = len(set(words))
    repetition_score = unique_words / len(words) if words else 0
    rating = "Good" if repetition_score > 0.7 else ("Moderate" if repetition_score > 0.5 else "High")
    return to_python_type({
        "wordFrequency": word_frequency,
        "phraseRepetition": [],  # Could be implemented with n-gram analysis
        "repetitionScore": repetition_score,
        "rating": rating
    }) 