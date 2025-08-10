"use client";

import _ from "lodash";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionFiltersProps {
  searchQuery: string;
  difficultyFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const categories = ["basic", "general", "finance", "consulting", "software"];
const difficulties = ["easy", "medium", "hard"];

export function QuestionFilters({
  searchQuery,
  difficultyFilter,
  categoryFilter,
  onSearchChange,
  onDifficultyChange,
  onCategoryChange,
}: QuestionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-full sm:w-40 bg-gray-900 border-gray-700 text-white">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          <SelectItem value="all">All Difficulties</SelectItem>
          {difficulties.map((difficulty) => (
            <SelectItem key={difficulty} value={difficulty}>
              {_.startCase(difficulty)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-40 bg-gray-900 border-gray-700 text-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {_.startCase(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
