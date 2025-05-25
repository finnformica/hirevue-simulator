export interface Interview {
  id: string;
  userId: string;
  prompt: string;
  status: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transcription {
  id: string;
  interviewId: string;
  text: string;
  confidence: number;
  createdAt: Date;
}

export interface ProcessingProgress {
  status: "pending" | "processing" | "completed";
  progress: number;
}

export interface ProcessingError {
  status: "failed";
  error: string;
}

export type ProcessingStatus = ProcessingProgress | ProcessingError;
