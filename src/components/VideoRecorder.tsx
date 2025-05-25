"use client";

import {
  AlertCircle,
  CircleStop,
  Mic,
  MicOff,
  Play,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

type RecordingStatus = "idle" | "countdown" | "recording" | "stopped";

interface VideoRecorderProps {
  maxRecordingTime?: number; // in seconds
  countdownTime?: number; // in seconds
  onRecordingComplete?: (recordedBlob: Blob) => void;
}

const VideoRecorder = ({
  maxRecordingTime = 120, // 2 minutes default
  countdownTime = 3, // 3 seconds default
  onRecordingComplete = () => {},
}: VideoRecorderProps) => {
  // Convert milliseconds to seconds if provided
  const effectiveMaxRecordingTime = maxRecordingTime;

  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");

  const [error, setError] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number>(countdownTime);
  const [permission, setPermission] = useState<boolean>(false); // camera and audio permission
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true); // enable audio
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true); // enable video
  const [recordingTime, setRecordingTime] = useState<number>(0); // time elapsed in seconds

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
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
        "Could not access camera or microphone, please check your permissions"
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

    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onRecordingComplete(blob);
    };

    recorder.start();

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
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
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
    setRecordingTime(0);
    setCountdown(countdownTime);
  };

  // Initialize camera if isCountingDown is true
  useEffect(() => {
    if (!permission) {
      getCameraPermission();
    }
  }, [permission]);

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
          <AlertTitle>Permission error</AlertTitle>
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
        </CardContent>
      </Card>

      {/* Progress bar for recording time */}
      {recordingStatus === "recording" && (
        <div className="mt-3">
          <Progress value={(recordingTime / effectiveMaxRecordingTime) * 100} />
          <div className="flex justify-between text-sm mt-1">
            <span>{formatTime(recordingTime)}</span>
            <span>{formatTime(effectiveMaxRecordingTime)}</span>
          </div>
        </div>
      )}

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
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}

            {recordingStatus === "recording" && (
              <Button onClick={stopRecording} variant="outline">
                <CircleStop className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {recordingStatus === "stopped" && (
              <Button onClick={resetRecorder} variant="outline">
                Record Again
              </Button>
            )}

            <Button
              onClick={toggleAudio}
              variant="outline"
              disabled={!permission}
            >
              {audioEnabled ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <MicOff className="h-4 w-4 mr-2" />
              )}
              {audioEnabled ? "Mute" : "Unmute"}
            </Button>

            <Button
              onClick={toggleVideo}
              variant="outline"
              disabled={!permission}
            >
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
