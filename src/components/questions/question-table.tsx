"use client";

import { QuestionRow } from "@/components/questions/question-row";
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
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
}

export function QuestionTable({
  questions,
  expandedRows,
  onToggleRow,
}: QuestionTableProps) {
  const { isProUser } = useGetUser();
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
              Category
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
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              isExpanded={expandedRows.has(question.id)}
              onToggle={onToggleRow}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
