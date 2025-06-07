"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  processRecording,
  setCurrentTab,
  setInterviewId,
} from "@/lib/store/slices/simulatorSlice";
import { useAuth } from "@/providers/auth-provider";
import { uploadInterview } from "@/utils/api/interview";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Progress } from "./ui/progress";

type Permission = "pending" | "denied" | "accepted";

export const RecordingTab = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { prompt, interviewId } = useAppSelector((state) => state.simulator);

  const countdownTime = 3;
  const maxRecordingTime = 120;
  const countdown = countdownTime * 1000;

  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(maxRecordingTime); // 60 seconds for the interview question
  const [isCountingDown, setIsCountingDown] = useState(false); // display countdown timer
  const [countdownValue, setCountdownValue] = useState(countdown); // countdown value for the time in seconds
  const [permission, setPermission] = useState<Permission>("pending"); // camera and microphone permission

  const chunksRef = useRef<Blob[]>([]);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  async function loadFFmpeg() {
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
    } catch (error) {
      console.error("Error loading FFmpeg:", error);
    }
  }

  async function setupMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      setPermission("accepted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setPermission("denied");
    }
  }

  // recording timer display in mm:ss
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  useEffect(() => {
    loadFFmpeg();
    setupMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
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

    setError(null);

    // generate a new interview id for each recording
    dispatch(setInterviewId(uuid()));

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
      if (!user || !prompt || !interviewId || loading) {
        setError("Error processing recording, please try again.");
        return;
      }

      setLoading(true);

      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });

      const ffmpeg = ffmpegRef?.current;
      if (!ffmpeg) throw new Error("FFmpeg not loaded");

      // Load FFmpeg if not loaded
      if (!ffmpeg.loaded) await ffmpeg.load();

      // Write the video blob to FFmpeg's virtual filesystem
      ffmpeg.writeFile("input.webm", await fetchFile(videoBlob));

      // Extract audio
      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-vn",
        "-acodec",
        "libmp3lame",
        "output.mp3",
      ]);

      // Read the audio file
      const audioData = await ffmpeg.readFile("output.mp3");
      const audioBlob = new Blob([audioData], { type: "audio/mp3" });

      // After processing, upload to Supabase and insert interview record
      const payload = {
        userId: user.id,
        interviewId,
        promptId: prompt.id,
        videoBlob,
      };

      // upload the video blob and insert the interview record
      const { error: uploadError } = await uploadInterview(payload);

      if (uploadError) {
        setError(
          "Failed to upload recording: " +
            uploadError.message +
            "\nPlease try again."
        );
        setLoading(false);
        return;
      }

      dispatch(
        processRecording({
          videoBlob,
          audioBlob,
          prompt: prompt.question,
          interviewId,
        })
      );

      dispatch(setCurrentTab("playback"));

      setLoading(false);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{prompt?.question}</p>
        </CardContent>
      </Card>

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

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <Spinner size={56} />
            </div>
          )}

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
              {formatTime(timeLeft * 1000)}
            </div>
          )}

          {isRecording && (
            <div className="mt-4">
              <Progress value={(timeLeft / maxRecordingTime) * 100} />
            </div>
          )}

          {(permission === "pending" || permission === "denied") && (
            <div
              className={`absolute inset-0 flex text-center items-center justify-center z-10 ${permission === "pending" ? "bg-black/70 text-white" : "bg-black/80 text-red-400"}`}
            >
              <div>
                <p className="text-lg font-semibold">
                  {permission === "pending"
                    ? "Requesting camera and microphone access…"
                    : "Camera/Microphone access denied"}
                </p>
                {permission === "denied" && (
                  <>
                    {error && <p className="mt-2 text-sm">{error}</p>}
                    <p className="mt-2 text-sm">
                      Please enable permissions and reload the page.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startCountdown}
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
