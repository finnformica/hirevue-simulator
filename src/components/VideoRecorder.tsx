"use client";

import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Progress } from "./ui/progress";

type RecordingStatus = "idle" | "countdown" | "recording" | "stopped";

interface VideoRecorderProps {
  maxRecordingTime?: number; // in seconds
  countdownTime?: number; // in seconds
  onRecordingComplete: (recording: {
    video: Blob;
    audio: Blob;
    transcription: string;
  }) => void;
}

const VideoRecorder = ({
  maxRecordingTime = 120, // 2 minutes default
  countdownTime = 3, // 3 seconds default
  onRecordingComplete,
}: VideoRecorderProps) => {
  // Convert milliseconds to seconds if provided
  const maxTime = maxRecordingTime * 1000;
  const countdown = countdownTime * 1000;

  const [isRecording, setIsRecording] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [permission, setPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdownValue, setCountdownValue] = useState(countdown);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        setPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setError("Failed to access camera and microphone");
        setPermission(false);
      }
    }

    setupMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdownValue(countdown);

    countdownRef.current = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1000) {
          clearInterval(countdownRef.current!);
          setIsCountingDown(false);
          startRecording();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      // Get transcription from the audio
      const formData = new FormData();
      formData.append(
        "audio",
        new File([audioBlob], "audio.webm", { type: "audio/webm" })
      );

      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Transcription failed");
        }

        const { text } = await response.json();

        onRecordingComplete({
          video: videoBlob,
          audio: audioBlob,
          transcription: text,
        });
      } catch (error) {
        console.error("Transcription error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to transcribe audio"
        );
      }
    };

    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= maxTime) {
          stopRecording();
          return prev;
        }
        return prev + 1000;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!permission) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Camera & Microphone Access Required
        </h2>
        <p className="text-gray-600">
          Please allow access to your camera and microphone to start the
          interview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Video preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-black"
          />

          {/* Countdown overlay */}
          {isCountingDown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-6xl font-bold text-white">
                {Math.ceil(countdownValue / 1000)}
              </div>
            </div>
          )}

          {/* Recording timer */}
          {isRecording && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Recording progress */}
          {isRecording && (
            <Progress
              value={(recordingTime / maxTime) * 100}
              className="absolute bottom-0 left-0 right-0 rounded-none"
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startCountdown}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className="flex items-center gap-2"
          disabled={isCountingDown}
        >
          <Video className="h-5 w-5" />
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
};

export default VideoRecorder;
