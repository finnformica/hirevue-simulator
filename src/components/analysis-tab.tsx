import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";

export function AnalysisTab() {
  const dispatch = useAppDispatch();
  const { analysis, isAnalysing, error } = useAppSelector(
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
        <button
          onClick={() => dispatch(setCurrentTab("recording"))}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center p-8">
        <p className="text-lg">No analysis available</p>
        <button
          onClick={() => dispatch(setCurrentTab("recording"))}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Record Response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Content Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Clarity Score</h3>
              <p className="text-muted-foreground">
                {analysis.clarityScore !== null
                  ? `${Math.round(analysis.clarityScore * 100)}%`
                  : "Not available"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Technical Accuracy</h3>
              <p className="text-muted-foreground">
                {analysis.technicalAccuracy !== null
                  ? `${Math.round(analysis.technicalAccuracy * 100)}%`
                  : "Not available"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sentiment Score</h3>
              <p className="text-muted-foreground">
                {analysis.sentimentScore !== null
                  ? `${Math.round(analysis.sentimentScore * 100)}%`
                  : "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Voice Modulation</h3>
              <p className="text-muted-foreground">
                {analysis.confidenceMetrics.voiceModulation !== null
                  ? `${Math.round(analysis.confidenceMetrics.voiceModulation * 100)}%`
                  : "Not available"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pacing</h3>
              <p className="text-muted-foreground">
                {analysis.confidenceMetrics.pacing !== null
                  ? `${Math.round(analysis.confidenceMetrics.pacing * 100)}%`
                  : "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={() => dispatch(setCurrentTab("recording"))}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Record Again
        </button>
      </div>
    </div>
  );
}
