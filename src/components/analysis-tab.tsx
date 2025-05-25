import { ScoreCard } from "@/components/score-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analysis } from "@/lib/types/analysis";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface AnalysisTabProps {
  analysis: Analysis | null;
  isLoading: boolean;
}

export function AnalysisTab({ analysis, isLoading }: AnalysisTabProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground">Analyzing your response...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Analysis Failed</h3>
          <p className="text-muted-foreground">
            We couldn't analyze your response. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const scores = {
    sentiment: analysis.sentimentScore ?? 0.5,
    clarity: analysis.clarityScore ?? 0.5,
    technical: analysis.technicalAccuracy ?? 0.5,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          title="Sentiment"
          score={scores.sentiment}
          description="How positive and engaging your response was"
        />
        <ScoreCard
          title="Clarity"
          score={scores.clarity}
          description="How clear and well-structured your response was"
        />
        <ScoreCard
          title="Technical Accuracy"
          score={scores.technical}
          description="How technically accurate your response was"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Key Points</h3>
            {analysis.keyPoints && analysis.keyPoints.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No key points identified.</p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Areas for Improvement</h3>
            {analysis.improvementAreas &&
            analysis.improvementAreas.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {analysis.improvementAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No specific improvements identified.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Audio Analysis</h3>
            {analysis.detailedAnalysis.audio ? (
              <div className="space-y-2">
                <p>
                  Voice Modulation:{" "}
                  {analysis.detailedAnalysis.audio.voiceModulation
                    ? `${Math.round(
                        analysis.detailedAnalysis.audio.voiceModulation * 100
                      )}%`
                    : "N/A"}
                </p>
                <p>
                  Pacing:{" "}
                  {analysis.detailedAnalysis.audio.pacing
                    ? `${Math.round(
                        analysis.detailedAnalysis.audio.pacing * 100
                      )}%`
                    : "N/A"}
                </p>
                <p>
                  Fluency:{" "}
                  {analysis.detailedAnalysis.audio.fluency
                    ? `${Math.round(
                        analysis.detailedAnalysis.audio.fluency * 100
                      )}%`
                    : "N/A"}
                </p>
                <p>
                  Filler Words:{" "}
                  {analysis.detailedAnalysis.audio.fillerWordCount}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No audio analysis available.
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Grammar Analysis</h3>
            {analysis.detailedAnalysis.grammar ? (
              <div className="space-y-2">
                <p>
                  Score:{" "}
                  {analysis.detailedAnalysis.grammar.score
                    ? `${Math.round(
                        analysis.detailedAnalysis.grammar.score * 100
                      )}%`
                    : "N/A"}
                </p>
                <p>
                  Error Count:{" "}
                  {analysis.detailedAnalysis.grammar.errorCount ?? "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No grammar analysis available.
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Sentence Complexity</h3>
            <div className="space-y-2">
              <p>
                Average Length:{" "}
                {Math.round(
                  analysis.detailedAnalysis.sentenceComplexity.averageLength
                )}{" "}
                words
              </p>
              <p>
                Complexity Score:{" "}
                {Math.round(
                  analysis.detailedAnalysis.sentenceComplexity.complexityScore *
                    100
                )}
                %
              </p>
              <p>
                Complex Sentences:{" "}
                {analysis.detailedAnalysis.sentenceComplexity.complexSentences}
              </p>
              <p>
                Simple Sentences:{" "}
                {analysis.detailedAnalysis.sentenceComplexity.simpleSentences}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
