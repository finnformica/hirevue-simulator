import { NextResponse } from "next/server";
import { insertRecords } from "@/lib/supabase/server";
import { TranscriptionSchemaInsert } from "@/lib/types/schemas";


export async function POST(request: Request) {
  try {
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

    const prompt = `
        You are an expert interview coach. Analyze this interview response and provide constructive feedback.

        Transcription:
        "${transcription}"

        Please provide feedback in the following format:

        **Overall Performance:** [Rate 1-10 and brief summary]

        **Strengths:**
        - [List 2-3 specific strengths]

        **Areas for Improvement:**
        - [List 2-3 specific areas to work on]

        **Specific Suggestions:**
        - [Provide 3-4 actionable tips]

        **Communication Quality:**
        - Clarity: [Score/10]
        - Confidence: [Score/10]
        - Structure: [Score/10]

        **Key Advice:**
        [One paragraph of the most important advice for this candidate]

        Keep feedback constructive, specific, and actionable. Focus on both content and delivery.
      `;

              const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        return NextResponse.json({ analysis }, { status: 200 });

  } catch (error) {

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to analyze interview" },
            { status: 500 }
        );

  }

}