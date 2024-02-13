import { defer } from "@defer/client";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";
import { threads } from "~/server/db/schema";

import {
  createTitle,
  saveCardsToDb,
  saveMindmapToDb,
  updateThreadTitle,
  waitForThreadRun,
} from "~/utils/openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

async function createCards(props: { fileUrl: string; userId: string }) {
  const { fileUrl, userId } = props;

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

  const dbThreadId = thread[0]?.id;

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
          file_ids: [fileId.id],
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
  await saveCardsToDb(threadId, dbThreadId!);
  const titleRunId = await createTitle(threadId);
  await waitForThreadRun(threadId, titleRunId);
  await updateThreadTitle(threadId, dbThreadId!);
}

export default defer(createCards);
