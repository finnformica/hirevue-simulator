import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";
import { MetricDetail, StructuredAnalysis } from "@/lib/types/analysis";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageSquare,
  Minus,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

function FeedbackSection({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "strength" | "improvement" | "recommendation" | "exercise";
}) {
  if (items.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "improvement":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "recommendation":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "exercise":
        return <Minus className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {getIcon(type)}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MetricFeedbackSection({
  metric,
  feedback,
}: {
  metric: string;
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    specificRecommendations: string[];
    practiceExercises: string[];
  };
}) {
  return (
    <div className="space-y-4">
      <FeedbackSection
        title="Strengths"
        items={feedback.strengths}
        type="strength"
      />
      <FeedbackSection
        title="Areas for Improvement"
        items={feedback.areasForImprovement}
        type="improvement"
      />
      <FeedbackSection
        title="Specific Recommendations"
        items={feedback.specificRecommendations}
        type="recommendation"
      />
      <FeedbackSection
        title="Practice Exercises"
        items={feedback.practiceExercises}
        type="exercise"
      />
    </div>
  );
}

// New structured analysis components
function MetricBentoCard({
  metric,
  detail,
}: {
  metric: string;
  detail: MetricDetail;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
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
                  <MessageSquare className="h-4 w-4 text-green-500" />
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
}: {
  analysis: StructuredAnalysis;
  prompt: string;
  response: string;
}) {
  const [isContextOpen, setIsContextOpen] = useState(false);
  const metricEntries = Object.entries(analysis.metrics);

  return (
    <>
      <div className="space-y-6">
        {/* Header with Context Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <Button
            variant="outline"
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
                      ? "bg-green-100 text-green-700"
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
        <Card>
          <CardHeader>
            <CardTitle>Communication Skills Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricEntries.map(([metric, detail]) => (
                <MetricBentoCard key={metric} metric={metric} detail={detail} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside [&>li::marker]:text-green-500">
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

        {/* Specific Suggestions */}
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
        prompt={prompt}
        response={response}
      />
    </>
  );
}

export function AnalysisTab() {
  const dispatch = useAppDispatch();
  const { analysis, isAnalysing, error, transcription, reviewData, prompt } =
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
      <div className="flex items-center justify-center p-8">
        <p className="text-lg">Analysing your response...</p>
      </div>
    );
  }

  if (!currentAnalysis?.structuredAnalysis) {
    return (
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
    );
  }

  return (
    <StructuredAnalysisDisplay
      analysis={currentAnalysis.structuredAnalysis}
      prompt={currentPrompt}
      response={currentTranscription || "No response available"}
    />
  );
}
