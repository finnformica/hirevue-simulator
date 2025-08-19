import { insertRecords } from "@/lib/supabase/server";
import { StructuredAnalysis } from "@/lib/types/analysis";
import { AnalysisGrade, AnalysisSchemaInsert } from "@/lib/types/schemas";
import { structuredAnalysisPrompt } from "@/utils/prompts";
import { NextResponse } from "next/server";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const HUGGING_FACE_BASE_URL = "https://router.huggingface.co/v1/chat/completions";

// Function to sanitize AI response and extract JSON
function sanitizeAIResponse(content: string): string {
  if (!content) return '';
  
  let sanitized = content;
  
  // Remove markdown code blocks with language specification
  sanitized = sanitized.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  
  // Remove markdown code blocks without language specification
  sanitized = sanitized.replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace
  sanitized = sanitized.trim();
  
  // If the content still starts with a backtick, try to remove it
  if (sanitized.startsWith('`')) {
    sanitized = sanitized.replace(/^`+/, '').replace(/`+$/, '');
  }
  
  // Remove any leading/trailing whitespace again
  sanitized = sanitized.trim();
  
  return sanitized;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      interviewId,
      transcription,
      duration_seconds,
      prompt,
      questionType,
      roleLevel,
      industry,
      interviewStage,
      keyCompetencies,
      relevantKeywords,
      expectedLength,
    } = body;


    if (
      !interviewId ||
      !transcription ||
      !duration_seconds ||
      !prompt ||
      !expectedLength
    ) {
      return NextResponse.json(
        { error: "Incorrect payload provided" },
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
              "You are an expert interview coach. Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. The response must be parseable JSON.",
          },
          {
            role: "user",
            content: structuredAnalysisPrompt(
              transcription,
              prompt,
              questionType,
              roleLevel,
              industry,
              interviewStage,
              keyCompetencies,
              relevantKeywords,
              duration_seconds,
              expectedLength
            ),
          },
        ],
      }),
    });


    if (!analysisResponse.ok) {
      const error = await analysisResponse.json();
      throw new Error(error?.message ?? "Failed to generate analysis");
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
      // Sanitize the response to remove markdown formatting
      const sanitizedContent = sanitizeAIResponse(structuredAnalysisContent);
      
      structuredAnalysis = JSON.parse(sanitizedContent);
    } catch (parseError) {
      console.error("Failed to parse structured analysis:", parseError);
      console.error("Original content:", structuredAnalysisContent);
      return NextResponse.json(
        { error: "Failed to parse structured analysis response" },
        { status: 500 }
      );
    }

    // Validate the structure
    if (
      !structuredAnalysis.overallScore ||
      !structuredAnalysis.metrics ||
      !structuredAnalysis.detailedFeedback
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
        feedback: structuredAnalysis.detailedFeedback,
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
