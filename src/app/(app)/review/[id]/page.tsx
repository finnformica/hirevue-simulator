"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AnalysisTab } from "@/components/analysis-tab";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetReview, setReviewData } from "@/lib/store/slices/simulatorSlice";
import { useInterview } from "@/utils/api/prompts";
import { paths } from "@/utils/paths";
import { useParams } from "next/navigation";

type Params = {
  id: string;
};

export default function ReviewPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { reviewData } = useAppSelector((state) => state.simulator);
  const params = useParams<Params>();
  const interviewId = params.id;

  // Use the reusable hook to fetch interview data
  const { data, isLoading, error } = useInterview(interviewId);

  // Update Redux state when data is available and not loading
  useEffect(() => {
    if (!isLoading && data && !reviewData) {
      // Transform the new analysis structure to match the expected format
      const transformedAnalysis = data.analysis
        ? {
            structuredAnalysis: {
              overallScore: data.analysis.overall_score,
              overallStatement: data.analysis.summary,
              grade: data.analysis.grade,
              metrics: data.analysis.metrics,
              detailedFeedback: data.analysis.feedback || {
                topStrengths: [],
                criticalImprovements: [],
                quickWins: [],
                roleSpecificAdvice: "No specific advice available.",
                nextInterviewPrep: "No preparation advice available.",
              },
              readinessAssessment: "Assessment not available.",
              lengthAssessment: "Length assessment not available.",
            },
            rawAnalysis: data.analysis.summary, // Use summary as raw analysis for fallback
          }
        : null;

      dispatch(
        setReviewData({
          interview: data.interview,
          analysis: transformedAnalysis,
          transcription: data.transcription,
          prompt: data.prompt,
        })
      );
    }
  }, [data, isLoading, reviewData, dispatch]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      dispatch(resetReview());
    },
    [dispatch]
  );

  if (error) {
    router.push(paths.error[404]);
  }

  if (isLoading || !reviewData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-400">Loading interview data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Review</h1>
        <p className="text-gray-400">
          {new Date(reviewData.interview.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Question Card */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Question</h2>
          <p className="text-gray-300 leading-relaxed">
            {reviewData.prompt.question}
          </p>
        </CardContent>
      </Card>

      {/* Analysis Component */}
      <AnalysisTab />
    </div>
  );
}
