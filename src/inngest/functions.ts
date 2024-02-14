import OpenAI from "openai";
import { env } from "~/env";
import {
  validateThreadShape,
  validateInngestCreateFileInput,
} from "~/utils/validators";
import { inngest } from "./client";
import {
  createTitle,
  saveCardsToDb,
  saveMindmapToDb,
  updateThreadTitle,
  waitForThreadRun,
} from "~/utils/openai";
import { db } from "~/server/db";
import { threads } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

// export const helloWorld = inngest.createFunction(
//   { id: "hello-world" },
//   { event: "test/hello.world" },
//   async ({ event, step }) => {
//     await step.run("save-to-db", async () => {
//       await db.insert(test).values({ test: event.data.email });
//     });
//
//     return { event, email: event.data.email };
//   },
// );
//
//

export const testTimeout = inngest.createFunction(
  { id: "test-timeout" },
  { event: "test-timeout" },
  async ({ step }) => {
    console.log("Starting step");
    await step.sleep("sleep-for-20-seconds", "20 seconds");
    console.log("Ending step");
  },
);

export const createFile = inngest.createFunction(
  { id: "create-file" },
  { event: "flashmap/create.openai-file" },
  async ({ event, step }) => {
    const { dbThreadId, fileId } = await step.run(
      "create-file-step",
      async () => {
        let validatedData;
        try {
          validatedData = validateInngestCreateFileInput(event.data);
        } catch {
          throw new Error("Invalid shape");
        }
        const { fileUrl, userId } = validatedData;

        let thread = await db
          .insert(threads)
          .values({
            fileUrl,
            createdBy: userId,
          })
          .returning();

        const fileId = await openai.files.create({
          file: await fetch(thread[0]!.fileUrl),
          purpose: "assistants",
        });

        thread = await db
          .update(threads)
          .set({
            openaiFileId: fileId.id,
          })
          .where(eq(threads.id, thread[0]!.id))
          .returning();

        return { dbThreadId: thread[0]?.id, fileId: fileId.id };
      },
    );
    await step.sendEvent("sendEvent-create-cards", {
      name: "flashmap/create.cards",
      data: {
        threadId: dbThreadId,
        fileId,
      },
    });

    await step.sendEvent("sendEvent-create-mindmap", {
      name: "flashmap/create.mindmap",
      data: {
        threadId: dbThreadId,
        fileId,
      },
    });
  },
);

export const createCards = inngest.createFunction(
  { id: "create-cards" },
  { event: "flashmap/create.cards" },
  async ({ event, step }) => {
    await step.run("create-flashcards", async () => {
      let validatedData;
      try {
        validatedData = validateThreadShape(event.data);
      } catch {
        throw new Error("Invalid shape");
      }
      const { fileId, threadId: dbThreadId } = validatedData;

      // ------------------------------------------------------------- GLOBALS
      let threadId: string;
      let runId: string;
      try {
        const threadTemp = await openai.beta.threads.create({
          messages: [
            {
              role: "user",
              content: `Given the file I gave, can you summarize it in a way that I can put on flashcards?
              The summary should be short and concise without losing any of the important information.
                Lastly, can you format the response as JSON with an array of objects with properties "keyword" and "definition". 
                Please reply with only the stringified JSON.`,
              file_ids: [fileId],
            },
          ],
        });
        threadId = threadTemp.id;
      } catch (e) {
        throw new Error("Error creating Flashcards Thread");
      }

      try {
        const ranThread = await openai.beta.threads.runs.create(threadId, {
          assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
        });
        runId = ranThread.id;
      } catch (e) {
        throw new Error("Error running Flashcards Thread");
      }

      await waitForThreadRun(threadId, runId);
      await saveCardsToDb(threadId, dbThreadId);
      const titleRunId = await createTitle(threadId);
      await waitForThreadRun(threadId, titleRunId);
      await updateThreadTitle(threadId, dbThreadId);
    });
  },
);

export const createMindmap = inngest.createFunction(
  { id: "create-mindmap" },
  { event: "flashmap/create.mindmap" },
  async ({ event, step }) => {
    await step.sleep("wait-5-secs", 5000);

    await step.run("create-mindmap", async () => {
      let validatedData;
      try {
        validatedData = validateThreadShape(event.data);
      } catch {
        throw new Error("Invalid shape");
      }
      const { fileId, threadId: dbThreadId } = validatedData;

      let threadId: string;
      try {
        const threadTemp = await openai.beta.threads.create({
          messages: [
            {
              role: "user",
              content: ` Create a mind map for this file.
              List the topics as central idea, main branches and subbranches. 
              Laslty, format the resulting mindmap in raw markdown for copying and only reply with the raw markdown.
            `,
              file_ids: [fileId],
            },
          ],
        });
        threadId = threadTemp.id;
      } catch (e) {
        throw new Error("Error creating Mindmap Thread");
      }

      const ranThread = await openai.beta.threads.runs.create(threadId, {
        assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
      });
      const runId = ranThread.id;

      await waitForThreadRun(threadId, runId);
      await saveMindmapToDb(threadId, dbThreadId);
    });
  },
);

export const createQuiz = inngest.createFunction(
  { id: "create-mindmap" },
  { event: "flashmap/create.mindmap" },
  async ({ event, step }) => {
    // ------------------------------------------------------------- GLOBALS

    await step.run("create-mindmap", async () => {
      let validatedData;
      try {
        validatedData = validateThreadShape(event.data);
      } catch {
        throw new Error("Invalid shape");
      }
      const { fileId, threadId: dbThreadId } = validatedData;

      let threadId: string;
      try {
        const threadTemp = await openai.beta.threads.create({
          messages: [
            {
              role: "user",
              content: ` Create a mind map for this file.
              List the topics as central idea, main branches and subbranches. 
              Laslty, format the resulting mindmap in raw markdown for copying and only reply with the raw markdown.
            `,
              file_ids: [fileId],
            },
          ],
        });
        threadId = threadTemp.id;
      } catch (e) {
        throw new Error("Error creating Mindmap Thread");
      }

      const ranThread = await openai.beta.threads.runs.create(threadId, {
        assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
      });
      const runId = ranThread.id;

      await waitForThreadRun(threadId, runId);
      await saveMindmapToDb(threadId, dbThreadId);
    });
  },
);

// export const createTitle = inngest.createFunction(
//   { id: "create-title" },
//   { event: "flashmap/create.title" },
//   async ({ event, step }) => {
//     await step.run("create-title", async () => {
//       let validatedData;
//       try {
//         validatedData = validateThreadShape(event.data);
//       } catch {
//         throw new Error("Invalid shape");
//       }
//       const { fileId, threadId: dbThreadId } = validatedData;
//
//       let threadId: string;
//       try {
//         const threadTemp = await openai.beta.threads.create({
//           messages: [
//             {
//               role: "user",
//               content:
//                 "Create a short title for the attached file. It can only have 8 words max.",
//               file_ids: [fileId],
//             },
//           ],
//         });
//         threadId = threadTemp.id;
//       } catch (e) {
//         throw new Error("Error creating Mindmap Thread");
//       }
//
//       const ranThread = await openai.beta.threads.runs.create(threadId, {
//         assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
//       });
//       const runId = ranThread.id;
//
//       await waitForThreadRun(threadId, runId);
//       await updateThreadTitle(threadId, dbThreadId);
//     });
//   },
// );
