"use client";

import {
  Pause,
  Play,
  PlayIcon,
  RotateCcw,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";

const PlaybackTab = () => {
  const dispatch = useAppDispatch();
  const { videoUrl, transcription, isTranscribing } = useAppSelector(
    (state) => state.simulator
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      if (isFinite(video.duration) && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Force duration calculation for webm blobs
    const fixDuration = async () => {
      if (video.readyState >= 1) {
        // Ready to access metadata
        if (!isFinite(video.duration) || isNaN(video.duration)) {
          const onSeeked = () => {
            setDuration(video.duration);
            video.currentTime = 0;
            video.removeEventListener("seeked", onSeeked);
          };

          video.addEventListener("seeked", onSeeked);
          video.currentTime = 1e10; // Seek very far to trigger duration calc
        } else {
          setDuration(video.duration);
        }
      } else {
        video.addEventListener("loadedmetadata", fixDuration, { once: true });
      }
    };

    fixDuration();

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    video.muted = newMutedState;
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    video.volume = volumeValue;
    setIsMuted(volumeValue === 0);
  };

  const handleTimeChange = (newTime: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const timeValue = newTime[0];
    setCurrentTime(timeValue);
    video.currentTime = timeValue;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const renderTranscription = () => {
    if (isTranscribing) {
      return "Transcribing your response...";
    }

    if (transcription) {
      return transcription;
    }

    return "No transcription available";
  };

  return (
    <>
      <Card>
        <CardContent>
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            {videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                playsInline
              />
            )}
          </div>

          {/* Video Controls */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex-1 px-2">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleTimeChange}
                  className="cursor-pointer"
                />
              </div>

              <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => dispatch(setCurrentTab("recording"))}
                  className="flex items-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  Record Again
                </Button>

                <Button
                  onClick={() => dispatch(setCurrentTab("prompt"))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Start Over
                </Button>

                <Button
                  onClick={() => dispatch(setCurrentTab("analysis"))}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  View Analysis
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcription */}
      <div className="mt-2 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Transcription</h3>
        <p
          className={`whitespace-pre-wrap break-words ${!transcription && !isTranscribing ? "text-muted-foreground" : ""}`}
        >
          {renderTranscription()}
        </p>
      </div>
    </>
  );
};

export default PlaybackTab;
