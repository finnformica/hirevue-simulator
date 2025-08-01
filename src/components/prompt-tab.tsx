import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentTab } from "@/lib/store/slices/simulatorSlice";
import { paths } from "@/utils/paths";

export function PromptTab() {
  const dispatch = useAppDispatch();
  const { prompt } = useAppSelector((state) => state.simulator);

  const handleStart = () => {
    dispatch(setCurrentTab("recording"));
  };

  if (!prompt) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your question...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Link href={paths.questions}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Interview Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">{prompt.question}</p>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-4">
        <Link href={paths.questions}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </Button>
        </Link>
        <Button onClick={handleStart}>
          <Video className="w-4 h-4 mr-2" /> Start Recording
        </Button>
      </div>
    </div>
  );
}
