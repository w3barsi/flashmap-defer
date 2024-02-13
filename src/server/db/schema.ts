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
  threadId: text("thread_id", { length: 255 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

export const threads = createTable("thread", {
  id: text("id", { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title", { length: 255 }),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
  fileUrl: text("file_url", { length: 255 }).notNull(),
  openaiFileId: text("openai_file_id"),
  assistantId: text("assistant_id"),

  flashcardStatus: text("flashcard_status", {
    enum: ["none", "creating", "created", "error"],
  }).default("creating"),
  mindmapStatus: text("mindmap_status", {
    enum: ["none", "creating", "created", "error"],
  }).default("creating"),
  testStatus: text("test_status", {
    enum: ["none", "creating", "created", "error"],
  }).default("creating"),

  preTestScore: integer("pretest_score"),
  postTestScore: integer("posttest_score"),

  createdBy: text("uploaded_by", { length: 255 }).notNull(),

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
    id: index("key_idx").on(file.key),
  }),
);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);
