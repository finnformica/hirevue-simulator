export interface InterviewSchema {
  id: string; // uuid
  created_at: string; // ISO timestamp
  user_id: string | null; // uuid
  prompt_id: string | null; // uuid
  storage_path: string | null;
  status: string | null;
}

export type InterviewSchemaInsert = Omit<InterviewSchema, "created_at">;

export interface TranscriptionSchema {
  id: string; // uuid
  created_at: string; // ISO timestamp
  interview_id: string; // uuid
  text_content: string;
}

export type TranscriptionSchemaInsert = Omit<
  TranscriptionSchema,
  "id" | "created_at"
>;

export interface AnalysisSchema {
  id: string;
  created_at: string;
  interview_id: string;
  grammar: JSON;
  sentence_complexity: JSON;
  keywords: JSON;
  fluency: JSON;
  repetition: JSON;
  feedback: JSON;
  ai_coach_summary: string;
}

export type AnalysisSchemaInsert = Omit<
AnalysisSchema, 
"id" | "created_at"
>;