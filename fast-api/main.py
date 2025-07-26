from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
import os
import time

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import pipelines to ensure they are initialized on app start
import models.pipelines

from models.grammar import analyse_grammar
from models.keywords import analyse_keywords
from models.sentence_complexity import analyse_sentence_complexity
from models.fluency import analyse_fluency
from models.repetition import analyse_repetition
from models.transcribe import transcribe_audio
from models.feedback import generate_feedback
from models.ai_coach import generate_ai_feedback

app = FastAPI()


class AnalyseRequest(BaseModel):
    transcription: str
    required_keywords: list[str] = []
    duration_seconds: float = None
    prompt: str = None


@app.get("/")
def index():
    return "Hello world"


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_path = f"temp_{audio.filename}"
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    transcription = transcribe_audio(audio_path)
    os.remove(audio_path)
    return {"transcription": transcription}


@app.post("/analyse")
async def analyse(req: AnalyseRequest):
    start_time = time.time()

    grammar = analyse_grammar(req.transcription)
    keywords = analyse_keywords(req.transcription, req.required_keywords)
    sentence_complexity = analyse_sentence_complexity(req.transcription)
    fluency = analyse_fluency(req.transcription, req.duration_seconds)
    repetition = analyse_repetition(req.transcription)
    ai_analysis = generate_ai_feedback(req.transcription, req.prompt)

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Analysis complete in {execution_time:.2f} seconds")

    results = {
        "grammar": grammar,
        "keywords": keywords,
        "sentenceComplexity": sentence_complexity,
        "fluency": fluency,
        "repetition": repetition,
        "aiAnalysis": ai_analysis,
    }

    feedback = generate_feedback(results)
    results["feedback"] = feedback

    return results
