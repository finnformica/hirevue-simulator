import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface PlaybackTabProps {
  recording: {
    video: Blob;
    audio: Blob;
    transcription: string;
  };
  onAnalyze: () => void;
}

export function PlaybackTab({ recording, onAnalyze }: PlaybackTabProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(recording.video);
    }
  }, [recording.video]);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Review Your Response</h2>

      <Card className="p-4">
        <video
          ref={videoRef}
          controls
          className="w-full rounded-lg"
          playsInline
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Transcription</h3>
        <p className="text-sm text-gray-600">{recording.transcription}</p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onAnalyze} size="lg">
          Analyze Response
        </Button>
      </div>
    </div>
  );
}
