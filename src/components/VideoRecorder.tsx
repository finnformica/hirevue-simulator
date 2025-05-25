"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { AlertCircle, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface VideoRecorderProps {
  onRecordingComplete?: (recordedBlob: Blob) => void;
  maxRecordingTime?: number; // in seconds
  countdownTime?: number; // in seconds
  isCountingDown?: boolean;
  onCountdownComplete?: () => void;
  onRecordingStop?: (recordedBlob: Blob) => void;
  maxRecordingTimeMs?: number; // in milliseconds
}

const VideoRecorder = ({
  onRecordingComplete = () => {},
  maxRecordingTime = 120, // 2 minutes default
  countdownTime = 3, // 3 seconds default
  isCountingDown = false,
  onCountdownComplete = () => {},
  onRecordingStop = () => {},
  maxRecordingTimeMs,
}: VideoRecorderProps) => {
  // Convert milliseconds to seconds if provided
  const effectiveMaxRecordingTime = maxRecordingTimeMs
    ? maxRecordingTimeMs / 1000
    : maxRecordingTime;
  const [permission, setPermission] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "countdown" | "recording" | "stopped"
  >("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number>(countdownTime);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request camera and microphone permissions
  const getCameraPermission = async () => {
    setError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });

      setPermission(true);
      setStream(mediaStream);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(
        "Could not access camera or microphone. Please check your permissions.",
      );
      console.error("Error accessing media devices:", err);
    }
  };

  // Start countdown before recording
  const startCountdown = () => {
    setRecordingStatus("countdown");
    setCountdown(countdownTime);

    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          onCountdownComplete();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return;

    setRecordingStatus("recording");
    setRecordingTime(0);
    chunksRef.current = [];

    const media = new MediaRecorder(streamRef.current);
    mediaRecorder.current = media;

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      onRecordingComplete(blob);
      onRecordingStop(blob);
    };

    mediaRecorder.current.start(200); // Collect data every 200ms

    // Set up recording timer
    const recordingInterval = setInterval(() => {
      setRecordingTime((prevTime) => {
        if (prevTime >= effectiveMaxRecordingTime) {
          clearInterval(recordingInterval);
          stopRecording();
          return effectiveMaxRecordingTime;
        }
        return prevTime + 1;
      });
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setRecordingStatus("stopped");
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Reset the recorder
  const resetRecorder = () => {
    setRecordingStatus("idle");
    setRecordedBlob(null);
    setRecordingTime(0);
    setCountdown(countdownTime);
  };

  // Initialize camera if isCountingDown is true
  useEffect(() => {
    if (isCountingDown && !permission) {
      getCameraPermission().then(() => {
        startCountdown();
      });
    }
  }, [isCountingDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-background w-full max-w-3xl mx-auto rounded-lg p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Video preview */}
          <div className="aspect-video bg-black relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Countdown overlay */}
            {recordingStatus === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-6xl font-bold text-white">
                  {countdown}
                </span>
              </div>
            )}

            {/* Recording indicator */}
            {recordingStatus === "recording" && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                <span>Recording</span>
              </div>
            )}
          </div>

          {/* Progress bar for recording time */}
          {recordingStatus === "recording" && (
            <div className="p-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{formatTime(recordingTime)}</span>
                <span>{formatTime(effectiveMaxRecordingTime)}</span>
              </div>
              <Progress
                value={(recordingTime / effectiveMaxRecordingTime) * 100}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {!permission ? (
          <Button onClick={getCameraPermission} variant="default">
            Start Camera
          </Button>
        ) : (
          <>
            {recordingStatus === "idle" && (
              <Button
                onClick={startCountdown}
                variant="default"
                className="bg-red-500 hover:bg-red-600"
              >
                Start Recording
              </Button>
            )}

            {recordingStatus === "recording" && (
              <Button onClick={stopRecording} variant="outline">
                Stop Recording
              </Button>
            )}

            {recordingStatus === "stopped" && (
              <Button onClick={resetRecorder} variant="outline">
                Record Again
              </Button>
            )}

            <Button onClick={toggleAudio} variant="outline">
              {audioEnabled ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <MicOff className="h-4 w-4 mr-2" />
              )}
              {audioEnabled ? "Mute" : "Unmute"}
            </Button>

            <Button onClick={toggleVideo} variant="outline">
              {videoEnabled ? (
                <Video className="h-4 w-4 mr-2" />
              ) : (
                <VideoOff className="h-4 w-4 mr-2" />
              )}
              {videoEnabled ? "Hide Video" : "Show Video"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
