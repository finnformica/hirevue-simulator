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
  industryFilter: string;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
}

const industries = ["basic", "general", "consulting"];
const difficulties = ["easy", "medium", "hard"];

export function QuestionFilters({
  searchQuery,
  difficultyFilter,
  industryFilter,
  onSearchChange,
  onDifficultyChange,
  onIndustryChange,
}: QuestionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search questions..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          defaultValue={searchQuery}
        />
      </div>

      <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          {difficulties.map((difficulty) => (
            <SelectItem key={difficulty} value={difficulty}>
              {_.startCase(difficulty)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={industryFilter} onValueChange={onIndustryChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Industries</SelectItem>
          {industries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {_.startCase(industry)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
