import { supabaseApi } from "@/utils/supabase/api";
import { NextResponse } from "next/server";

// API Configuration
const API_CONFIG = {
  baseUrl: "https://api-inference.huggingface.co/models",
  models: {
    technicalAccuracy: "facebook/bart-large-mnli",
    sentiment: "finiteautomata/bertweet-base-sentiment-analysis",
    clarity: "facebook/bart-large-mnli",
    grammar: "facebook/bart-large-mnli",
    keywords: "facebook/bart-large-mnli",
    keyPoints: "facebook/bart-large-mnli",
    improvements: "facebook/bart-large-mnli",
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
        inputs: inputs.text,
        parameters: {
          candidate_labels: inputs.candidate_labels || [],
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

// Models for different aspects of analysis
const MODELS = {
  sentiment: "finiteautomata/bertweet-base-sentiment-analysis",
  textClassification: "facebook/bart-large-mnli",
  summarization: "facebook/bart-large-cnn",
  speechRecognition: "facebook/wav2vec2-base-960h",
  grammar: "deepset/roberta-base-grammar",
  keywordExtraction: "facebook/bart-large-mnli",
};

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

interface AudioAnalysis {
  voiceModulation: number | null;
  pacing: number | null;
  fluency: number | null;
  fillerWordCount: number;
  fillerWords: string[];
}

interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  relevanceScore: number;
}

interface GrammarAnalysis {
  errorCount: number | null;
  errors: Array<{
    type: string;
    suggestion: string;
    context: string;
  }>;
  score: number | null;
}

interface SentenceComplexity {
  averageLength: number;
  complexityScore: number;
  complexSentences: number;
  simpleSentences: number;
}

interface RepetitionAnalysis {
  repeatedWords: Array<{
    word: string;
    count: number;
    sentences: string[];
  }>;
  repetitionScore: number;
}

interface CachedAnalysis {
  id: string;
  transcription: string;
  prompt: string;
  analysis: any;
  created_at: Date;
}

async function getCachedAnalysis(
  transcription: string,
  prompt: string
): Promise<CachedAnalysis | null> {
  try {
    const { data, error } = await supabaseApi
      .from("analysis_cache")
      .select("*")
      .eq("transcription", transcription)
      .eq("prompt", prompt)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching cached analysis:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching cached analysis:", error);
    return null;
  }
}

async function cacheAnalysis(
  analysis: any,
  transcription: string,
  prompt: string
): Promise<void> {
  try {
    const { error } = await supabaseApi.from("analysis_cache").insert({
      id: analysis.id,
      transcription,
      prompt,
      analysis,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error caching analysis:", error);
    }
  } catch (error) {
    console.error("Error caching analysis:", error);
  }
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

async function analyseSentiment(text: string, prompt: string) {
  const data = await makeApiRequest("sentiment", {
    text,
    candidate_labels: ["POS", "NEU", "NEG"],
  });

  const sentimentMap: { [key: string]: number } = {
    POS: 1,
    NEU: 0.5,
    NEG: 0,
  };

  return sentimentMap[data[0].label] || null;
}

async function analyseClarity(text: string, prompt: string) {
  const data = await makeApiRequest("clarity", {
    text,
    candidate_labels: [
      "clear and concise",
      "unclear and verbose",
      "moderately clear",
    ],
  });

  const clarityIndex = data.labels.indexOf("clear and concise");
  return data.scores[clarityIndex] || null;
}

async function analyseTechnicalAccuracy(text: string, prompt: string) {
  const data = await makeApiRequest("technicalAccuracy", {
    text,
    candidate_labels: [
      "technical accuracy",
      "clarity",
      "relevance",
      "completeness",
    ],
  });

  const technicalAccuracyIndex = data.labels.indexOf("technical accuracy");
  return data.scores[technicalAccuracyIndex] || null;
}

async function analyseAudio(
  audioBuffer: ArrayBuffer
): Promise<AudioAnalysis | null> {
  if (!audioBuffer) {
    console.error("Audio buffer is undefined");
    return null;
  }

  const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });

  // First, convert the audio to base64
  const audioBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(",")[1]);
    };
    reader.readAsDataURL(audioBlob);
  });

  // Use the Whisper API for transcription
  const transcriptionResponse = await fetch(
    `${API_CONFIG.baseUrl}/${MODELS.speechRecognition}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: audioBase64,
      }),
    }
  );

  if (!transcriptionResponse.ok) {
    console.error("Transcription failed:", await transcriptionResponse.text());
    return null;
  }

  const transcription = await transcriptionResponse.json();
  const text = transcription.text ?? "";

  // Analyse filler words
  const words = text.toLowerCase().split(/\s+/);
  const fillerWords = words.filter((word: string) => FILLER_WORDS.has(word));
  const fillerWordCount = fillerWords.length;
  const totalWords = words.length;
  const fluency = totalWords > 0 ? 1 - fillerWordCount / totalWords : null;

  const audioFeaturesResponse = await fetch(
    `${API_CONFIG.baseUrl}/microsoft/wavlm-base`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: audioBlob,
      }),
    }
  );

  if (!audioFeaturesResponse.ok) {
    throw new Error(
      `Audio features failed: ${audioFeaturesResponse.statusText}`
    );
  }

  const audioFeatures = await audioFeaturesResponse.json();

  return {
    voiceModulation: audioFeatures[0]?.score || null,
    pacing: audioFeatures[1]?.score
      ? Math.min(audioFeatures[1].score / 150, 1)
      : null,
    fluency,
    fillerWordCount,
    fillerWords: Array.from(new Set(fillerWords)),
  };
}

async function analyseKeywords(text: string, prompt: string) {
  const data = await makeApiRequest("keywords", {
    text,
    candidate_labels: [
      "technical terms",
      "domain-specific vocabulary",
      "key concepts",
      "important points",
    ],
  });

  const keywords = data.labels
    .filter((label: string, index: number) => data.scores[index] > 0.5)
    .map((label: string) => label.toLowerCase());

  return {
    matchedKeywords: keywords,
    missingKeywords: [],
    relevanceScore: Math.max(...data.scores) || null,
  };
}

async function analyseGrammar(text: string, prompt: string) {
  const data = await makeApiRequest("technicalAccuracy", {
    text,
    candidate_labels: [
      "grammatically correct",
      "grammatically incorrect",
      "partially correct",
    ],
  });

  const grammarIndex = data.labels.indexOf("grammatically correct");
  const score = data.scores[grammarIndex];

  return {
    errorCount: Math.round((1 - score) * 10),
    errors: [],
    score: score || null,
  };
}

function analyseSentenceComplexity(text: string): SentenceComplexity {
  try {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const words = text.split(/\s+/);

    const averageLength = words.length / sentences.length;

    // Define complex sentence criteria
    const complexSentences = sentences.filter((sentence) => {
      const words = sentence.split(/\s+/);
      return (
        words.length > 20 || // Long sentences
        /[;:]/.test(sentence) || // Contains semicolons or colons
        /(because|although|while|unless|despite|however)/i.test(sentence) // Complex conjunctions
      );
    }).length;

    const simpleSentences = sentences.length - complexSentences;
    const complexityScore = complexSentences / sentences.length;

    return {
      averageLength,
      complexityScore,
      complexSentences,
      simpleSentences,
    };
  } catch (error) {
    console.error("Error in sentence complexity analysis:", error);
    return {
      averageLength: 0,
      complexityScore: 0.5,
      complexSentences: 0,
      simpleSentences: 0,
    };
  }
}

function analyseRepetition(text: string): RepetitionAnalysis {
  try {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const words = text.toLowerCase().split(/\s+/);

    // Count word frequency
    const wordCount = new Map<string, { count: number; sentences: string[] }>();

    words.forEach((word: string) => {
      if (word.length < 4) return; // Ignore short words

      const currentSentence =
        sentences.find((s) => s.toLowerCase().includes(word)) || "";

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

    // Filter repeated words (appearing more than twice)
    const repeatedWords = Array.from(wordCount.entries())
      .filter(([_, data]) => data.count > 2)
      .map(([word, data]) => ({
        word,
        count: data.count,
        sentences: data.sentences,
      }));

    // Calculate repetition score (0-1, where 1 means no repetition)
    const uniqueWords = new Set(words).size;
    const repetitionScore = uniqueWords / words.length;

    return {
      repeatedWords,
      repetitionScore,
    };
  } catch (error) {
    console.error("Error in repetition analysis:", error);
    return {
      repeatedWords: [],
      repetitionScore: 0.5,
    };
  }
}

async function analyseKeyPoints(text: string, prompt: string) {
  const data = await makeApiRequest("keyPoints", {
    text,
    candidate_labels: [
      "main point",
      "supporting detail",
      "example",
      "conclusion",
    ],
  });

  return (
    data?.labels
      ?.filter((label: string, index: number) => data.scores[index] > 0.5)
      .map((label: string) => label) ?? null
  );
}

async function analyseImprovements(text: string, prompt: string) {
  const data = await makeApiRequest("improvements", {
    text,
    candidate_labels: [
      "clarity improvement",
      "technical depth",
      "structure",
      "examples",
    ],
  });

  return (
    data?.labels
      ?.filter((label: string, index: number) => data.scores[index] > 0.5)
      .map((label: string) => label) ?? null
  );
}

export async function POST(request: Request) {
  try {
    const { transcription, audio, prompt } = await request.json();

    // Check for cached analysis
    // const cachedAnalysis = await getCachedAnalysis(transcription, prompt);
    // if (cachedAnalysis) {
    //   return NextResponse.json(cachedAnalysis.analysis);
    // }

    // Convert audio from base64 to ArrayBuffer
    const audioBuffer = new Uint8Array(Buffer.from(audio, "base64")).buffer;

    // Run all analyses in parallel with error handling
    const [
      technicalAccuracyResult,
      sentimentScoreResult,
      clarityScoreResult,
      grammarAnalysisResult,
      keywordAnalysisResult,
      audioAnalysisResult,
      keyPointsResult,
      improvementsResult,
    ] = await Promise.all([
      safeExecute(
        () => analyseTechnicalAccuracy(transcription, prompt),
        "Technical accuracy analysis failed"
      ),
      safeExecute(
        () => analyseSentiment(transcription, prompt),
        "Sentiment analysis failed"
      ),
      safeExecute(
        () => analyseClarity(transcription, prompt),
        "Clarity analysis failed"
      ),
      safeExecute(
        () => analyseGrammar(transcription, prompt),
        "Grammar analysis failed"
      ),
      safeExecute(
        () => analyseKeywords(transcription, prompt),
        "Keyword analysis failed"
      ),
      safeExecute(() => analyseAudio(audioBuffer), "Audio analysis failed"),
      safeExecute(
        () => analyseKeyPoints(transcription, prompt),
        "Key points analysis failed"
      ),
      safeExecute(
        () => analyseImprovements(transcription, prompt),
        "Improvements analysis failed"
      ),
    ]);

    // Analyse sentence complexity and repetition (these are synchronous, so we don't need safeExecute)
    const sentenceComplexity = analyseSentenceComplexity(transcription);
    const repetition = analyseRepetition(transcription);

    const analysisResult = {
      id: Date.now().toString(),
      interviewId: "temp",
      transcription,
      prompt,
      sentimentScore: sentimentScoreResult.data,
      clarityScore: clarityScoreResult.data,
      technicalAccuracy: technicalAccuracyResult.data,
      confidenceMetrics: {
        voiceModulation: audioAnalysisResult.data?.voiceModulation ?? null,
        pacing: audioAnalysisResult.data?.pacing ?? null,
        vocabulary: null,
      },
      keyPoints: keyPointsResult.data,
      improvementAreas: improvementsResult.data,
      detailedAnalysis: {
        audio: audioAnalysisResult.data,
        keywords: keywordAnalysisResult.data,
        grammar: grammarAnalysisResult.data,
        sentenceComplexity,
        repetition,
      },
      errors: {
        technicalAccuracy: technicalAccuracyResult.error,
        sentimentScore: sentimentScoreResult.error,
        clarityScore: clarityScoreResult.error,
        grammarAnalysis: grammarAnalysisResult.error,
        keywordAnalysis: keywordAnalysisResult.error,
        audioAnalysis: audioAnalysisResult.error,
        keyPoints: keyPointsResult.error,
        improvements: improvementsResult.error,
      },
      createdAt: new Date(),
    };

    // Cache the analysis result
    // await cacheAnalysis(analysisResult, transcription, prompt);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyse response" },
      { status: 500 }
    );
  }
}
