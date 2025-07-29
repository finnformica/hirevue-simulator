import { insertRecords, uploadBlob } from "@/lib/supabase/server";
import { InterviewAttempt, InterviewSchemaInsert } from "@/lib/types/schemas";
import useSWR from "swr";
import { fetchInterviewAttempts } from "./prompts";

interface UploadInterviewParams {
  userId: string;
  interviewId: string;
  promptId: string;
  videoBlob: Blob;
  bucket?: string;
  status?: string;
}

// Custom hook for fetching interview attempts with increasing page size
export function useInterviewAttempts(
  promptId: string | null,
  pageSize: number = 5
) {
  const key = promptId ? `interview-attempts-${promptId}-${pageSize}` : null;
  const { data, error, isLoading, mutate } = useSWR<{
    attempts: InterviewAttempt[];
    totalCount: number;
  }>(key, async () => {
    if (!promptId) return { attempts: [], totalCount: 0 };
    return await fetchInterviewAttempts(promptId, 1, pageSize);
  });

  return {
    attempts: data?.attempts || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

export async function uploadInterview({
  userId,
  interviewId,
  promptId,
  videoBlob,
  status = "completed",
}: UploadInterviewParams) {
  const fileName = `${interviewId}.webm`;
  const filePath = `${userId}/${fileName}`;

  // Upload the video blob
  const data = new FormData();
  data.append("blob", videoBlob);

  const { error: uploadError } = await uploadBlob({
    bucket: "interviews",
    filePath,
    data,
    contentType: "video/webm",
  });

  if (uploadError) {
    return { error: uploadError, data: null };
  }

  // Insert interview record with the client-generated interviewId
  const records: InterviewSchemaInsert[] = [
    {
      id: interviewId,
      user_id: userId,
      prompt_id: promptId,
      storage_path: filePath,
      status,
    },
  ];

  const { data: interviewData, error: interviewError } = await insertRecords({
    table: "interviews",
    records,
  });

  if (interviewError) {
    return { error: interviewError, data: null };
  }

  return { error: null, data: interviewData };
}
