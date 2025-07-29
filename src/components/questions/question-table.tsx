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
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-800/50">
            <TableHead className="text-gray-300 font-semibold w-12" />
            <TableHead className="text-gray-300 font-semibold">
              Question
            </TableHead>
            <TableHead className="text-gray-300 font-semibold w-24">
              Difficulty
            </TableHead>
            <TableHead className="text-gray-300 font-semibold w-32">
              Category
            </TableHead>
            <TableHead className="text-gray-300 font-semibold w-24">
              Duration
            </TableHead>
            <TableHead className="text-gray-300 font-semibold w-32">
              Last Attempt
            </TableHead>
            <TableHead className="text-gray-300 font-semibold w-32">
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
