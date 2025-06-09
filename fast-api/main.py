from fastapi import FastAPI
from pydantic import BaseModel
from models.grammar import analyse_grammar
from models.keywords import analyse_keywords
from models.sentence_complexity import analyse_sentence_complexity
from models.fluency import analyse_fluency
from models.repetition import analyse_repetition
# from models.transcribe import transcribe_audio  # Uncomment if using audio

app = FastAPI()

class AnalyseRequest(BaseModel):
    transcription: str
    required_keywords: list[str] = []
    duration_seconds: float = None  # Optional, for fluency

@app.get('/')
def index():
    return "Hello world"

@app.post("/analyse")
async def analyse(req: AnalyseRequest):
    grammar = analyse_grammar(req.transcription)
    keywords = analyse_keywords(req.transcription, req.required_keywords)
    sentence_complexity = analyse_sentence_complexity(req.transcription)
    fluency = analyse_fluency(req.transcription, req.duration_seconds)
    repetition = analyse_repetition(req.transcription)
    
    return {
        "grammar": grammar,
        "keywords": keywords,
        "sentenceComplexity": sentence_complexity,
        "fluency": fluency,
        "repetition": repetition,
    }