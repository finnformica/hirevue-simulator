import { NextResponse } from "next/server";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (!HF_API_KEY) {
      return NextResponse.json(
        { error: "Hugging Face API key not configured" },
        { status: 500 }
      );
    }

    // Convert File to ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "audio/webm",
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to transcribe audio");
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text,
      confidence: result.confidence || 0.95,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transcribe audio",
      },
      { status: 500 }
    );
  }
}
