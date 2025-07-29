"use client";

import { useState } from "react";

import { QuestionFilters } from "@/components/questions/question-filters";
import { QuestionPagination } from "@/components/questions/question-pagination";
import { QuestionTable } from "@/components/questions/question-table";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/utils/api/prompts";

export default function PracticeQuestionsPage() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data in the parent component
  const { prompts: questions, isLoading, error } = usePrompts();

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      // Close other expanded rows and open this one
      newExpanded.clear();
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || question.difficulty === difficultyFilter;
    const matchesCategory =
      categoryFilter === "all" || question.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Paginate filtered questions
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading questions...</p>
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
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <h1 className="text-3xl font-semibold mb-8">
        Practice Interview Questions
      </h1>

      {/* Filters Component */}
      <QuestionFilters
        searchQuery={searchQuery}
        difficultyFilter={difficultyFilter}
        categoryFilter={categoryFilter}
        onSearchChange={handleSearchChange}
        onDifficultyChange={handleDifficultyChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Table Component */}
      <QuestionTable
        questions={paginatedQuestions}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
      />

      {/* Pagination Component */}
      <QuestionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
