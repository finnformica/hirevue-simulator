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

  const itemsPerPage = 10; // Show 10 items per page

  // Fetch data from server with pagination
  const {
    prompts: questions,
    pagination,
    isLoading,
    error,
  } = usePrompts({
    page: currentPage,
    limit: itemsPerPage, // Request 10 items per page
    search: searchQuery,
    category: categoryFilter === "all" ? "" : categoryFilter,
    difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.clear();
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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
        questions={questions}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
      />

      {/* Pagination Component */}
      <QuestionPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
