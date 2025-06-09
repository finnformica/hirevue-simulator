import {
  AnalysisFeedback,
  AnalysisResult,
  FluencyAnalysis,
  GrammarAnalysis,
  KeywordAnalysis,
  RepetitionAnalysis,
  SentenceComplexityAnalysis,
} from "@/lib/types/analysis";
import { NextResponse } from "next/server";

// API Configuration
const API_CONFIG = {
  baseUrl: "https://api-inference.huggingface.co/models",
  models: {
    semantic: "sentence-transformers/all-MiniLM-L6-v2",
    grammar: "vennify/t5-base-grammar-correction", // no Inference Providers
    sentenceComplexity: "facebook/bart-large-mnli",
    speechRecognition: "facebook/wav2vec2-base-960h", // no Inference Providers
  },
  parameters: {
    semantic: {
      maxLength: 512,
      threshold: 0.7,
    },
    grammar: {
      errorTypes: ["syntax", "agreement", "punctuation", "word_choice"],
    },
    sentenceComplexity: {
      categories: ["simple", "compound", "complex", "compound-complex"],
    },
    speechRecognition: {
      sampleRate: 16000,
    },
  },
} as const;

// Helper function to make API requests
async function makeApiRequest(
  model: keyof typeof API_CONFIG.models,
  inputs: any,
  parameters?: any
) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/${API_CONFIG.models[model]}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs,
        parameters: {
          ...API_CONFIG.parameters[model],
          ...parameters,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error(`API Error for ${model}:`, await response.text());
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Common filler words and phrases
const FILLER_WORDS = new Set([
  "um",
  "uh",
  "ah",
  "er",
  "like",
  "you know",
  "sort of",
  "kind of",
  "basically",
  "actually",
  "literally",
  "honestly",
  "maybe",
  "perhaps",
  "well",
  "so",
  "right",
  "okay",
  "anyway",
  "anyhow",
]);

// Helper Functions
function calculateWordsPerMinute(
  words: number,
  durationSeconds: number
): number {
  return (words / durationSeconds) * 60;
}

function rateSpeakingSpeed(wpm: number): "Too Slow" | "Good" | "Too Fast" {
  if (wpm < 100) return "Too Slow";
  if (wpm > 170) return "Too Fast";
  return "Good";
}

function rateFillerWords(
  count: number,
  durationMinutes: number
): "Ideal" | "Acceptable" | "Risk" {
  const perMinute = count / durationMinutes;
  if (perMinute <= 5) return "Ideal";
  if (perMinute <= 10) return "Acceptable";
  return "Risk";
}

function calculateErrorRate(errors: number, wordCount: number): number {
  return (errors / wordCount) * 100;
}

function rateGrammar(
  errorRate: number
): "Excellent" | "Good" | "Needs Improvement" {
  if (errorRate < 2) return "Excellent";
  if (errorRate < 5) return "Good";
  return "Needs Improvement";
}

function calculateComplexityRatio(
  complexity: SentenceComplexityAnalysis
): number {
  const total =
    complexity.simple +
    complexity.compound +
    complexity.complex +
    complexity.compoundComplex;
  return (complexity.complex + complexity.compoundComplex) / total;
}

function rateComplexity(
  ratio: number
): "Balanced" | "Too Simple" | "Too Complex" {
  if (ratio < 0.3) return "Too Simple";
  if (ratio > 0.7) return "Too Complex";
  return "Balanced";
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

// Analysis Functions
async function analyzeFluency(
  text: string,
  audioBuffer: ArrayBuffer
): Promise<FluencyAnalysis> {
  // Use the provided transcription instead of re-transcribing
  const words = text.split(/\s+/);
  const durationSeconds = audioBuffer.byteLength / 16000; // Assuming 16kHz audio
  const durationMinutes = durationSeconds / 60;

  // Analyze filler words
  const fillerWords = words.filter((word: any) =>
    FILLER_WORDS.has(word.toLowerCase())
  );
  const fillerWordCount = fillerWords.length;

  // Calculate speaking speed
  const wordsPerMinute = calculateWordsPerMinute(words.length, durationSeconds);

  // Use wav2vec2 model to analyze speech patterns and pauses
  const speechAnalysis = await makeApiRequest(
    "speechRecognition",
    audioBuffer,
    {
      return_timestamps: true,
      chunk_length_s: 30,
    }
  );

  // Extract speech segments with timing information
  const segments =
    speechAnalysis.chunks?.map((chunk: any) => ({
      start: chunk.start,
      end: chunk.end,
      speed: calculateWordsPerMinute(
        chunk.text.split(/\s+/).length,
        chunk.end - chunk.start
      ),
    })) || [];

  return {
    fillerWords: {
      count: fillerWordCount,
      perMinute: fillerWordCount / durationMinutes,
      rating: rateFillerWords(fillerWordCount, durationMinutes),
      examples: Array.from(new Set(fillerWords)),
    },
    speakingSpeed: {
      wordsPerMinute,
      rating: rateSpeakingSpeed(wordsPerMinute),
      segments,
    },
  };
}

async function analyzeKeywords(
  text: string,
  requiredKeywords: string[]
): Promise<KeywordAnalysis> {
  // Make a single API call for all keywords
  const result = await makeApiRequest("semantic", {
    source_sentence: text,
    sentences: requiredKeywords,
  });
  // result is an array of similarity scores
  const threshold = 0.7;
  const matches = requiredKeywords.map((keyword, i) => {
    const similarity = result[i];
    return {
      keyword,
      weight: similarity,
      context: text, // Optionally extract context window
      timing: 0, // Not implemented
      matched: similarity > threshold,
      similarity,
    };
  });

  // Separate matched and missed
  const matched = matches.filter((m) => m.matched);
  const missed = matches.filter((m) => !m.matched).map((m) => m.keyword);

  // Calculate score and coverage
  const score = matched.reduce((sum, m) => sum + m.similarity, 0);
  const coverage = (matched.length / requiredKeywords.length) * 100;

  return {
    matched: matched.map(({ keyword, weight, context, timing }) => ({
      keyword,
      weight,
      context,
      timing,
    })),
    missed,
    score,
    coverage,
  };
}

async function analyzeGrammar(text: string): Promise<GrammarAnalysis> {
  // Get corrected transcription (whole)
  const correctionResult = await makeApiRequest("grammar", text);
  const corrected =
    correctionResult.corrected || correctionResult[0]?.generated_text || text;

  // Get embeddings for both (whole)
  const [origEmbedResult, corrEmbedResult] = await Promise.all([
    makeApiRequest("semantic", text),
    makeApiRequest("semantic", corrected),
  ]);
  const origEmbed = origEmbedResult.embedding || origEmbedResult[0]?.embedding;
  const corrEmbed = corrEmbedResult.embedding || corrEmbedResult[0]?.embedding;

  // Compute overall similarity
  const similarity = cosineSimilarity(origEmbed, corrEmbed);
  const errorRate = (1 - similarity) * 100;
  let rating: GrammarAnalysis["rating"] = "Excellent";
  if (errorRate > 5) rating = "Needs Improvement";
  else if (errorRate > 2) rating = "Good";

  // Find specific examples by comparing sentences (no extra API calls)
  const origSentences = text.split(/[.!?]+/).filter(Boolean);
  const corrSentences = corrected.split(/[.!?]+/).filter(Boolean);
  const errors: Array<{
    type: string;
    original: string;
    suggestion: string;
    context: string;
  }> = [];
  for (let i = 0; i < origSentences.length; i++) {
    const orig = origSentences[i].trim();
    // Find the most similar corrected sentence (string similarity)
    let bestMatch = "";
    let bestScore = 0;
    for (const corr of corrSentences) {
      // Simple Jaccard similarity for strings
      const setA = new Set(orig.split(/\s+/));
      const setB = new Set(corr.split(/\s+/));
      const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)));
      const union = new Set([...Array.from(setA), ...Array.from(setB)]);
      const score = Array.from(intersection).length / Array.from(union).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = corr;
      }
    }
    if (bestScore < 0.8 && orig !== bestMatch) {
      errors.push({
        type: "grammar",
        original: orig,
        suggestion: bestMatch,
        context: `Jaccard similarity: ${(bestScore * 100).toFixed(1)}%`,
      });
    }
  }

  return {
    errorRate,
    totalErrors: errors.length,
    errors,
    rating,
  };
}

async function analyzeSentenceComplexity(
  text: string
): Promise<SentenceComplexityAnalysis> {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const candidateLabels = ["simple", "compound", "complex", "compound-complex"];
  const complexityResults = await Promise.all(
    sentences.map((sentence) =>
      makeApiRequest("sentenceComplexity", sentence, {
        candidate_labels: candidateLabels,
      })
    )
  );
  const analysis: SentenceComplexityAnalysis = {
    simple: complexityResults.filter((r) => r.labels[0] === "simple").length,
    compound: complexityResults.filter((r) => r.labels[0] === "compound")
      .length,
    complex: complexityResults.filter((r) => r.labels[0] === "complex").length,
    compoundComplex: complexityResults.filter(
      (r) => r.labels[0] === "compound-complex"
    ).length,
    averageLength:
      sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) /
      sentences.length,
    complexityRatio: 0,
    rating: "Balanced",
  };
  analysis.complexityRatio = calculateComplexityRatio(analysis);
  analysis.rating = rateComplexity(analysis.complexityRatio);

  return analysis;
}

function analyzeRepetition(text: string): RepetitionAnalysis {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.toLowerCase().split(/\s+/);

  // Count word frequency
  const wordCount = new Map<string, { count: number; sentences: string[] }>();
  words.forEach((word: string) => {
    if (word.length < 4) return;
    const currentSentence =
      sentences.find((s: string) => s.toLowerCase().includes(word)) || "";

    if (!wordCount.has(word)) {
      wordCount.set(word, { count: 1, sentences: [currentSentence] });
    } else {
      const entry = wordCount.get(word)!;
      entry.count++;
      if (!entry.sentences.includes(currentSentence)) {
        entry.sentences.push(currentSentence);
      }
    }
  });

  const wordFrequency = Array.from(wordCount.entries())
    .filter(
      ([_, data]: [string, { count: number; sentences: string[] }]) =>
        data.count > 2
    )
    .map(([word, data]: [string, { count: number; sentences: string[] }]) => ({
      word,
      count: data.count,
      sentences: data.sentences,
    }));

  const uniqueWords = new Set(words).size;
  const repetitionScore = uniqueWords / words.length;

  return {
    wordFrequency,
    phraseRepetition: [], // TODO: Implement phrase repetition detection
    repetitionScore,
    rating:
      repetitionScore > 0.7
        ? "Good"
        : repetitionScore > 0.5
          ? "Moderate"
          : "High",
  };
}

function generateFeedback(analysis: AnalysisResult): AnalysisFeedback {
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  const specificRecommendations: string[] = [];
  const practiceExercises: string[] = [];

  // Analyze fluency
  if (analysis.fluency.fillerWords.rating === "Ideal") {
    strengths.push("Excellent control of filler words");
  } else if (analysis.fluency.fillerWords.rating === "Acceptable") {
    strengths.push("Good control of filler words");
    specificRecommendations.push(
      `Consider reducing filler words further (currently ${analysis.fluency.fillerWords.perMinute.toFixed(1)} per minute)`
    );
  } else {
    areasForImprovement.push("High use of filler words");
    specificRecommendations.push(
      `Your response contains ${analysis.fluency.fillerWords.count} filler words (${analysis.fluency.fillerWords.perMinute.toFixed(1)} per minute). ` +
        `Common fillers used: ${analysis.fluency.fillerWords.examples.slice(0, 3).join(", ")}`
    );
  }

  if (analysis.fluency.speakingSpeed.rating === "Good") {
    strengths.push("Optimal speaking pace");
  } else {
    areasForImprovement.push(
      analysis.fluency.speakingSpeed.rating === "Too Slow"
        ? "Speaking pace is too slow"
        : "Speaking pace is too fast"
    );
    specificRecommendations.push(
      `Your speaking speed is ${analysis.fluency.speakingSpeed.wordsPerMinute.toFixed(0)} WPM. ` +
        `Aim for 120-150 WPM for optimal clarity. ` +
        `Try ${analysis.fluency.speakingSpeed.rating === "Too Slow" ? "speeding up" : "slowing down"} your delivery.`
    );
  }

  // Analyze keywords
  if (analysis.keywords.coverage >= 80) {
    strengths.push("Strong keyword coverage");
  } else if (analysis.keywords.coverage >= 50) {
    areasForImprovement.push("Moderate keyword coverage");
    specificRecommendations.push(
      `You covered ${analysis.keywords.coverage.toFixed(0)}% of required keywords. ` +
        `Consider incorporating: ${analysis.keywords.missed.slice(0, 3).join(", ")}`
    );
  } else {
    areasForImprovement.push("Low keyword coverage");
    specificRecommendations.push(
      `You only covered ${analysis.keywords.coverage.toFixed(0)}% of required keywords. ` +
        `Key terms to include: ${analysis.keywords.missed.join(", ")}`
    );
  }

  // Analyze grammar
  if (analysis.grammar.rating === "Excellent") {
    strengths.push("Strong grammatical accuracy");
  } else {
    areasForImprovement.push("Improve grammatical accuracy");
    const errorTypes = new Set(analysis.grammar.errors.map((e) => e.type));
    specificRecommendations.push(
      `Your grammar error rate is ${analysis.grammar.errorRate.toFixed(1)}%. ` +
        `Common error types: ${Array.from(errorTypes).join(", ")}. ` +
        `Aim for less than 2% for excellent performance.`
    );
  }

  // Analyze sentence complexity
  if (analysis.sentenceComplexity.rating === "Balanced") {
    strengths.push("Good balance of sentence complexity");
  } else {
    areasForImprovement.push("Adjust sentence complexity");
    const complexityBreakdown = [
      `Simple: ${analysis.sentenceComplexity.simple}`,
      `Compound: ${analysis.sentenceComplexity.compound}`,
      `Complex: ${analysis.sentenceComplexity.complex}`,
      `Compound-Complex: ${analysis.sentenceComplexity.compoundComplex}`,
    ].join(", ");

    specificRecommendations.push(
      `Your response is ${analysis.sentenceComplexity.rating.toLowerCase()}. ` +
        `Current breakdown: ${complexityBreakdown}. ` +
        `Try to maintain a balance between simple and complex sentences.`
    );
  }

  // Analyze repetition
  if (analysis.repetition.rating === "Good") {
    strengths.push("Good vocabulary variety");
  } else {
    areasForImprovement.push("Reduce word repetition");
    const repeatedWords = analysis.repetition.wordFrequency
      .slice(0, 3)
      .map((w) => `${w.word} (${w.count} times)`)
      .join(", ");

    specificRecommendations.push(
      `You have a repetition score of ${(analysis.repetition.repetitionScore * 100).toFixed(0)}%. ` +
        `Most repeated words: ${repeatedWords}. ` +
        `Consider using synonyms or alternative phrasing.`
    );
  }

  // Generate practice exercises based on areas for improvement
  if (analysis.fluency.fillerWords.rating !== "Ideal") {
    practiceExercises.push(
      "Practice speaking without filler words for 1 minute. Record yourself and count the fillers used."
    );
  }
  if (analysis.fluency.speakingSpeed.rating !== "Good") {
    practiceExercises.push(
      `Practice speaking at ${analysis.fluency.speakingSpeed.rating === "Too Slow" ? "120" : "150"} WPM. ` +
        "Use a metronome app to maintain consistent pace."
    );
  }
  if (analysis.grammar.rating !== "Excellent") {
    practiceExercises.push(
      "Review and correct the grammatical errors in your response. Focus on the most common error types."
    );
  }
  if (analysis.sentenceComplexity.rating !== "Balanced") {
    practiceExercises.push(
      "Practice restructuring your sentences to achieve a better balance of complexity."
    );
  }
  if (analysis.repetition.rating !== "Good") {
    practiceExercises.push(
      "Practice expressing the same ideas using different words and phrases."
    );
  }

  return {
    strengths,
    areasForImprovement,
    specificRecommendations,
    practiceExercises,
  };
}

async function safeExecute<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { data: null, error: errorMessage };
  }
}

export async function POST(request: Request) {
  try {
    const {
      transcription,
      audio,
      prompt,
      requiredKeywords = ["recursion", "binary search", "time complexity"],
    } = await request.json();
    const audioBuffer = new Uint8Array(Buffer.from(audio, "base64")).buffer;

    // Run all analyses in parallel with error handling
    const grammarResult = { data: null, error: null };
    const fluencyResult = { data: null, error: null };
    const [
      // fluencyResult,
      keywordResult,
      // grammarResult,
      complexityResult,
      repetitionResult,
    ] = await Promise.all([
      // safeExecute(
      //   () => analyzeFluency(transcription, audioBuffer),
      //   "Fluency analysis failed"
      // ),
      safeExecute(
        () => analyzeKeywords(transcription, requiredKeywords),
        "Keyword analysis failed"
      ),
      // safeExecute(
      //   () => analyzeGrammar(transcription),
      //   "Grammar analysis failed"
      // ),
      safeExecute(
        () => analyzeSentenceComplexity(transcription),
        "Sentence complexity analysis failed"
      ),
      safeExecute(
        () => Promise.resolve(analyzeRepetition(transcription)),
        "Repetition analysis failed"
      ),
    ]);

    const analysisResult: AnalysisResult = {
      fluency: fluencyResult.data ?? {
        fillerWords: { count: 0, perMinute: 0, rating: "Risk", examples: [] },
        speakingSpeed: { wordsPerMinute: 0, rating: "Too Slow", segments: [] },
      },
      keywords: keywordResult.data ?? {
        matched: [],
        missed: requiredKeywords,
        score: 0,
        coverage: 0,
      },
      grammar: grammarResult.data ?? {
        errorRate: 0,
        totalErrors: 0,
        errors: [],
        rating: "Needs Improvement",
      },
      sentenceComplexity: complexityResult.data ?? {
        simple: 0,
        compound: 0,
        complex: 0,
        compoundComplex: 0,
        averageLength: 0,
        complexityRatio: 0,
        rating: "Too Simple",
      },
      repetition: repetitionResult.data ?? {
        wordFrequency: [],
        phraseRepetition: [],
        repetitionScore: 0,
        rating: "High",
      },
      feedback: {
        strengths: [],
        areasForImprovement: [],
        specificRecommendations: [],
        practiceExercises: [],
      },
    };

    // Generate feedback based on the analysis results
    analysisResult.feedback = generateFeedback(analysisResult);

    return NextResponse.json(analysisResult);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyse response" },
      { status: 500 }
    );
  }
}
