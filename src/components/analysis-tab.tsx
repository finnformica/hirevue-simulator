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
      {/* <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Fluency"
              value={`${currentAnalysis.fluency.fillerWords.perMinute.toFixed(1)}/min`}
              rating={currentAnalysis.fluency.fillerWords.rating}
              description="Filler words per minute"
              trend={
                currentAnalysis.fluency.fillerWords.rating === "Ideal"
                  ? "up"
                  : "down"
              }
            />
            <MetricCard
              title="Speaking Speed"
              value={`${currentAnalysis.fluency.speakingSpeed.wordsPerMinute.toFixed(0)} WPM`}
              rating={currentAnalysis.fluency.speakingSpeed.rating}
              description="Words per minute"
              trend={
                currentAnalysis.fluency.speakingSpeed.rating === "Good"
                  ? "up"
                  : "down"
              }
            />
            <MetricCard
              title="Grammar"
              value={`${currentAnalysis.grammar.errorRate.toFixed(1)}%`}
              rating={currentAnalysis.grammar.rating}
              description="Error rate"
              trend={
                currentAnalysis.grammar.rating === "Excellent" ? "up" : "down"
              }
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Analysis Dashboard */}
        <div className="space-y-4">
          {/* <Tabs defaultValue="technical" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="technical">
              <AnalysisSection title="Technical Performance">
                <div className="space-y-4">
                  <MetricCard
                    title="Keyword Coverage"
                    value={`${currentAnalysis.keywords.coverage.toFixed(0)}%`}
                    rating={
                      currentAnalysis.keywords.coverage >= 80
                        ? "Good"
                        : currentAnalysis.keywords.coverage >= 50
                          ? "Moderate"
                          : "Needs Improvement"
                    }
                    description="Required keywords used"
                  />
                  <MetricCard
                    title="Grammar Accuracy"
                    value={`${(100 - currentAnalysis.grammar.errorRate).toFixed(1)}%`}
                    rating={currentAnalysis.grammar.rating}
                    description="Grammatical accuracy"
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Missed Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keywords.missed.map(
                        (keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </AnalysisSection>
            </TabsContent>

            <TabsContent value="delivery">
              <AnalysisSection title="Delivery Metrics">
                <div className="space-y-4">
                  <MetricCard
                    title="Filler Words"
                    value={currentAnalysis.fluency.fillerWords.count}
                    rating={currentAnalysis.fluency.fillerWords.rating}
                    description={`${currentAnalysis.fluency.fillerWords.perMinute.toFixed(1)} per minute`}
                  />
                  <MetricCard
                    title="Speaking Speed"
                    value={`${currentAnalysis.fluency.speakingSpeed.wordsPerMinute.toFixed(0)} WPM`}
                    rating={currentAnalysis.fluency.speakingSpeed.rating}
                    description="Words per minute"
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Common Filler Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.fluency.fillerWords.examples.map(
                        (word: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                          >
                            {word}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </AnalysisSection>
            </TabsContent>

            <TabsContent value="content">
              <AnalysisSection title="Content Quality">
                <div className="space-y-4">
                  <MetricCard
                    title="Sentence Complexity"
                    value={`${(currentAnalysis.sentenceComplexity.complexityRatio * 100).toFixed(0)}%`}
                    rating={currentAnalysis.sentenceComplexity.rating}
                    description="Complex sentence ratio"
                  />
                  <MetricCard
                    title="Vocabulary Variety"
                    value={`${(currentAnalysis.repetition.repetitionScore * 100).toFixed(0)}%`}
                    rating={currentAnalysis.repetition.rating}
                    description="Unique word ratio"
                  />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Most Repeated Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.repetition.wordFrequency
                        .slice(0, 5)
                        .map(
                          (
                            word: { word: string; count: number },
                            index: number
                          ) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {word.word} ({word.count})
                            </span>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </AnalysisSection>
            </TabsContent>
          </Tabs> */}
        </div>

        {/* Right Column - Feedback and Transcription */}
        <div className="space-y-4">
          {/* <Card>
            <CardHeader>
              <CardTitle>Personalized Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {feedbackMetrics.map((metric) => (
                    <MetricFeedbackSection
                      key={metric}
                      metric={metric}
                      feedback={(feedback as Record<string, any>)[metric]}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card> */}

          {/* <Card className="bg-muted/50 border-none">
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-4">
                  {currentTranscription ? (
                    <div className="prose prose-sm max-w-none rounded-lg">
                      {currentTranscription
                        .split(". ")
                        .map((sentence: string, index: number) => (
                          <p key={index} className="mb-2">
                            {sentence.trim()}.
                          </p>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        Transcription not available
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card> */}
        </div>
      </div>

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
