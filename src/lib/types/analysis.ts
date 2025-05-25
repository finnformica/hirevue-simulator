export interface AudioAnalysis {
  voiceModulation: number | null;
  pacing: number | null;
  fluency: number | null;
  fillerWordCount: number;
  fillerWords: string[];
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  relevanceScore: number | null;
}

export interface GrammarAnalysis {
  errorCount: number | null;
  errors: Array<{
    type: string;
    suggestion: string;
    context: string;
  }>;
  score: number | null;
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

export interface ConfidenceMetrics {
  voiceModulation: number | null;
  pacing: number | null;
  vocabulary: number | null;
}

export interface DetailedAnalysis {
  audio: AudioAnalysis | null;
  keywords: KeywordAnalysis | null;
  grammar: GrammarAnalysis | null;
  sentenceComplexity: SentenceComplexity;
  repetition: RepetitionAnalysis;
}

export interface AnalysisBase {
  id: string;
  interviewId: string;
  transcription: string;
  prompt: string;
  sentimentScore: number | null;
  clarityScore: number | null;
  technicalAccuracy: number | null;
  confidenceMetrics: ConfidenceMetrics;
  keyPoints: string[] | null;
  improvementAreas: string[] | null;
  detailedAnalysis: DetailedAnalysis;
  createdAt: Date;
}

export interface Analysis extends AnalysisBase {
  type: "analysis";
}

export interface CachedAnalysis extends AnalysisBase {
  type: "cached";
  cacheId: string;
  cachedAt: Date;
}

export type AnalysisResult = Analysis | CachedAnalysis;

// Type guards
export function isCachedAnalysis(
  analysis: AnalysisResult
): analysis is CachedAnalysis {
  return analysis.type === "cached";
}

export function isFreshAnalysis(
  analysis: AnalysisResult
): analysis is Analysis {
  return analysis.type === "analysis";
}

// Utility functions
export function getAnalysisDate(analysis: AnalysisResult): Date {
  return isCachedAnalysis(analysis) ? analysis.cachedAt : analysis.createdAt;
}

export function getAnalysisId(analysis: AnalysisResult): string {
  return isCachedAnalysis(analysis) ? analysis.cacheId : analysis.id;
}
