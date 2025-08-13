import { configureStore } from "@reduxjs/toolkit";
import simulatorReducer from "./slices/simulatorSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    simulator: simulatorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "simulator/setVideoBlob",
          "simulator/processRecording/pending",
          "simulator/processRecording/fulfilled",
          "simulator/processRecording/rejected"
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.videoBlob", "meta.arg.videoBlob", "meta.arg.audioBlob"],
        // Ignore these paths in the state
        ignoredPaths: ["simulator.videoBlob"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
