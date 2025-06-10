import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;

export async function POST(request: Request) {
  try {
    if (!FASTAPI_URL) {
      return NextResponse.json(
        { error: "FASTAPI_URL not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { transcription, required_keywords, duration_seconds } = body;

    if (!transcription || !required_keywords || !duration_seconds) {
      return NextResponse.json(
        {
          error:
            "Incorrect payload provided, expected: transcription, required_keywords, duration_seconds",
        },
        { status: 400 }
      );
    }

    // Call FastAPI /analyse endpoint
    const response = await fetch(`${FASTAPI_URL}/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcription,
        required_keywords: required_keywords,
        duration_seconds: duration_seconds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to analyse transcription");
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze transcription",
      },
      { status: 500 }
    );
  }
}
