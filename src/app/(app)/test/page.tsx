"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  processRecording,
  setCurrentTab,
} from "@/lib/store/slices/simulatorSlice";

export default function WebcamTest() {
  const dispatch = useAppDispatch();
  const { prompt } = useAppSelector((state) => state.simulator);

  const countdownTime = 3;
  const maxRecordingTime = 120;
  const countdown = countdownTime * 1000;

  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState(false); // camera and microphone permission
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(maxRecordingTime); // 60 seconds for the interview question
  const [isCountingDown, setIsCountingDown] = useState(false); // display countdown timer
  const [countdownValue, setCountdownValue] = useState(countdown); // countdown value for the time in seconds

  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

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
  };

  async function setupMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // check if the video track is ready
      const videoTrack = stream.getVideoTracks()[0];
      console.log("Video state:", videoTrack.readyState); // should be "live"

      // check if the audio track is ready
      const audioTrack = stream.getAudioTracks()[0];
      console.log("Audio state:", audioTrack.readyState); // should be "live"

      streamRef.current = stream;
      setPermission(true);

      console.log("Video ref current srcObject:", videoRef.current?.srcObject);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // Force video to play in case autoPlay is not working
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setError("Failed to access camera and microphone");
      setPermission(false);
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

      const ffmpeg = ffmpegRef.current;
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

      if (prompt) {
        dispatch(processRecording({ videoBlob, audioBlob, prompt }));
      }
      dispatch(setCurrentTab("playback"));
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
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}
