import { NextResponse } from "next/server";
import { insertRecords } from "@/lib/supabase/server";
import { AnalysisSchemaInsert } from "@/lib/types/schemas";
import { aiCoachPrompt, aiStucturedSummaryPrompt } from "@/utils/prompts";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const BASE_URL = "https://router.huggingface.co/v1/chat/completions";

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
        {
          error: "Hugging Face API key is not configured",
        },
        { status: 500 }
      );
    }

    const analysisResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "user",
            content: aiCoachPrompt(transcription, prompt),
          },
        ],
      }),
    });

    const aiAnalysisJSON = await analysisResponse.json();

    const aiAnalysis = aiAnalysisJSON.choices[0].message.content;

    if (!aiAnalysis) {
      console.error("No AI analysis content in response");
      return NextResponse.json(
        {
          error: "Failed to generate AI analysis - no content in response",
        },
        { status: 500 }
      );
    }

    const summaryResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "Return only a JSON object, No explanations, no markdown, no additional text.",
          },
          {
            role: "user",
            content: aiStucturedSummaryPrompt(aiAnalysis),
          },
        ],
      }),
    });

    const summaryJSON = await summaryResponse.json();

    const summary = summaryJSON.choices[0].message.content;

    const summaryObject = JSON.parse(summary);

    if (!summaryObject) {
      console.error("Summary object not generated");
      return NextResponse.json(
        {
          error: "Failed to generate structured summary",
        },
        { status: 500 }
      );
    }

    const records: AnalysisSchemaInsert[] = [
      {
        interview_id: interviewId,
        grammar: summaryObject?.Grammar,
        sentence_complexity: summaryObject?.["Sentence Complexity"],
        keywords: summaryObject?.Keywords,
        filler_words_used: summaryObject?.["Filler Words Used"],
        repetition: summaryObject?.Repetition,
        clarity: summaryObject?.Clarity,
        confidence: summaryObject?.Confidence,
        structure: summaryObject?.Structure,
        vocabulary: summaryObject?.Vocabulary,
        overall_score: summaryObject?.Overall,
        grade: (() => {
          const overall = summaryObject?.Overall;
          if (overall >= 8) return "Excellent";
          if (overall >= 6) return "Good";
          if (overall >= 4) return "Average";
          if (overall >= 2) return "Poor";
          return "Failed";
        })(),
        ai_coach_summary: aiAnalysis ?? "",
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

    const combinedResponse = {
      grammar: summaryObject?.Grammar,
      sentenceComplexity: summaryObject?.["Sentence Complexity"],
      keywords: summaryObject?.Keywords,
      fillerWordsUsed: summaryObject?.["Filler Words Used"],
      repetition: summaryObject?.Repetition,
      clarity: summaryObject?.Clarity,
      confidence: summaryObject?.Confidence,
      structure: summaryObject?.Structure,
      vocabulary: summaryObject?.Vocabulary,
      overallScore: summaryObject?.Overall,
      aiAnalysis: aiAnalysis,
    };

    return NextResponse.json(combinedResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Analysis Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
