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

// Updated structured analysis interface to match new prompt output
export interface StructuredAnalysis {
  overallScore: number;
  grade: "Excellent" | "Good" | "Average" | "Poor" | "Failed";
  overallStatement: string;
  readinessAssessment: string;
  lengthAssessment: string;
  metrics: {
    contentQuality: MetricDetail;
    professionalCompetency: MetricDetail;
    communicationClarity: MetricDetail;
    languageProficiency: MetricDetail;
    deliveryConfidence: MetricDetail;
    fluency: MetricDetail;
  };
  detailedFeedback: {
    topStrengths: string[];
    criticalImprovements: string[];
    quickWins: string[];
    roleSpecificAdvice: string;
    nextInterviewPrep: string;
  };
}

export interface MetricDetail {
  score: number;
  weight: string;
  feedback: string;
  keyObservation: string;
}

export interface AnalysisResponse {
  structuredAnalysis: StructuredAnalysis;
  rawAnalysis: string;
}
