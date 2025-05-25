import { useState } from "react";

import { Analysis } from "@/lib/types";

import { AnalysisTab } from "@/components/analysis-tab";
import { PlaybackTab } from "@/components/playback-tab";
import { PromptTab } from "@/components/prompt-tab";
import { RecordingTab } from "@/components/recording-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InterviewSimulator() {
  const [activeTab, setActiveTab] = useState("prompt");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [recording, setRecording] = useState<{
    video: Blob;
    audio: Blob;
    transcription: string;
  } | null>(null);

  const handleAnalysisComplete = async (recording: {
    video: Blob;
    audio: Blob;
    transcription: string;
  }) => {
    setIsAnalyzing(true);
    try {
      // Convert audio to base64
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(",")[1]);
        };
        reader.readAsDataURL(recording.audio);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: recording.transcription,
          audio: audioBase64,
          prompt: "Your interview prompt here", // Replace with actual prompt
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const analysisData = await response.json();
      setAnalysis(analysisData);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Analysis error:", error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="playback">Playback</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt">
          <PromptTab onStart={() => setActiveTab("recording")} />
        </TabsContent>

        <TabsContent value="recording">
          <RecordingTab
            onComplete={(recording: {
              video: Blob;
              audio: Blob;
              transcription: string;
            }) => {
              setRecording(recording);
              setActiveTab("playback");
            }}
          />
        </TabsContent>

        <TabsContent value="playback">
          {recording && (
            <PlaybackTab
              recording={recording}
              onAnalyze={() => handleAnalysisComplete(recording)}
            />
          )}
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisTab analysis={analysis} isLoading={isAnalyzing} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
