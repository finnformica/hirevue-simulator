"use client";

import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import VideoPlayer from "./VideoPlayer";
import VideoRecorder from "./VideoRecorder";

type InterviewState = "idle" | "countdown" | "recording" | "playback";

interface InterviewSimulatorProps {
  question?: string;
  instructions?: string;
}

const InterviewSimulator = ({
  question = "Tell me about a time when you demonstrated leadership skills.",
  instructions = "You will have up to 2 minutes to record your response. Take a moment to gather your thoughts before starting.",
}: InterviewSimulatorProps) => {
  const [interviewState, setInterviewState] = useState<InterviewState>("idle");
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  const handleStartRecording = () => {
    setInterviewState("countdown");
  };

  const handleRecordingStart = useCallback(() => {
    setInterviewState("recording");
  }, []);

  const handleRecordingStop = useCallback((videoBlob: Blob) => {
    setRecordedVideo(URL.createObjectURL(videoBlob));
    setInterviewState("playback");
  }, []);

  const handleRecordAgain = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    setInterviewState("idle");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-4xl shadow-lg bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Interview Question
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-foreground">
            {question}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          {interviewState === "idle" && (
            <div className="text-center space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">{instructions}</p>
              </div>
              <Button size="lg" onClick={handleStartRecording} className="px-8">
                Start Recording
              </Button>
            </div>
          )}

          {(interviewState === "countdown" ||
            interviewState === "recording") && (
            <VideoRecorder
              isCountingDown={interviewState === "countdown"}
              onCountdownComplete={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              maxRecordingTimeMs={120000} // 2 minutes
            />
          )}

          {interviewState === "playback" && recordedVideo && (
            <VideoPlayer
              videoBlob={new Blob([], { type: "video/webm" })}
              onReRecord={handleRecordAgain}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {interviewState === "recording" && (
            <p className="text-sm text-muted-foreground">
              Recording in progress... Click stop when you're finished.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InterviewSimulator;
