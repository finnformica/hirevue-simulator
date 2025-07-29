import numpy as np

from utils import to_python_type

FILLER_WORDS = set([
    "um", "uh", "ah", "er", "like", "you know", "sort of", "kind of", "basically", "actually", "literally", "honestly", "maybe", "perhaps", "well", "so", "right", "okay", "anyway", "anyhow"
])

def analyse_fluency(text: str, duration_seconds: float = None):
    words = text.split()
    word_count = len(words)
    filler_words = [w.lower() for w in words if w.lower() in FILLER_WORDS]
    filler_count = len(filler_words)
    duration_minutes = duration_seconds / 60 if duration_seconds else 1
    per_minute = filler_count / duration_minutes if duration_minutes else filler_count
    if per_minute <= 5:
        rating = "Ideal"
    elif per_minute <= 10:
        rating = "Acceptable"
    else:
        rating = "Risk"
    wpm = word_count / duration_minutes if duration_seconds else word_count
    speed_rating = "Good" if 100 <= wpm <= 170 else ("Too Slow" if wpm < 100 else "Too Fast")
    return to_python_type({
        "fillerWords": {
            "count": filler_count,
            "perMinute": per_minute,
            "rating": rating,
            "examples": list(set(filler_words))
        },
        "speakingSpeed": {
            "wordsPerMinute": wpm,
            "rating": speed_rating,
            "segments": []
        }
    }) 