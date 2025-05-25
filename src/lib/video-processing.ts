import { createClient } from "@supabase/supabase-js";
import { Analysis, Interview, ProcessingStatus, Transcription } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadVideo(
  file: File,
  userId: string,
  promptId: string,
  onProgress?: (status: ProcessingStatus) => void
): Promise<Interview> {
  try {
    // Update status
    onProgress?.({ status: "uploading", progress: 0 });

    // Upload to Supabase Storage
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("interview-videos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create interview record
    const { data: interview, error: dbError } = await supabase
      .from("interviews")
      .insert({
        userId,
        promptId,
        videoUrl: uploadData.path,
        duration: 0, // Will be updated after processing
        status: "processing",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    onProgress?.({ status: "uploading", progress: 100 });
    return interview as Interview;
  } catch (error) {
    onProgress?.({ status: "failed", error: (error as Error).message });
    throw error;
  }
}

export async function processAudio(
  interviewId: string,
  audioBlob: Blob,
  onProgress?: (status: ProcessingStatus) => void
): Promise<Transcription> {
  try {
    onProgress?.({ status: "transcribing", progress: 0 });

    // Convert audio to base64
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    // Call Whisper API (you'll need to implement this endpoint)
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: audioBase64 }),
    });

    if (!response.ok) throw new Error("Transcription failed");

    const transcription = await response.json();

    // Store transcription in Supabase
    const { data, error } = await supabase
      .from("transcriptions")
      .insert({
        interviewId,
        textContent: transcription.text,
        confidenceScore: transcription.confidence,
      })
      .select()
      .single();

    if (error) throw error;

    onProgress?.({ status: "transcribing", progress: 100 });
    return data as Transcription;
  } catch (error) {
    onProgress?.({ status: "failed", error: (error as Error).message });
    throw error;
  }
}

export async function analyzeInterview(
  interviewId: string,
  transcription: string,
  onProgress?: (status: ProcessingStatus) => void
): Promise<Analysis> {
  try {
    onProgress?.({ status: "analyzing", progress: 0 });

    // Call GPT API for analysis (you'll need to implement this endpoint)
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcription }),
    });

    if (!response.ok) throw new Error("Analysis failed");

    const analysis = await response.json();

    // Store analysis in Supabase
    const { data, error } = await supabase
      .from("analysis")
      .insert({
        interviewId,
        ...analysis,
      })
      .select()
      .single();

    if (error) throw error;

    // Update interview status to completed
    await supabase
      .from("interviews")
      .update({ status: "completed" })
      .eq("id", interviewId);

    onProgress?.({ status: "completed" });
    return data as Analysis;
  } catch (error) {
    onProgress?.({ status: "failed", error: (error as Error).message });
    throw error;
  }
}
