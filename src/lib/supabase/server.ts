"use server";

import { createClientForServer } from "@/utils/supabase/server";

export async function uploadBlob({
  bucket,
  filePath,
  data,
  contentType = "application/octet-stream",
}: {
  bucket: string;
  filePath: string;
  data: FormData;
  contentType?: string;
}) {
  const supabase = await createClientForServer();
  const blob = data.get("blob") as unknown as Blob;

  if (!blob) throw new Error("No file uploaded");

  return await supabase.storage
    .from(bucket)
    .upload(filePath, blob, { contentType });
}

export async function insertRecords<T extends {}>({
  table,
  records,
}: {
  table: string;
  records: T[];
}) {
  const supabase = await createClientForServer();

  return await supabase.from(table).insert(records).select().single();
}
