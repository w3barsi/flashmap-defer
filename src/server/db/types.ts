import { type InferSelectModel } from "drizzle-orm";
import type { threads } from "./schema";

export type ThreadType = InferSelectModel<typeof threads>;
