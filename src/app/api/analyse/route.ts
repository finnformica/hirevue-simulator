import { insertRecords } from "@/lib/supabase/server";
import { StructuredAnalysis } from "@/lib/types/analysis";
import { AnalysisGrade, AnalysisSchemaInsert } from "@/lib/types/schemas";
import { structuredAnalysisPrompt } from "@/utils/prompts";
import { NextResponse } from "next/server";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const HUGGING_FACE_BASE_URL = "https://router.huggingface.co/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      interviewId,
      transcription,
      required_keywords,
      duration_seconds,
      prompt,
    } = body;

    if (
      !interviewId ||
      !transcription ||
      !required_keywords ||
      !duration_seconds ||
      !prompt
    ) {
      return NextResponse.json(
        {
          error:
            "Incorrect payload provided, expected: interviewId, transcription, required_keywords, duration_seconds, prompt",
        },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY is not set");
      return NextResponse.json(
        { error: "Hugging Face API key is not configured" },
        { status: 500 }
      );
    }

    // Generate structured analysis
    const analysisResponse = await fetch(HUGGING_FACE_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct:cerebras",
        messages: [
          {
            role: "system",
            content:
              "You are an expert interview coach. Return only valid JSON, no explanations or additional text.",
          },
          {
            role: "user",
            content: structuredAnalysisPrompt(transcription, prompt),
          },
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json();
      throw new Error(error?.error ?? error?.message ?? "Failed to generate analysis");
    }

    const analysisJSON = await analysisResponse.json();
    const structuredAnalysisContent = analysisJSON.choices[0].message.content;

    if (!structuredAnalysisContent) {
      console.error("No structured analysis content in response");
      return NextResponse.json(
        {
          error:
            "Failed to generate structured analysis - no content in response",
        },
        { status: 500 }
      );
    }

    // Parse the structured analysis
    let structuredAnalysis: StructuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(structuredAnalysisContent);
    } catch (parseError) {
      console.error("Failed to parse structured analysis:", parseError);
      return NextResponse.json(
        { error: "Failed to parse structured analysis response" },
        { status: 500 }
      );
    }

    // Validate the structure
    if (
      !structuredAnalysis.overallScore ||
      !structuredAnalysis.metrics ||
      !structuredAnalysis.feedback
    ) {
      return NextResponse.json(
        { error: "Invalid structured analysis format" },
        { status: 500 }
      );
    }

    // Save to database with the new structure
    const records: AnalysisSchemaInsert[] = [
      {
        interview_id: interviewId,
        grade: structuredAnalysis.grade as AnalysisGrade,
        overall_score: structuredAnalysis.overallScore,
        summary: structuredAnalysis.overallStatement,
        metrics: structuredAnalysis.metrics,
        feedback: structuredAnalysis.feedback,
      },
    ];

    const { error: insertError } = await insertRecords({
      table: "analysis",
      records,
    });

    if (insertError) {
      return NextResponse.json(
        {
          error:
            "Failed to save analysis: " + (insertError as any)?.message ||
            "Unknown error",
        },
        { status: 500 }
      );
    }

    // Return the structured analysis
    return NextResponse.json({
      structuredAnalysis,
      rawAnalysis: structuredAnalysisContent,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: `Analysis Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
