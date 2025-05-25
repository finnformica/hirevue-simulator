import { createClient } from "@supabase/supabase-js";
import { AnalysisResult } from "./types/analysis";
import { Interview, ProcessingStatus } from "./types/interview";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function startInterview(
  userId: string,
  prompt: string
): Promise<Interview> {
  const { data, error } = await supabase
    .from("interviews")
    .insert({
      user_id: userId,
      prompt,
      status: { status: "pending", progress: 0 },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInterviewStatus(
  interviewId: string,
  status: ProcessingStatus
): Promise<void> {
  const { error } = await supabase
    .from("interviews")
    .update({ status })
    .eq("id", interviewId);

  if (error) throw error;
}

export async function processVideo(
  interviewId: string,
  videoBlob: Blob
): Promise<void> {
  try {
    // Update status to processing
    await updateInterviewStatus(interviewId, {
      status: "processing",
      progress: 0,
    });

    // Upload video to storage
    const videoPath = `interviews/${interviewId}/video.webm`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(videoPath, videoBlob);

    if (uploadError) throw uploadError;

    // Update progress
    await updateInterviewStatus(interviewId, {
      status: "processing",
      progress: 0.3,
    });

    // Extract audio
    const audioBlob = await extractAudio(videoBlob);
    const audioPath = `interviews/${interviewId}/audio.webm`;
    const { error: audioError } = await supabase.storage
      .from("audio")
      .upload(audioPath, audioBlob);

    if (audioError) throw audioError;

    // Update progress
    await updateInterviewStatus(interviewId, {
      status: "processing",
      progress: 0.6,
    });

    // Transcribe audio
    const transcription = await transcribeAudio(audioBlob);

    // Store transcription
    const { error: transcriptionError } = await supabase
      .from("transcriptions")
      .insert({
        interview_id: interviewId,
        text: transcription.text,
        confidence: transcription.confidence,
      });

    if (transcriptionError) throw transcriptionError;

    // Update progress
    await updateInterviewStatus(interviewId, {
      status: "processing",
      progress: 0.9,
    });

    // Analyse response
    const analysis = await analyseResponse(
      transcription.text,
      "Your interview prompt here", // Replace with actual prompt
      interviewId
    );

    // Update status to completed
    await updateInterviewStatus(interviewId, {
      status: "completed",
      progress: 1,
    });
  } catch (error) {
    // Update status to failed
    await updateInterviewStatus(interviewId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

async function extractAudio(videoBlob: Blob): Promise<Blob> {
  // Implement audio extraction logic
  return new Blob();
}

async function transcribeAudio(
  audioBlob: Blob
): Promise<{ text: string; confidence: number }> {
  // Implement transcription logic
  return { text: "", confidence: 0 };
}

async function analyseResponse(
  transcription: string,
  prompt: string,
  interviewId: string
): Promise<AnalysisResult> {
  try {
    // Call GPT API for analysis (you'll need to implement this endpoint)
    const response = await fetch("/api/analyse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcription,
        prompt,
      }),
    });

    if (!response.ok) throw new Error("Analysis failed");

    const analysis = await response.json();

    // Store analysis in Supabase
    const { data, error } = await supabase
      .from("analysis")
      .insert({
        interview_id: interviewId,
        ...analysis,
        type: "analysis",
      })
      .select()
      .single();

    if (error) throw error;

    return data as AnalysisResult;
  } catch (error) {
    console.error("Error analysing response:", error);
    throw error;
  }
}
