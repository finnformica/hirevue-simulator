"use client";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetSimulatorState } from "@/lib/store/slices/simulatorSlice";
import { AnalysisGrade, InterviewAttempt } from "@/lib/types/schemas";
import { useInterviewAttempts } from "@/utils/api/interview";
import { PromptWithLastAttempt } from "@/utils/api/prompts";
import { useGetUser } from "@/utils/api/user";
import { paths } from "@/utils/paths";

const difficultyColors = {
  easy: "bg-brand/10 text-brand border-brand/20",
  medium:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

// Helper function to get color classes based on result
function getResultColorClasses(result: AnalysisGrade | null): string {
  switch (result) {
    case "Excellent":
    case "Good":
      return "bg-brand/10 text-brand border-brand/20";
    case "Average":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "Poor":
    case "Failed":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

// Helper function to get text color classes based on result
function getResultTextColorClasses(result: AnalysisGrade | null): string {
  switch (result) {
    case "Excellent":
    case "Good":
      return "text-brand";
    case "Average":
      return "text-amber-600 dark:text-amber-400";
    case "Poor":
    case "Failed":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

interface QuestionRowProps {
  question: PromptWithLastAttempt;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function QuestionRow({
  question,
  isExpanded,
  onToggle,
}: QuestionRowProps) {
  const [displayedCount, setDisplayedCount] = useState(5);
  const router = useRouter();
  const { isProUser } = useGetUser();
  const dispatch = useAppDispatch();
  // Fetch attempts only when expanded, with increasing page size
  const { attempts, totalCount, isLoading } = useInterviewAttempts(
    isExpanded ? question.id : null,
    displayedCount
  );

  const handleToggle = () => {
    onToggle(question.id);
    // Reset state when expanding
    if (!isExpanded) {
      setDisplayedCount(5);
    }
  };

  const handleShowMore = async () => {
    setDisplayedCount((prev) => prev + 5);
  };

  const handleHide = () => {
    setDisplayedCount(5);
  };

  const handlePracticeClick = () => {
    dispatch(resetSimulatorState());
    // Navigate to the dynamic simulator route with the prompt ID
    router.push(`/simulator/${question.id}`);
  };

  const handleReviewClick = (attemptId: string) => {
    // Navigate to the review page with the interview ID
    router.push(paths.review(attemptId));
  };

  const hasMoreAttempts = displayedCount < totalCount;
  const hasLoadedMoreThan5 = displayedCount > 5;
  const displayedAttempts = attempts.slice(0, displayedCount);

  return (
    <>
      <TableRow className="border-border hover:bg-muted/30">
        {isProUser && (
          <TableCell className="w-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </TableCell>
        )}
        <TableCell className="text-foreground max-w-0">
          <div className="line-clamp-4 sm:line-clamp-3 md:line-clamp-3 lg:line-clamp-2 overflow-hidden text-ellipsis">
            {question.question}
          </div>
        </TableCell>
        <TableCell className="w-24">
          <Badge
            variant="outline"
            className={`${difficultyColors[question.difficulty]} capitalize`}
          >
            {question.difficulty}
          </Badge>
        </TableCell>
        <TableCell className="w-32 text-muted-foreground capitalize">
          {question.category}
        </TableCell>
        <TableCell className="w-24 text-muted-foreground">
          {question.duration / 60} min
        </TableCell>
        <TableCell className="w-32 text-muted-foreground">
          {question.lastAttempt ? (
            <div className="text-sm">
              <div>{question.lastAttempt.date}</div>
              <div
                className={`text-xs ${getResultTextColorClasses(
                  question.lastAttempt.grade
                )}`}
              >
                {question.lastAttempt.grade ?? "Analysis not available"}
              </div>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
            >
              New
            </Badge>
          )}
        </TableCell>
        <TableCell className="w-32">
          <Button
            className="bg-brand hover:bg-brand/90 text-white dark:text-black"
            onClick={handlePracticeClick}
          >
            Practice
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="border-border bg-muted/30">
          <TableCell colSpan={7} className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Full Question:
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {question.question}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  Past Attempts ({totalCount} total):
                </h4>
                {attempts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {displayedAttempts.map((attempt: InterviewAttempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between bg-muted p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {attempt.date}
                            </span>
                            <Badge
                              variant="outline"
                              className={getResultColorClasses(attempt.grade)}
                            >
                              {attempt.grade ?? "Analysis not available"}
                            </Badge>
                          </div>
                          <Button
                            disabled={!isProUser}
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-muted/90 hover:border-muted-foreground"
                            onClick={() => handleReviewClick(attempt.id)}
                          >
                            Review Attempt
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2 pt-2">
                      {/* Show More Button */}
                      {hasMoreAttempts && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShowMore}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show More
                            </>
                          )}
                        </Button>
                      )}

                      {/* Hide Button */}
                      {hasLoadedMoreThan5 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleHide}
                          className="border-border text-foreground hover:bg-muted flex items-center gap-2"
                        >
                          <ChevronUp className="w-4 h-4" />
                          Hide
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No attempts yet. Start practicing!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
