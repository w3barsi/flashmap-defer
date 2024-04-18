// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql, InferSelectModel } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { createId } from "~/utils/id";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `web_${name}`);

export const test = createTable("test", {
  test: text("test"),
});

export const testScores = createTable("test_scores", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),

  scoredBy: text("scored_by", { length: 255 }).notNull(),
  entryId: text("entry_id", { length: 255 }).notNull(),

  preTestScore: integer("pretest_score"),
  postTestScore: integer("posttest_score"),
})

export const mindmap = createTable("mindmap", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  markdown: text("markdown").notNull(),
  threadId: text("threadId", { length: 255 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

export const flashcards = createTable("flashcard", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  keyword: text("keyword").notNull(),
  definition: text("definition").notNull(),
  entryId: text("entry_id", { length: 255 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

export const questions = createTable("quiestions", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  entryId: text("entry_id", { length: 255 }).notNull(),

  number: integer("number", {mode: "number"}).notNull(),
  question: text("question").notNull(),
  choices: text("choices").notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

export const entries = createTable("entry", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title", { length: 255 }),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
  createdBy: text("uploaded_by", { length: 255 }).notNull(),

  fileS3Url: text("file_s3_url", { length: 255 }).notNull(),

  openaiFileId: text("openai_file_id"),
  openaiThreadId: text("openai_thread_id"),
  openaiAssistantId: text("assistant_id"),

  creationStatus: text("creation_status", {
    enum: ["error", "flashcards", "mindmap", "title", "quiz", "done"],
  }).default("flashcards"),

  fileStatus: text("file_status", {
    enum: ["created", "error"],
  }).default("created"),
  flashcardStatus: text("flashcard_status", {
    enum: ["pending", "creating", "created", "error"],
  }).default("pending"),
  mindmapStatus: text("mindmap_status", {
    enum: ["pending", "creating", "created", "error"],
  }).default("pending"),
  titleStatus: text("title_status", {
    enum: ["pending", "creating", "created", "error"],
  }).default("pending"),
  quizStatus: text("quiz_status", {
    enum: ["pending", "creating", "created", "error"],
  }).default("pending"),

  testAnswers: text("test_answers"),
  preTestScore: integer("pretest_score"),
  postTestScore: integer("posttest_score"),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

export const files = createTable(
  "file",
  {
    key: text("key", { length: 255 }).primaryKey().notNull(),
    name: text("name", { length: 255 }).notNull(),
    url: text("url", { length: 255 }).notNull(),
    uploadedBy: text("uploadedBy", { length: 255 }).notNull(),
    threadId: text("threadId", { length: 255 }),

    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }),
  },
  (file) => ({
    keyIndex: index("key_index").on(file.key),
  }),
);
