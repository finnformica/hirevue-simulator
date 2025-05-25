export interface Interview {
  id: string;
  userId: string;
  promptId: string;
  videoUrl: string;
  createdAt: Date;
  duration: number;
  status: "processing" | "completed" | "failed";
}

export interface Transcription {
  id: string;
  interviewId: string;
  textContent: string;
  createdAt: Date;
  confidenceScore: number;
}

export interface AudioAnalysis {
  voiceModulation: number;
  pacing: number;
  fluency: number;
  fillerWordCount: number;
  fillerWords: string[];
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  relevanceScore: number;
}

export interface GrammarAnalysis {
  errorCount: number;
  errors: Array<{
    type: string;
    suggestion: string;
    context: string;
  }>;
  score: number;
}

export interface SentenceComplexity {
  averageLength: number;
  complexityScore: number;
  complexSentences: number;
  simpleSentences: number;
}

export interface RepetitionAnalysis {
  repeatedWords: Array<{
    word: string;
    count: number;
    sentences: string[];
  }>;
  repetitionScore: number;
}

export interface Analysis {
  id: string;
  interviewId: string;
  sentimentScore: number;
  clarityScore: number;
  technicalAccuracy: number;
  confidenceMetrics: {
    voiceModulation: number;
    pacing: number;
    vocabulary: number;
  };
  keyPoints: string[];
  improvementAreas: string[];
  detailedAnalysis: {
    audio: AudioAnalysis;
    keywords: KeywordAnalysis;
    grammar: GrammarAnalysis;
    sentenceComplexity: SentenceComplexity;
    repetition: RepetitionAnalysis;
  };
  createdAt: Date;
}

export interface Prompt {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  expectedDuration: number;
  createdAt: Date;
}

export interface ProcessingStatus {
  status: "uploading" | "transcribing" | "analyzing" | "completed" | "failed";
  progress?: number;
  error?: string;
}
