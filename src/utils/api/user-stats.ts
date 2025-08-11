import { createClientForServer } from "@/utils/supabase/server";
import _ from "lodash";

export interface UserStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  totalHours: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  score: string | null;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClientForServer();

  // Use raw SQL for efficient aggregations
  const { data } = await supabase.rpc('get_user_stats', { user_id: userId });

  return {
    totalInterviews: data?.[0]?.total_interviews ?? 0,
    averageScore: data?.[0]?.avg_score ?? 0,
    bestScore: data?.[0]?.best_score ?? 0,
    totalHours: data?.[0]?.total_hours ?? 0,
  };
}

export async function getRecentActivity(userId: string): Promise<RecentActivity[]> {
  const supabase = await createClientForServer();

  const { data: interviews, error } = await supabase
    .from("interviews")
    .select(`
      id,
      created_at,
      status,
      analysis:analysis(
        overall_score
      ),
      prompt:prompts(
        question,
        category
      )
    `)
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }

  return interviews.map((interview) => {
    const score = interview.analysis?.[0]?.overall_score;
    const promptData = interview.prompt as any;
    const question = promptData?.question || "Unknown Question";
    
    // Format date
    const date = new Date(interview.created_at);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    let dateString: string;
    if (diffInHours < 1) {
      dateString = "Just now";
    } else if (diffInHours < 24) {
      dateString = `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 48) {
      dateString = "Yesterday";
    } else {
      dateString = date.toLocaleDateString();
    }

    return {
      id: interview.id,
      type: _.startCase(promptData?.category),
      title: question,
      date: dateString,
      score: score ? `${score}/10` : null,
    };
  });
}
