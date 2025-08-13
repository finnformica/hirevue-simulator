"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryState } from "nuqs";

import { QuestionFilters } from "@/components/questions/question-filters";
import { QuestionPagination } from "@/components/questions/question-pagination";
import { QuestionTable } from "@/components/questions/question-table";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/utils/api/prompts";

export default function PracticeQuestionsPage() {
  // Local state for immediate input updates (prevents re-renders)
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // URL search params (debounced)
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    parse: (value) => value,
    serialize: (value) => value,
    throttleMs: 500,
  });

  const [difficultyFilter, setDifficultyFilter] = useQueryState("difficulty", {
    defaultValue: "all",
    parse: (value) => value,
    serialize: (value) => value,
    throttleMs: 500,
  });

  const [categoryFilter, setCategoryFilter] = useQueryState("category", {
    defaultValue: "all",
    parse: (value) => value,
    serialize: (value) => value,
    throttleMs: 500,
  });

  const [currentPage, setCurrentPage] = useQueryState("page", {
    defaultValue: "1",
    parse: (value) => value,
    serialize: (value) => value,
    throttleMs: 500,
  });

  // Keep expanded rows as local state since it's UI-specific
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const itemsPerPage = 10; // Show 10 items per page

  // Initialize local search query from URL on mount
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);

  // Debounced effect to update URL search param
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
        setCurrentPage("1"); // Reset to first page when search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery, setCurrentPage]);

  // Fetch data from server with pagination
  const {
    prompts: questions,
    pagination,
    isLoading,
    error,
  } = usePrompts({
    page: parseInt(currentPage, 10),
    limit: itemsPerPage,
    search: searchQuery,
    category: categoryFilter === "all" ? "" : categoryFilter,
    difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
    debounceMs: 500, // Debounce API calls by 500ms
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
    setCurrentPage(page.toString());
  };

  // Handle search changes (immediate local update)
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    setCurrentPage("1"); // Reset to first page when filtering
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage("1"); // Reset to first page when filtering
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
        searchQuery={localSearchQuery} // Use local state for immediate UI updates
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
