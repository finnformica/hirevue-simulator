import { checkUserProAccess } from "@/lib/auth/pro-access";
import { createClientForServer } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has pro access using the SQL function
    const isProUser = await checkUserProAccess(user.id);

    // Build the query
    let query = supabase
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
      return NextResponse.json(
        { error: `Failed to fetch prompts: ${promptsError.message}` },
        { status: 500 }
      );
    }

    // Transform the data to match the PromptWithLastAttempt interface
    const promptsWithAttempts = prompts.map((prompt) => {
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

    return NextResponse.json(promptsWithAttempts);
  } catch (error) {
    console.error("Error in prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
