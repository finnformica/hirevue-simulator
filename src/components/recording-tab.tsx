import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoRecorder from "./VideoRecorder";

interface RecordingTabProps {
  onComplete: (recording: {
    video: Blob;
    audio: Blob;
    transcription: string;
  }) => void;
}

export function RecordingTab({ onComplete }: RecordingTabProps) {
  return (
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
        <VideoRecorder onRecordingComplete={onComplete} />
      </CardContent>
    </Card>
  );
}
