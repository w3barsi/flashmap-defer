// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  int,
  integer,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

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

export const threads = createTable("thread", {
  id: text("id", { length: 255 }).primaryKey(),
  title: text("title", { length: 255 }),
  isDeleted: integer("isDeleted", { mode: "boolean" }).default(false),
  fileKey: text("key", { length: 255 }).notNull(),

  flashcardStatus: text("flashcardStatus", {
    enum: ["none", "creating", "created"],
  }),
  mindmapStatus: text("mindmapStatus", {
    enum: ["none", "creating", "created"],
  }),
  pretestStatus: text("pretestStatus", {
    enum: ["none", "creating", "created"],
  }),
  posttestStatus: text("posttestStatus", {
    enum: ["none", "creating", "created"],
  }),

  createdBy: text("uploadedBy", { length: 255 }).notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: int("updatedAt", { mode: "timestamp" }),
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
