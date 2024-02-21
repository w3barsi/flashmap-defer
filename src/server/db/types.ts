import { type InferSelectModel } from "drizzle-orm";
import type { entries } from "./schema";

export type ThreadType = InferSelectModel<typeof entries>;

export type FileList = Omit<
  ThreadType,
  | "number"
  | "isDeleted"
  | "createdBy"
  | "fileS3Url"
  | "openaiFileId"
  | "openaiThreadId"
  | "openaiAssistantId"
  | "fileStatus"
  | "testAnswers"
  | "preTestScore"
  | "postTestScore"
  | "createdAt"
  | "updatedAt"
>;
