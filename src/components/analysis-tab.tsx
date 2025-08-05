import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function RatingBadge({ rating }: { rating: string }) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
      case "Ideal":
      case "Good":
      case "Balanced":
        return "text-green-500";
      case "Acceptable":
      case "Moderate":
        return "text-yellow-500";
      case "Needs Improvement":
      case "Risk":
      case "High":
      case "Too Simple":
      case "Too Complex":
      case "Too Slow":
      case "Too Fast":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <span className={cn("text-sm font-medium", getRatingColor(rating))}>
      {rating}
    </span>
  );
}

function MetricCard({
  title,
  value,
  rating,
  description,
  trend,
}: {
  title: string;
  value: number | string;
  rating: string;
  description: string;
  trend?: "up" | "down" | "neutral";
}) {
  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex-1 bg-muted/50 rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <RatingBadge rating={rating} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <span className={cn("text-sm", getTrendColor(trend))}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

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
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "improvement":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "recommendation":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "exercise":
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            {getIcon(type)}
            <span>{item}</span>
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
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>
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
  if (!feedback) return null;
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base capitalize">
          {metric.replace(/([A-Z])/g, " $1")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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
            title="Recommendations"
            items={feedback.specificRecommendations}
            type="recommendation"
          />
          <FeedbackSection
            title="Practice Exercises"
            items={feedback.practiceExercises}
            type="exercise"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalysisTab() {
  const dispatch = useAppDispatch();
  const { analysis, isAnalysing, error, transcription, reviewData } =
    useAppSelector((state) => state.simulator);

  // Use review data if available, otherwise use simulator data
  const currentAnalysis = reviewData?.analysis || analysis;
  const currentTranscription =
    reviewData?.transcription?.text_content || transcription;
  const isReviewMode = !!reviewData;

  if (isAnalysing && !isReviewMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg">Analysing your response...</p>
      </div>
    );
  }

  if (!currentAnalysis) {
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

  // Render OpenAI feedback if available
  const renderAnalysis = (
    <Card>
      <CardHeader>
        <CardTitle>AI Interview Coach Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {currentAnalysis.aiAnalysis ? (
          <Markdown>{currentAnalysis.aiAnalysis}</Markdown>
        ) : (
          <p>AI analysis is not available</p>
        )}
      </CardContent>
    </Card>
  );

  // Render grouped feedback for each metric
  const feedback: Record<string, any> = currentAnalysis.feedback || {};
  const feedbackMetrics = [
    "grammar",
    "keywords",
    "sentenceComplexity",
    "fluency",
    "repetition",
  ];

  return (
    <div className="mx-auto space-y-4">
      {/*  Feedback */}
      {renderAnalysis}
      {/* Overall Performance Summary */}



      {/* Action Buttons */}
      {!isReviewMode && (
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => dispatch(setCurrentTab("recording"))}
            className="flex items-center gap-2"
          >
            Record Again
          </Button>
          <Button
            onClick={() => dispatch(setCurrentTab("prompt"))}
            variant="outline"
            className="flex items-center gap-2"
          >
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
}
