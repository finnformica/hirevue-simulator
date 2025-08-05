import { AnalysisGrade } from "./schemas";

export interface AnalysisResult {
  grammar: number;
  sentenceComplexity: number;
  keywords: number;
  fillerWordsUsed: number;
  repetition: number;
  clarity: number;
  confidence: number;
  structure: number;
  vocabulary: number;
  overallScore: number;
  aiAnalysis: string;
  grade?: AnalysisGrade;
}

// New structured analysis interface
export interface StructuredAnalysis {
  overallScore: number;
  overallStatement: string;
  grade: string;
  metrics: {
    clarity: MetricDetail;
    confidence: MetricDetail;
    structure: MetricDetail;
    grammar: MetricDetail;
    vocabulary: MetricDetail;
    sentenceComplexity: MetricDetail;
    repetition: MetricDetail;
    fillerWordsUsed: MetricDetail;
    keywords: MetricDetail;
  };
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    specificSuggestions: string[];
    keyAdvice: string;
  };
}

export interface MetricDetail {
  score: number;
  feedback: string;
  description: string;
}

export interface AnalysisResponse {
  structuredAnalysis: StructuredAnalysis;
  rawAnalysis: string;
}
