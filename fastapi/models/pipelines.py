from transformers import pipeline

grammar_pipe = pipeline("text2text-generation", model="vennify/t5-base-grammar-correction")
embed_pipe = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")
asr_pipe = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3")
zero_shot_pipe = pipeline("zero-shot-classification", model="facebook/bart-large-mnli") 