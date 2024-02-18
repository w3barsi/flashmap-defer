import { type InferSelectModel } from "drizzle-orm";
import type { entries } from "./schema";

export type ThreadType = InferSelectModel<typeof entries>;
