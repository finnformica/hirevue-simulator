// import { NextResponse } from "next/server";
// import { insertRecords } from "@/lib/supabase/server";
// import { AnalysisSchemaInsert } from "@/lib/types/schemas";

// const FASTAPI_URL = process.env.FASTAPI_URL;

// export async function POST(request: Request) {
//   try {
//     if (!FASTAPI_URL) {
//       return NextResponse.json(
//         { error: "FASTAPI_URL not configured" },
//         { status: 500 }
//       );
//     }

//     const body = await request.json();
//     const {
//       interviewId,
//       transcription,
//       required_keywords,
//       duration_seconds,
//       prompt,
//     } = body;

//     if (
//       !interviewId ||
//       !transcription ||
//       !required_keywords ||
//       !duration_seconds ||
//       !prompt
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "Incorrect payload provided, expected: interviewId, transcription, required_keywords, duration_seconds, prompt",
//         },
//         { status: 400 }
//       );
//     }

//     // Call FastAPI /analyse endpoint
//     const response = await fetch(`${FASTAPI_URL}/analyse`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         transcription,
//         required_keywords: required_keywords,
//         duration_seconds: duration_seconds,
//         prompt: prompt,
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || "Failed to analyse transcription");
//     }

//     const result = await response.json();

//     const records: AnalysisSchemaInsert[] = [
//       {
//         interview_id: interviewId,
//         grammar: result?.grammar ?? {},
//         sentence_complexity: result?.sentenceComplexity ?? {},
//         keywords: result?.keywords ?? {},
//         fluency: result?.fluency ?? {},
//         repetition: result?.repetition ?? {},
//         feedback: result?.feedback ?? {},
//         ai_coach_summary: result?.aiAnalysis ?? "",
//       },
//     ];

//     const { error: insertError } = await insertRecords({
//       table: "analysis",
//       records,
//     });

//     if (insertError) {
//       return NextResponse.json(
//         {
//           error:
//             "Failed to save analysis: " + (insertError as any)?.message ||
//             "Unknown error",
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Analysis error:", error);
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to analyze transcription",
//       },
//       { status: 500 }
//     );
//   }
// }
