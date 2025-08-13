import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetSimulatorState,
  setCurrentTab,
} from "@/lib/store/slices/simulatorSlice";
import { MetricDetail, StructuredAnalysis } from "@/lib/types/analysis";
import { cn } from "@/lib/utils";
import { useGetUser } from "@/utils/api/user";
import { paths } from "@/utils/paths";

import { Button } from "./ui/button";

// Extracted action buttons component that can be used in all states
function AnalysisActionButtons({
  isReviewMode = false,
  promptId,
}: {
  isReviewMode?: boolean;
  promptId?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleTryAgain = () => {
    dispatch(resetSimulatorState());

    if (isReviewMode && promptId) {
      router.push(paths.simulator(promptId));
    } else {
      dispatch(setCurrentTab("recording"));
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(paths.questions)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTryAgain}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

function MetricBentoCard({
  metric,
  detail,
}: {
  metric: string;
  detail: MetricDetail;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-brand";
    if (score >= 6) return "text-yellow-500";
    if (score >= 4) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    if (score >= 2) return "Poor";
    return "Failed";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium capitalize">
          {metric.replace(/([A-Z])/g, " $1").trim()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={cn("text-2xl font-bold", getScoreColor(detail.score))}
          >
            {detail.score}/10
          </span>
          <span
            className={cn("text-xs font-medium", getScoreColor(detail.score))}
          >
            {getScoreLabel(detail.score)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {detail.feedback}
        </p>
      </CardContent>
    </Card>
  );
}

function ContextDrawer({
  isOpen,
  onClose,
  prompt,
  response,
}: {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  response: string;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen w-80 md:w-96 lg:w-[420px] bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Context</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Original Question */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Original Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prompt}
                </p>
              </CardContent>
            </Card>

            {/* Your Response */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  Your Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {response.split(". ").map((sentence, index) => (
                    <p key={index} className="mb-2">
                      {sentence.trim()}.
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function StructuredAnalysisDisplay({
  analysis,
  prompt,
  response,
  isReviewMode = false,
}: {
  analysis: StructuredAnalysis;
  prompt: { id: string; question: string };
  response: string;
  isReviewMode?: boolean;
}) {
  const { isProUser } = useGetUser();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const metricEntries = Object.entries(analysis.metrics);

  return (
    <>
      <div className="space-y-6 pt-3">
        {/* Actions Section */}
        <div className="flex items-center justify-between mb-6">
          <AnalysisActionButtons
            isReviewMode={isReviewMode}
            promptId={prompt.id}
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsContextOpen(!isContextOpen)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isContextOpen ? "Hide Context" : "Show Context"}
          </Button>
        </div>

        {/* Overall Summary */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Performance</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {analysis.overallScore}/10
                </span>
                <span
                  className={cn(
                    "text-sm font-medium px-2 py-1 rounded-full",
                    analysis.overallScore >= 8
                      ? "bg-brand/10 text-brand"
                      : analysis.overallScore >= 6
                        ? "bg-yellow-100 text-yellow-700"
                        : analysis.overallScore >= 4
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                  )}
                >
                  {analysis.grade}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.overallStatement}
            </p>
          </CardContent>
        </Card>

        {/* Metrics Bento Grid */}
        {isProUser && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Communication Skills Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricEntries.map(([metric, detail]) => (
                <MetricBentoCard key={metric} metric={metric} detail={detail} />
              ))}
            </div>
          </div>
        )}

        {/* Feedback Sections */}
        {isProUser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside [&>li::marker]:text-brand">
                  {analysis.feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside [&>li::marker]:text-yellow-500">
                  {analysis.feedback.areasForImprovement.map((area, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Specific Suggestions */}
        {isProUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Specific Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 list-disc list-inside [&>li::marker]:text-blue-500">
                {analysis.feedback.specificSuggestions.map(
                  (suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {suggestion}
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key Advice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              Key Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.feedback.keyAdvice}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Context Drawer */}
      <ContextDrawer
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        prompt={prompt.question}
        response={response}
      />
    </>
  );
}

export function AnalysisTab() {
  const dispatch = useAppDispatch();
  const { analysis, isAnalysing, transcription, reviewData, prompt } =
    useAppSelector((state) => state.simulator);

  // Use review data if available, otherwise use simulator data
  const currentAnalysis = reviewData?.analysis || analysis;
  const currentTranscription =
    reviewData?.transcription?.text_content || transcription;
  const currentPrompt =
    reviewData?.prompt?.question || prompt?.question || "No prompt available";
  const isReviewMode = !!reviewData;

  if (isAnalysing && !isReviewMode) {
    return (
      <div className="space-y-6">
        <AnalysisActionButtons
          isReviewMode={isReviewMode}
          promptId={undefined}
        />
        <div className="flex items-center justify-center p-8">
          <p className="text-lg">Analysing your response...</p>
        </div>
      </div>
    );
  }

  if (!currentAnalysis?.structuredAnalysis) {
    return (
      <div className="space-y-6">
        <AnalysisActionButtons
          isReviewMode={isReviewMode}
          promptId={undefined}
        />
        <div className="text-center p-8">
          <p className="text-lg">No analysis available</p>
          {!isReviewMode && (
            <Button
              onClick={() => dispatch(setCurrentTab("recording"))}
              className="mt-4"
            >
              Record Response
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <StructuredAnalysisDisplay
      analysis={currentAnalysis.structuredAnalysis}
      prompt={{ id: reviewData?.prompt?.id, question: currentPrompt }}
      response={currentTranscription || "No response available"}
      isReviewMode={isReviewMode}
    />
  );
}
