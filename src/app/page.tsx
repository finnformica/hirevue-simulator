"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Play, RotateCcw, Video } from "lucide-react";
import { useState } from "react";

export default function InterviewSimulatorPage() {
  const [activeTab, setActiveTab] = useState("instructions");
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  // Sample interview questions
  const interviewQuestions = [
    "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    "Describe a project where you had to meet a tight deadline. How did you ensure the project was completed on time?",
    "What are your greatest strengths and how do they help you succeed?",
    "Why are you interested in this position and what makes you a good fit?",
    "Where do you see yourself in five years?",
  ];

  // Randomly select a question
  const [currentQuestion] = useState(
    interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)]
  );

  const startRecording = () => {
    setShowCountdown(true);

    // Start countdown
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        setShowCountdown(false);
        setIsRecording(true);
        setActiveTab("recording");
      }
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    setActiveTab("playback");
  };

  const resetRecording = () => {
    setHasRecording(false);
    setActiveTab("instructions");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl bg-background">
      <h1 className="text-3xl font-bold text-center mb-8">
        Hirevue Interview Simulator
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{currentQuestion}</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions" disabled={isRecording}>
            Instructions
          </TabsTrigger>
          <TabsTrigger
            value="recording"
            disabled={!isRecording && !showCountdown}
          >
            Recording
          </TabsTrigger>
          <TabsTrigger value="playback" disabled={!hasRecording}>
            Playback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use the Interview Simulator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                1. When you're ready to begin, click the "Start Recording"
                button below.
              </p>
              <p>
                2. A 3-second countdown will appear before recording starts.
              </p>
              <p>
                3. Answer the interview question as if you were in a real
                interview.
              </p>
              <p>4. Click "Stop Recording" when you've finished your answer.</p>
              <p>5. You can then review your response in the Playback tab.</p>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={startRecording}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Video className="h-5 w-5" />
                  Start Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Recording Your Response</span>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-500 text-sm">Recording</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showCountdown ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="text-6xl font-bold">{countdown}</div>
                  <p className="mt-4">Recording will start soon...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    {/* This would be replaced with actual video feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white">
                        Camera feed would appear here
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      <Pause className="h-5 w-5" />
                      Stop Recording
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Speak clearly and maintain eye contact with the camera
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {/* This would be replaced with actual recorded video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Recorded video would appear here</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Play
                </Button>

                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  Record Again
                </Button>

                <Button
                  onClick={resetRecording}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
