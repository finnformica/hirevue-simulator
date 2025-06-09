export interface FluencyAnalysis {
  fillerWords: {
    count: number;
    perMinute: number;
    rating: "Ideal" | "Acceptable" | "Risk";
    examples: string[];
  };
  speakingSpeed: {
    wordsPerMinute: number;
    rating: "Too Slow" | "Good" | "Too Fast";
    segments: Array<{
      start: number;
      end: number;
      speed: number;
    }>;
  };
}

export interface KeywordAnalysis {
  matched: Array<{
    keyword: string;
    weight: number;
    context: string;
    timing: number;
  }>;
  missed: string[];
  score: number;
  coverage: number;
}

export interface GrammarAnalysis {
  errorRate: number;
  totalErrors: number;
  errors: Array<{
    type: string;
    original: string;
    suggestion: string;
    context: string;
  }>;
  rating: "Excellent" | "Good" | "Needs Improvement";
}

export interface SentenceComplexityAnalysis {
  simple: number;
  compound: number;
  complex: number;
  compoundComplex: number;
  averageLength: number;
  complexityRatio: number;
  rating: "Balanced" | "Too Simple" | "Too Complex";
}

export interface RepetitionAnalysis {
  wordFrequency: Array<{
    word: string;
    count: number;
    sentences: string[];
  }>;
  phraseRepetition: Array<{
    phrase: string;
    count: number;
    context: string[];
  }>;
  repetitionScore: number;
  rating: "Good" | "Moderate" | "High";
}

export interface AnalysisFeedback {
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  practiceExercises: string[];
}

export interface AnalysisResult {
  fluency: FluencyAnalysis;
  keywords: KeywordAnalysis;
  grammar: GrammarAnalysis;
  sentenceComplexity: SentenceComplexityAnalysis;
  repetition: RepetitionAnalysis;
  feedback: AnalysisFeedback;
}
