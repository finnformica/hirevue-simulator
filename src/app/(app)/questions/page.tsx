"use client";

import { useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { debounce } from "lodash";

import { QuestionFilters } from "@/components/questions/question-filters";
import { QuestionPagination } from "@/components/questions/question-pagination";
import { QuestionTable } from "@/components/questions/question-table";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/utils/api/prompts";

export default function PracticeQuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current values from URL search params
  const searchQuery = searchParams.get("search") || "";
  const difficultyFilter = searchParams.get("difficulty") || "all";
  const categoryFilter = searchParams.get("category") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Keep expanded rows as local state since it's UI-specific
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const itemsPerPage = 10; // Show 10 items per page

  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
  
    Object.entries(updates).forEach(([key, value]) => {
      value && value !== "all" 
        ? params.set(key, value) 
        : params.delete(key);
    });
  
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Create debounced search function using Lodash
  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      updateSearchParams({ search: value, page: "1" });
    }, 500)
  );

  // Search handler with Lodash debouncing
  const handleSearchChange = useCallback((value: string) => {
    debouncedSearchRef.current(value);
  }, []);

  // Fetch data from server with pagination
  const {
    prompts: questions,
    pagination,
    isLoading,
    error,
  } = usePrompts({
    page: currentPage,
    limit: itemsPerPage,
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
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page.toString() });
    },
    [updateSearchParams]
  );

  const handleDifficultyChange = useCallback(
    (value: string) => {
      updateSearchParams({ difficulty: value, page: "1" });
    },
    [updateSearchParams]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateSearchParams({ category: value, page: "1" });
    },
    [updateSearchParams]
  );

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
