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
