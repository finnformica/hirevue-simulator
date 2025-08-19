import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "@/lib/store";
import { AnalysisResponse } from "@/lib/types/analysis";
import { endpoints } from "@/utils/endpoints";

export type TabValue = "prompt" | "recording" | "playback" | "analysis";

type Prompt = {
  id: string;
  question: string;
  difficulty: string;
  industry: string;
  type: string | null;
  role_level: string;
  duration: number;
  key_competencies: string[];
  relevant_keywords: string[];
};

export interface SimulatorState {
  currentTab: TabValue;
  prompt: Prompt | null;
  videoUrl: string | null;
  transcription: string | null;
  analysis: AnalysisResponse | null;
  openaiAnalysis: string | null;
  isTranscribing: boolean;
  isAnalysing: boolean;
  error: string | null;
  // Review state
  reviewData: {
    interview: any;
    analysis: any;
    transcription: any;
    prompt: any;
  } | null;
}

const initialState: SimulatorState = {
  currentTab: "prompt",
  prompt: null,
  videoUrl: null,
  transcription: null,
  analysis: null,
  openaiAnalysis: null,
  isTranscribing: false,
  isAnalysing: false,
  error: null,
  reviewData: null,
};

export const processRecording = createAsyncThunk(
  "simulator/processRecording",
  async (
    {
      interviewId,
      videoBlob,
      audioBlob,
    }: {
      interviewId: string;
      videoBlob: Blob;
      audioBlob: Blob;
    },
    { dispatch, getState }
  ) => {
    // Get current state
    const state = getState() as RootState;

    // Early exit if already processing
    if (state.simulator.isTranscribing || state.simulator.isAnalysing) {
      return;
    }

    // Early exit if already processed
    if (state.simulator.transcription && state.simulator.analysis) {
      return;
    }

    try {
      // Create videoUrl from videoBlob
      const videoUrl = URL.createObjectURL(videoBlob);
      dispatch(setVideoUrl(videoUrl));

      // Get transcription from the audio using FormData
      dispatch(setTranscribing(true));
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("interviewId", interviewId);

      const transcriptionResponse = await fetch(endpoints.transcribe, {
        method: "POST",
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { text } = await transcriptionResponse.json();
      const transcription = text.trim();
      dispatch(setTranscription(transcription));
      dispatch(setTranscribing(false));

      // Analyse the response
      dispatch(setAnalysing(true));

      // Get the current prompt data from state
      const { prompt } = state.simulator;
      if (!prompt) throw new Error("No prompt found");

      const payload = {
        interviewId,
        transcription,
        duration_seconds: prompt.duration, // TODO: calculate duration from audio wav file
        prompt: prompt.question,
        questionType: prompt.type ?? 'general',
        roleLevel: prompt.role_level,
        industry: prompt.industry,
        interviewStage: "Screening",
        keyCompetencies: prompt.key_competencies,
        relevantKeywords: prompt.relevant_keywords,
        expectedLength: prompt.duration,
      };

      const analysisResponse = await fetch(endpoints.analyse, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!analysisResponse.ok) {
        throw new Error("Analysis failed");
      }

      const analysis = await analysisResponse.json();
      dispatch(setAnalysis(analysis));

      return { transcription, analysis };
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setTranscribing(false));
      dispatch(setAnalysing(false));
    }
  }
);

const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    resetSimulatorState: () => {
      return initialState;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    setPrompt: (state, action) => {
      state.prompt = action.payload;
    },
    setVideoUrl: (state, action) => {
      state.videoUrl = action.payload;
    },
    setTranscription: (state, action) => {
      state.transcription = action.payload;
    },
    setAnalysis: (state, action) => {
      state.analysis = action.payload;
    },
    setTranscribing: (state, action) => {
      state.isTranscribing = action.payload;
    },
    setAnalysing: (state, action) => {
      state.isAnalysing = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetSimulator: (state) => {
      return initialState;
    },
    // Review actions
    setReviewData: (state, action) => {
      state.reviewData = action.payload;
    },
    resetReview: (state) => {
      state.reviewData = null;
    },
  },
});

export const {
  resetSimulatorState,
  setCurrentTab,
  setPrompt,
  setVideoUrl,
  setTranscription,
  setAnalysis,
  setTranscribing,
  setAnalysing,
  setError,
  resetSimulator,
  // Review actions
  setReviewData,
  resetReview,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;
