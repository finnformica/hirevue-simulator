def feedback_grammar(grammar):
    if not grammar:
        return {"strengths": [], "areasForImprovement": [], "specificRecommendations": [], "practiceExercises": []}
    
    if grammar.get("rating") == "Excellent":
        strengths = ["Strong grammatical accuracy."]
        exercises = []
        areas = []
    else:
        strengths = []
        areas = ["Improve grammatical accuracy."]
        exercises =  ["Review and correct the grammatical errors in your response."]


    return {
        "strengths": strengths,
        "areasForImprovement": areas,
        "specificRecommendations": [],
        "practiceExercises": exercises
    }

def feedback_keywords(keywords):
    if not keywords:
        return {"strengths": [], "areasForImprovement": [], "specificRecommendations": [], "practiceExercises": []}
    
    coverage = keywords.get("coverage", 0)
    if coverage >= 80:
        strengths = ["Strong keyword coverage."]
        areas = []
    elif coverage >= 50:
        strengths = []
        areas = ["Moderate keyword coverage."]
    else:
        strengths = []
        areas = ["Low keyword coverage."]
    missed = ", ".join(keywords.get("missed", [])[:3])
    recs = [
        f"You covered {coverage:.0f}% of required keywords. Consider incorporating: {missed}" if coverage >= 50 else f"You only covered {coverage:.0f}% of required keywords. Key terms to include: {missed}"
    ] if coverage < 80 else []
    return {
        "strengths": strengths,
        "areasForImprovement": areas,
        "specificRecommendations": recs,
        "practiceExercises": []
    }

def feedback_sentence_complexity(complexity):
    if not complexity:
        return {"strengths": [], "areasForImprovement": [], "specificRecommendations": [], "practiceExercises": []}
    if complexity.get("rating") == "Balanced":
        strengths = ["Good balance of sentence complexity."]
        areas = []
    else:
        strengths = []
        areas = ["Adjust sentence complexity."]
    recs = [
        f"Your response is {complexity.get('rating', '').lower()}. Try to maintain a balance between simple and complex sentences."
    ] if complexity.get("rating") != "Balanced" else []
    exercises = ["Practice restructuring your sentences to achieve a better balance of complexity."] if complexity.get("rating") != "Balanced" else []
    return {
        "strengths": strengths,
        "areasForImprovement": areas,
        "specificRecommendations": recs,
        "practiceExercises": exercises
    }

def feedback_fluency(fluency):
    if not fluency:
        return {"strengths": [], "areasForImprovement": [], "specificRecommendations": [], "practiceExercises": []}
    filler = fluency.get("fillerWords", {})
    speed = fluency.get("speakingSpeed", {})
    strengths = []
    areas = []
    recs = []
    exercises = []
    if filler.get("rating") == "Ideal":
        strengths.append("Excellent control of filler words.")
    elif filler.get("rating") == "Acceptable":
        strengths.append("Good control of filler words, but could be improved.")
        areas.append("Reduce filler words for even better fluency.")
    else:
        areas.append("High use of filler words.")
        recs.append(f"Try to reduce filler words (currently {filler.get('count', 0)} in your response).")
        exercises.append("Practice speaking without filler words for 1 minute.")
    if speed.get("rating") == "Good":
        strengths.append("Good speaking pace.")
    else:
        areas.append("Adjust speaking speed.")
        recs.append(f"Your speaking speed is {speed.get('wordsPerMinute', 0):.0f} WPM. Aim for 120-150 WPM for optimal clarity.")
    return {
        "strengths": strengths,
        "areasForImprovement": areas,
        "specificRecommendations": recs,
        "practiceExercises": exercises
    }

def feedback_repetition(repetition):
    if not repetition:
        return {"strengths": [], "areasForImprovement": [], "specificRecommendations": [], "practiceExercises": []}
    if repetition.get("rating") == "Good":
        strengths = ["Good vocabulary variety."]
        areas = []
    else:
        strengths = []
        areas = ["Reduce word repetition."]
    repeated_words = repetition.get("wordFrequency", [])[:3]
    repeated_str = ", ".join(f"{w['word']} ({w['count']} times)" for w in repeated_words)
    recs = [
        f"Most repeated words: {repeated_str}. Consider using synonyms or alternative phrasing."
    ] if repetition.get("rating") != "Good" else []
    exercises = ["Practice expressing the same ideas using different words and phrases."] if repetition.get("rating") != "Good" else []
    return {
        "strengths": strengths,
        "areasForImprovement": areas,
        "specificRecommendations": recs,
        "practiceExercises": exercises
    }

def generate_feedback(results):
    return {
        "grammar": feedback_grammar(results.get("grammar")),
        "keywords": feedback_keywords(results.get("keywords")),
        "sentenceComplexity": feedback_sentence_complexity(results.get("sentenceComplexity")),
        "fluency": feedback_fluency(results.get("fluency")),
        "repetition": feedback_repetition(results.get("repetition")),
    } 