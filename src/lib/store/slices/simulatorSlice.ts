import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "@/lib/store";
import { AnalysisResult } from "@/lib/types/analysis";
import { endpoints } from "@/utils/endpoints";

export type TabValue = "prompt" | "recording" | "playback" | "analysis";

type Prompt = {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  duration: number;
};

export interface SimulatorState {
  currentTab: TabValue;
  prompt: Prompt | null;
  videoUrl: string | null;
  transcription: string | null;
  analysis: AnalysisResult | null;
  isTranscribing: boolean;
  isAnalysing: boolean;
  error: string | null;
}

const initialState: SimulatorState = {
  currentTab: "prompt",
  prompt: null,
  videoUrl: null,
  transcription: null,
  analysis: null,
  isTranscribing: false,
  isAnalysing: false,
  error: null,
};

export const processRecording = createAsyncThunk(
  "simulator/processRecording",
  async (
    {
      interviewId,
      videoBlob,
      audioBlob,
      prompt,
    }: {
      interviewId: string;
      videoBlob: Blob;
      audioBlob: Blob;
      prompt: string;
    },
    { dispatch, getState }
  ) => {
    // Get current state
    const state = getState() as RootState;

    console.log("processing recording...");

    // Early exit if already processing
    if (state.simulator.isTranscribing || state.simulator.isAnalysing) {
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
      formData.append("prompt", prompt);
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

      // Convert audioBlob to base64
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(",")[1]); // Remove the data URL prefix
        };
        reader.readAsDataURL(audioBlob);
      });

      const payload = {
        transcription,
        duration_seconds: 120,
        required_keywords: ["rosemary", "projects"],
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
  },
});

export const {
  setCurrentTab,
  setPrompt,
  setVideoUrl,
  setTranscription,
  setAnalysis,
  setTranscribing,
  setAnalysing,
  setError,
  resetSimulator,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;
