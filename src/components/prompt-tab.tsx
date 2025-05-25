import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PromptTabProps {
  onStart: () => void;
}

export function PromptTab({ onStart }: PromptTabProps) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Interview Prompt</h2>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Question</h3>
        <p className="text-lg mb-6">
          Tell me about a time when you demonstrated leadership in a challenging
          situation. What was the situation, what actions did you take, and what
          was the outcome?
        </p>

        <div className="space-y-2">
          <h4 className="font-medium">Tips:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Use the STAR method (Situation, Task, Action, Result)</li>
            <li>Be specific about your role and contributions</li>
            <li>Quantify results when possible</li>
            <li>Keep your response focused and concise</li>
          </ul>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onStart} size="lg">
          Start Recording
        </Button>
      </div>
    </div>
  );
}
