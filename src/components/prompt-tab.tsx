import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCurrentTab, setPrompt } from "@/lib/store/slices/simulatorSlice";

export function PromptTab() {
  const dispatch = useAppDispatch();

  const prompt = {
    id: "63545bce-d8ce-4f09-a9f1-d73611c2107a",
    question:
      "Please describe a challenging project you worked on during your studies or internship, and explain how you overcame any obstacles and what you learned from the experience.",
    category: "general",
    difficulty: "easy",
    duration: 120,
  };

  const handleStart = () => {
    dispatch(setPrompt(prompt));
    dispatch(setCurrentTab("recording"));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{prompt.question}</p>
        </CardContent>
      </Card>
      <Button onClick={handleStart}>
        <Video className="w-4 h-4 mr-2" /> Start Recording
      </Button>
    </div>
  );
}
