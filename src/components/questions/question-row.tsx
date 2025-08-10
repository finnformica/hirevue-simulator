"use client";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { AnalysisGrade, InterviewAttempt } from "@/lib/types/schemas";
import { useInterviewAttempts } from "@/utils/api/interview";
import { PromptWithLastAttempt } from "@/utils/api/prompts";
import { useGetUser } from "@/utils/api/user";
import { paths } from "@/utils/paths";

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Helper function to get color classes based on result
function getResultColorClasses(result: AnalysisGrade | null): string {
  switch (result) {
    case "Excellent":
    case "Good":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Average":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Poor":
    case "Failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

// Helper function to get text color classes based on result
function getResultTextColorClasses(result: AnalysisGrade | null): string {
  switch (result) {
    case "Excellent":
    case "Good":
      return "text-green-400";
    case "Average":
      return "text-yellow-400";
    case "Poor":
    case "Failed":
      return "text-red-400";
    default:
      return "text-gray-400";
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
      <TableRow className="border-gray-800 hover:bg-gray-800/30">
        {isProUser && (
          <TableCell className="w-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="p-1 h-6 w-6 text-gray-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </TableCell>
        )}
        <TableCell className="text-gray-200 max-w-0">
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
        <TableCell className="w-32 text-gray-300 capitalize">
          {question.category}
        </TableCell>
        <TableCell className="w-24 text-gray-300">
          {question.duration / 60} min
        </TableCell>
        <TableCell className="w-32 text-gray-300">
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
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handlePracticeClick}
          >
            Practice
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="border-gray-800 bg-gray-800/30">
          <TableCell colSpan={7} className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Full Question:
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {question.question}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">
                  Past Attempts ({totalCount} total):
                </h4>
                {attempts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {displayedAttempts.map((attempt: InterviewAttempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between bg-gray-900 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-300">
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
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
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
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
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
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent flex items-center gap-2"
                        >
                          <ChevronUp className="w-4 h-4" />
                          Hide
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
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
