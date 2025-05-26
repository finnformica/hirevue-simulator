import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number | null;
  description: string;
}) {
  return (
    <div className="flex-1 bg-muted/50 rounded-lg p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {score !== null ? `${Math.round(score * 100)}%` : "N/A"}
          </span>
        </div>
        <Progress value={score ? score * 100 : 0} className="h-2" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
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

export function AnalysisTab() {
  const dispatch = useAppDispatch();
  const { analysis, isAnalysing, error, transcription } = useAppSelector(
    (state) => state.simulator
  );

  if (isAnalysing) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-lg">Analysing your response...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <p className="text-lg">{error}</p>
        <Button
          onClick={() => dispatch(setCurrentTab("recording"))}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center p-8">
        <p className="text-lg">No analysis available</p>
        <Button
          onClick={() => dispatch(setCurrentTab("recording"))}
          className="mt-4"
        >
          Record Response
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Overall Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="Technical Accuracy"
              score={analysis.technicalAccuracy}
              description="How well you addressed the technical aspects of the question"
            />
            <ScoreCard
              title="Clarity"
              score={analysis.clarityScore}
              description="How clear and understandable your response was"
            />
            <ScoreCard
              title="Delivery"
              score={analysis.confidenceMetrics.voiceModulation}
              description="How confident and engaging your delivery was"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Analysis Dashboard */}
        <div className="space-y-4">
          <Tabs defaultValue="technical" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="technical">
              <AnalysisSection title="Technical Performance">
                <div className="space-y-4">
                  <ScoreCard
                    title="Technical Accuracy"
                    score={analysis.technicalAccuracy}
                    description="Accuracy of technical content"
                  />
                  <ScoreCard
                    title="Keyword Usage"
                    score={
                      analysis.detailedAnalysis.keywords?.relevanceScore ?? null
                    }
                    description="Use of relevant technical terms"
                  />
                  <ScoreCard
                    title="Grammar"
                    score={analysis.detailedAnalysis.grammar?.score ?? null}
                    description="Grammar and language usage"
                  />
                </div>
              </AnalysisSection>
            </TabsContent>

            <TabsContent value="delivery">
              <AnalysisSection title="Delivery Metrics">
                <div className="space-y-4">
                  <ScoreCard
                    title="Voice Modulation"
                    score={analysis.confidenceMetrics.voiceModulation}
                    description="Variation in tone and pitch"
                  />
                  <ScoreCard
                    title="Pacing"
                    score={analysis.confidenceMetrics.pacing}
                    description="Speaking speed and rhythm"
                  />
                  <ScoreCard
                    title="Filler Words"
                    score={analysis.detailedAnalysis.audio?.fluency ?? null}
                    description="Use of filler words and pauses"
                  />
                </div>
              </AnalysisSection>
            </TabsContent>

            <TabsContent value="content">
              <AnalysisSection title="Content Quality">
                <div className="space-y-4">
                  <ScoreCard
                    title="Clarity"
                    score={analysis.clarityScore}
                    description="Overall clarity of the response"
                  />
                  <ScoreCard
                    title="Sentence Complexity"
                    score={
                      analysis.detailedAnalysis.sentenceComplexity
                        .complexityScore
                    }
                    description="Balance of simple and complex sentences"
                  />
                  <ScoreCard
                    title="Repetition"
                    score={analysis.detailedAnalysis.repetition.repetitionScore}
                    description="Avoidance of unnecessary repetition"
                  />
                </div>
              </AnalysisSection>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Transcription */}
        <Card className="h-full bg-muted/50 border-none">
          <CardHeader>
            <CardTitle>Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none rounded-lg">
                  {transcription?.split(". ").map((sentence, index) => (
                    <p key={index} className="mb-2">
                      {sentence.trim()}.
                    </p>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
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
    </div>
  );
}
