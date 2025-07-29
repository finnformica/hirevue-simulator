from models.pipelines import asr_pipe
import soundfile as sf

def transcribe_audio(audio_path: str):
    audio, sr = sf.read(audio_path)
    return asr_pipe({"array": audio, "sampling_rate": sr})["text"]