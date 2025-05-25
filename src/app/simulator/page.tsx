"use client";

import { Video } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/VideoPlayer";
import VideoRecorder from "@/components/VideoRecorder";

// Sample interview questions
const interviewQuestions = [
  "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
  "Describe a project where you had to meet a tight deadline. How did you ensure the project was completed on time?",
  "What are your greatest strengths and how do they help you succeed?",
  "Why are you interested in this position and what makes you a good fit?",
  "Where do you see yourself in five years?",
];

export default function InterviewSimulatorPage() {
  const [blob, setBlob] = useState<Blob>();
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("instructions");

  // Randomly select a question
  const [currentQuestion] = useState(
    interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)]
  );

  const startRecording = () => {
    setActiveTab("recording"); // move to recording tab to display countdown
  };

  const stopRecording = (blob: Blob) => {
    setBlob(blob);
    setUrl(URL.createObjectURL(blob));

    setActiveTab("playback");
  };

  const resetRecording = () => {
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
          <TabsTrigger value="instructions" disabled>
            Instructions
          </TabsTrigger>
          <TabsTrigger value="recording" disabled>
            Recording
          </TabsTrigger>
          <TabsTrigger value="playback" disabled>
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
                <p className="font-normal text-sm text-muted-foreground">
                  Speak clearly and maintain eye contact with the camera
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoRecorder onRecordingComplete={stopRecording} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Response</CardTitle>
            </CardHeader>

            <CardContent>
              <VideoPlayer
                videoUrl={url}
                onReRecord={startRecording}
                onResetRecording={resetRecording}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
