"use client";

import { QuestionRow } from "@/components/questions/question-row";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PromptWithLastAttempt } from "@/utils/api/prompts";
import { useGetUser } from "@/utils/api/user";

interface QuestionTableProps {
  questions: PromptWithLastAttempt[];
  expandedRows: string | undefined;
  onToggleRow: (index: number) => void;
  isLoading: boolean;
  error: Error | null;
}

export function QuestionTable({
  questions,
  expandedRows,
  onToggleRow,
  isLoading,
  error,
}: QuestionTableProps) {
  const { isProUser } = useGetUser();
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            {isProUser && (
              <TableHead className="text-muted-foreground font-semibold w-12" />
            )}
            <TableHead className="text-muted-foreground font-semibold">
              Question
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold w-24">
              Difficulty
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold w-32">
              Industry
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold w-24">
              Duration
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold w-32">
              Last Attempt
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold w-32">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <QuestionRow
              key={question.id}
              question={question}
              isExpanded={expandedRows === index.toString()}
              onToggle={() => onToggleRow(index)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
