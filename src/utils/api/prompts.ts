import {
  AnalysisGrade,
  InterviewAttempt,
  PromptSchema,
} from "@/lib/types/schemas";
import { supabaseClientForBrowser } from "@/utils/supabase/client";
import useSWR from "swr";

// Extended prompt schema with last attempt info
export interface PromptWithLastAttempt extends PromptSchema {
  lastAttempt: {
    grade: AnalysisGrade;
    date: string;
  } | null;
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
  // First, get the current user and their subscription status
  const {
    data: { user },
    error: userError,
  } = await supabaseClientForBrowser.auth.getUser();

  if (userError) {
    throw new Error(`Failed to get user: ${userError.message}`);
  }

  let isProUser = false;

  if (user) {
    // Get user's subscription status from profiles table
    const { data: userData, error: profileError } =
      await supabaseClientForBrowser
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.warn("Failed to fetch user profile:", profileError.message);
    } else {
      // Check if user has active subscription (Pro user)
      isProUser =
        userData?.subscription_status === "active" ||
        userData?.subscription_status === "trialing";
    }
  }

  // Build the query
  let query = supabaseClientForBrowser
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

  // If user is not Pro, restrict to basic category only
  if (!isProUser) {
    query = query.eq("category", "basic");
  }

  const { data: prompts, error: promptsError } = await query;

  if (promptsError) {
    throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
  }

  // Transform the data to match the PromptWithLastAttempt interface
  const promptsWithAttempts: PromptWithLastAttempt[] = prompts.map((prompt) => {
    // Get the most recent interview (last in the array due to ordering)
    const interviews = prompt.last_attempt || [];
    const lastInterview =
      interviews.length > 0 ? interviews[interviews.length - 1] : null;
    const grade = lastInterview?.analysis[0]?.grade;
    const date = new Date(lastInterview?.created_at).toLocaleDateString();

    return {
      id: prompt.id,
      created_at: prompt.created_at,
      question: prompt.question,
      duration: prompt.duration,
      difficulty: prompt.difficulty,
      category: prompt.category,
      lastAttempt: lastInterview ? { grade, date } : null,
    };
  });

  return promptsWithAttempts;
}

export async function fetchPromptById(
  promptId: string
): Promise<PromptSchema | null> {
  const { data: prompt, error } = await supabaseClientForBrowser
    .from("prompts")
    .select(
      `
      id,
      created_at,
      question,
      duration,
      difficulty,
      category
    `
    )
    .eq("id", promptId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch prompt: ${error.message}`);
  }

  return prompt;
}

// Custom hook for fetching a single prompt by ID
export function usePrompt(promptId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PromptSchema | null>(
    promptId ? `prompt-${promptId}` : null,
    async () => {
      if (!promptId) return null;
      return await fetchPromptById(promptId);
    }
  );

  return {
    prompt: data,
    isLoading,
    error,
    refresh: mutate,
  };
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

    return {
      id: interview.id,
      created_at: interview.created_at,
      date: new Date(interview.created_at).toLocaleDateString(),
      grade,
    };
  });

  return {
    attempts,
    totalCount: count || 0,
  };
}

export async function fetchInterviewById(interviewId: string): Promise<{
  interview: {
    id: string;
    created_at: string;
    storage_path: string;
    status: string;
  } | null;
  analysis: {
    grade: string;
    overall_score: number;
    summary: string;
    metrics: Record<string, any>;
    feedback: Record<string, any>;
  } | null;
  transcription: {
    text_content: string;
  } | null;
  prompt: {
    id: string;
    question: string;
    difficulty: string;
    category: string;
    duration: number;
  } | null;
}> {
  const { data: interview, error: interviewError } =
    await supabaseClientForBrowser
      .from("interviews")
      .select(
        `
      id,
      created_at,
      storage_path,
      status,
      analysis:analysis(
        grade,
        overall_score,
        summary,
        metrics,
        feedback
      ),
      transcription:transcriptions(
        text_content
      ),
      prompt:prompts(
        id,
        question,
        difficulty,
        category,
        duration
      )
    `
      )
      .eq("id", interviewId)
      .single();

  if (interviewError) {
    throw new Error(`Failed to fetch interview: ${interviewError.message}`);
  }

  // Handle the case where prompt might be an array or object
  const promptData = interview?.prompt ?? null;
  const prompt = Array.isArray(promptData) ? promptData[0] : promptData;

  const result = {
    interview: interview
      ? {
          id: interview.id,
          created_at: interview.created_at,
          storage_path: interview.storage_path,
          status: interview.status,
        }
      : null,
    analysis: interview?.analysis?.[0] ?? null,
    transcription: interview?.transcription?.[0] ?? null,
    prompt,
  };

  return result;
}

// Custom hook for fetching interview data by ID
export function useInterview(interviewId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    interviewId ? `interview-${interviewId}` : null,
    async () => {
      if (!interviewId) return null;
      return await fetchInterviewById(interviewId);
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
  };
}
