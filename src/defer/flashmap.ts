import { defer } from "@defer/client";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";
import { entries } from "~/server/db/schema";
import { saveCardsToDb, saveMindmapToDb, waitForRun } from "~/utils/flashmap";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

async function createEntry(props: { fileS3Url: string; userId: string }) {
  // Create OpenAI File
  console.log(">>> Creating OpenAI File")
  const { id: openaiFileId } = await openai.files.create({
    file: await fetch(props.fileS3Url),
    purpose: "assistants",
  });

  // Create OpenAI Thread
  // Create Flashcards
  console.log(">>> Creating Thread and Flashcards")
  const flashcardRun = await openai.beta.threads.createAndRun({
    assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
    thread: {
      messages: [
        {
          role: "user",
          content: `Given the file I gave, can you summarize it in a way that I can put on flashcards?
                   The summary should be short and concise without losing any of the important information.
                   Lastly, can you format the response as JSON with an array of objects with properties "keyword" and "definition".
                   Please reply with only the stringified JSON.`,
          file_ids: [openaiFileId],
        },
      ],
    },
  });
  // Save FileID and ThreadID to Entry
  const [entry] = await db
    .insert(entries)
    .values({
      openaiFileId: openaiFileId,
      openaiThreadId: flashcardRun.thread_id,
      createdBy: props.userId,
      fileS3Url: props.fileS3Url,
    })
    .returning();

  // Wait for run to Finish
  console.log(">>> Waiting for Flashcards to finish running")
  const cardStatus = await waitForRun(openai, {
    runId: flashcardRun.id,
    threadId: flashcardRun.thread_id,
  });
  console.log(">>> Flashcards to finished running")

  // Save Flashcards to DB
  if (cardStatus === "error") {
    await db
      .update(entries)
      .set({ flashcardStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry!.id));
    throw new Error("Failed to create flashcards!");
  }

  console.log(">>> Saving cards to DB")
  await saveCardsToDb(openai, {
    threadId: flashcardRun.thread_id,
    entryId: entry!.id,
  });

  // Update Entry DB
  await db
    .update(entries)
    .set({ creationStatus: "mindmap" })
    .where(eq(entries.id, entry!.id));

  // Create Mindmap
  let ranThread;

  console.log(">>> Creating Mindmap")
  try {
    await openai.beta.threads.messages.create(flashcardRun.thread_id, {
      role: "user",
      content: ` Create a mind map for this file.
              List the topics as central idea, main branches and subbranches. 
              Laslty, format the resulting mindmap in raw markdown for copying and only reply with the raw markdown.
              `,
    });
    ranThread = await openai.beta.threads.runs.create(flashcardRun.thread_id, {
      assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
    });
  } catch (e) {
    console.error(e);
    await db
      .update(entries)
      .set({ mindmapStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry!.id));
    throw new Error("There was an erorr creating/running mindmap!");
  }

  // Create Wait for run to Finish
  console.log(">>> Waiting for Mindmap to finish running")
  const mindmapStatus = await waitForRun(openai, {
    runId: ranThread.id,
    threadId: flashcardRun.thread_id,
  });
  console.log(">>> Mindmap to finished running")

  // Save Flashcards to DB
  if (mindmapStatus === "error") {
    await db
      .update(entries)
      .set({ mindmapStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry!.id));
    throw new Error("Failed to create flashcards!");
  }
  // Save Mindmap to DB

  console.log(">>> Saving Mindmap to DB")
  await saveMindmapToDb(openai, {
    threadId: flashcardRun.thread_id,
    entryId: entry!.id,
  })
  // Update Entry DB
  await db
    .update(entries)
    .set({ creationStatus: "title" })
    .where(eq(entries.id, entry!.id));

  // Create Title
  // Create Wait for run to Finish
  // Save Title to DB
  // Update Entry DB

  // Create Quiz
  // Create Wait for run to Finish
  // Save Quiz to DB
  // Update Entry DB

  return;
}

export default defer(createEntry);
