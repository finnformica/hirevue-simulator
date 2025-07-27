import { InterviewAttempt, PromptSchema } from "@/lib/types/schemas";
import { supabaseClientForBrowser } from "@/utils/supabase/client";
import useSWR from "swr";

// Extended prompt schema with last attempt info
export interface PromptWithLastAttempt extends PromptSchema {
  lastAttempt: {
    grade: string | null;
    date: string;
  };
}

// Custom hook for fetching prompts
export function usePrompts() {
  const { data, error, isLoading, mutate } = useSWR<PromptWithLastAttempt[]>(
    "prompts",
    async () => {
      return await fetchPrompts();
    }
  );

  return {
    prompts: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export async function fetchPrompts(): Promise<PromptWithLastAttempt[]> {
  // Get all prompts with their last attempt data in a single query
  const { data: prompts, error: promptsError } = await supabaseClientForBrowser
    .from("prompts")
    .select(
      `
      id,
      created_at,
      question,
      duration,
      difficulty,
      category,
      last_attempt:interviews(
        id,
        created_at,
        analysis:analysis(
          grade
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (promptsError) {
    throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
  }

  // Transform the data to match the PromptWithLastAttempt interface
  const promptsWithAttempts: PromptWithLastAttempt[] = prompts.map((prompt) => {
    // Get the most recent interview (first in the array due to ordering)
    const interviews = prompt.last_attempt || [];
    const lastInterview = interviews.length > 0 ? interviews[0] : null;
    const grade = lastInterview?.analysis?.[0]?.grade ?? null;

    return {
      id: prompt.id,
      created_at: prompt.created_at,
      question: prompt.question,
      duration: prompt.duration,
      difficulty: prompt.difficulty,
      category: prompt.category,
      lastAttempt: { grade, date: lastInterview?.created_at },
    };
  });

  return promptsWithAttempts;
}

export async function fetchInterviewAttempts(
  promptId: string,
  page: number = 1,
  limit: number = 5
): Promise<{ attempts: InterviewAttempt[]; totalCount: number }> {
  // For increasing page size approach, always fetch from beginning when page is 1
  const offset = page === 1 ? 0 : (page - 1) * limit;

  // First, get the total count
  const { count, error: countError } = await supabaseClientForBrowser
    .from("interviews")
    .select("*", { count: "exact", head: true })
    .eq("prompt_id", promptId);

  if (countError) {
    throw new Error(`Failed to fetch attempt count: ${countError.message}`);
  }

  // Then, get the attempts with analysis data using LEFT JOIN
  const { data, error } = await supabaseClientForBrowser
    .from("interviews")
    .select(
      `
      id,
      created_at,
      status,
      storage_path,
      analysis:analysis(
        grade
      )
    `
    )
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch interview attempts: ${error.message}`);
  }

  // Transform the data to match the InterviewAttempt interface
  const attempts: InterviewAttempt[] = data.map((interview) => {
    const analysis = interview.analysis?.[0]; // Get the first analysis record (should be only one)
    const grade = analysis?.grade || null;

    // Map grade to score and result
    let score = 0;
    let result = "Analysis not available";

    if (grade) {
      switch (grade) {
        case "Excellent":
          score = 90;
          result = "Excellent";
          break;
        case "Good":
          score = 80;
          result = "Good";
          break;
        case "Needs Improvement":
          score = 65;
          result = "Needs Improvement";
          break;
        case "Poor":
          score = 50;
          result = "Poor";
          break;
        default:
          score = 0;
          result = "Analysis not available";
      }
    }

    return {
      id: interview.id,
      created_at: interview.created_at,
      date: new Date(interview.created_at).toLocaleDateString(),
      score,
      duration: 0, // We don't have duration in the current schema
      result,
      grade,
    };
  });

  return {
    attempts,
    totalCount: count || 0,
  };
}
