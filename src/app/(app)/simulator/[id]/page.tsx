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
  setPrompt,
} from "@/lib/store/slices/simulatorSlice";
import { usePrompt } from "@/utils/api/prompts";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function SimulatorPage() {
  const dispatch = useAppDispatch();
  const { currentTab, prompt } = useAppSelector((state) => state.simulator);
  const params = useParams();
  const promptId = params.id as string;

  // Use the reusable hook to fetch prompt data
  const { prompt: promptData } = usePrompt(promptId);

  // Update Redux state when prompt data is loaded
  useEffect(() => {
    if (promptData && !prompt) {
      dispatch(setPrompt(promptData));
      dispatch(setCurrentTab("prompt"));
    }
  }, [promptData, prompt, dispatch]);

  const tabs = [
    {
      label: "Question",
      value: "prompt",
      render: () => <PromptTab />,
    },
    {
      label: "Recording",
      value: "recording",
      render: () => <RecordingTab />,
    },
    {
      label: "Playback",
      value: "playback",
      render: () => <PlaybackTab />,
    },
    {
      label: "Analysis",
      value: "analysis",
      render: () => <AnalysisTab />,
    },
  ];

  useEffect(() => {
    return () => {
      dispatch(resetSimulator());
    };
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Hirevue Simulator</h1>
      <Tabs
        value={currentTab}
        onValueChange={(value) => dispatch(setCurrentTab(value))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} disabled>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.render()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
