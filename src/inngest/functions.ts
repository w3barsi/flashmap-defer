import { db } from "~/server/db";
import { inngest } from "./client";
import { test } from "~/server/db/schema";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.run("save-to-db", async () => {
      await db.insert(test).values({test: event.data.email})
    });

    return {event, email: event.data.email}
  },
);
