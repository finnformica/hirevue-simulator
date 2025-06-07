import { v4 as uuid } from "uuid";

import { insertRecords, uploadBlob } from "@/lib/supabase/server";
import { InterviewSchemaInsert } from "@/lib/types/schemas";

interface UploadInterviewParams {
  userId: string;
  promptId: string;
  videoBlob: Blob;
  bucket?: string;
  status?: string;
}

export async function uploadInterview({
  userId,
  promptId,
  videoBlob,
  status = "completed",
}: UploadInterviewParams) {
  const fileName = `${uuid()}.webm`;
  const filePath = `${userId}/${fileName}`;

  //   1. Upload the video blob
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

  const records: InterviewSchemaInsert[] = [
    {
      user_id: userId,
      prompt_id: promptId,
      storage_path: filePath,
      status,
    },
  ];

  // 2. Insert interview record
  const { data: interviewData, error: interviewError } = await insertRecords({
    table: "interviews",
    records,
  });

  if (interviewError) {
    return { error: interviewError, data: null };
  }

  return { error: null, data: interviewData };
}
