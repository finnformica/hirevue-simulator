"use client";

import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { QuestionFilters } from "@/components/questions/question-filters";
import { QuestionPagination } from "@/components/questions/question-pagination";
import { QuestionTable } from "@/components/questions/question-table";
import { usePrompts } from "@/utils/api/prompts";

export default function PracticeQuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current values from URL search params
  const searchQuery = searchParams.get("search") ?? "";
  const difficultyFilter = searchParams.get("difficulty") ?? "all";
  const categoryFilter = searchParams.get("category") ?? "all";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const expandedRows = searchParams.get("expanded") ?? undefined;

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries({ expanded: undefined, ...updates }).forEach(
        ([key, value]) => {
          value && value !== "all"
            ? params.set(key, value)
            : params.delete(key);
        }
      );

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Search handler with Lodash debouncing
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      updateSearchParams({ search: value, page: undefined });
    }, 250),
    [updateSearchParams]
  );

  // Fetch data from server with pagination
  const {
    prompts: questions,
    pagination,
    isLoading,
    error,
  } = usePrompts({
    page: currentPage,
    search: searchQuery,
    category: categoryFilter === "all" ? "" : categoryFilter,
    difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
  });

  const toggleRow = useCallback(
    (index: number) => {
      if (expandedRows === index.toString()) {
        updateSearchParams({ expanded: undefined });
      } else {
        updateSearchParams({ expanded: index.toString() });
      }
    },
    [updateSearchParams]
  );

  // Handle page changes
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page.toString() });
    },
    [updateSearchParams]
  );

  const handleDifficultyChange = useCallback(
    (value: string) => {
      updateSearchParams({ difficulty: value, page: undefined });
    },
    [updateSearchParams]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateSearchParams({ category: value, page: undefined });
    },
    [updateSearchParams]
  );

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
        isLoading={isLoading}
        error={error}
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
