"use client";

import { AnalysisTab } from "@/components/analysis-tab";
import PlaybackTab from "@/components/playback-tab";
import { PromptTab } from "@/components/prompt-tab";
import { RecordingTab } from "@/components/recording-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetSimulator,
  setCurrentTab,
} from "@/lib/store/slices/simulatorSlice";
import { useEffect } from "react";

export default function SimulatorPage() {
  const dispatch = useAppDispatch();
  const { prompt, currentTab } = useAppSelector((state) => state.simulator);

  useEffect(() => {
    return () => {
      dispatch(resetSimulator());
    };
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <Tabs
        value={currentTab}
        onValueChange={(value) => dispatch(setCurrentTab(value))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="recording" disabled={!prompt}>
            Recording
          </TabsTrigger>
          <TabsTrigger value="playback" disabled={!prompt}>
            Playback
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!prompt}>
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt">
          <PromptTab />
        </TabsContent>

        <TabsContent value="recording">
          <RecordingTab />
        </TabsContent>

        <TabsContent value="playback">
          <PlaybackTab />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
