import { defer } from "@defer/client";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { env } from "~/env";
import { db } from "~/server/db";
import { entries } from "~/server/db/schema";
import {
  saveCardsToDb,
  saveMindmapToDb,
  updateThreadTitle,
  waitForRun,
} from "~/utils/flashmap";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

async function createEntry(props: {
  fileS3Url: string;
  userId: string;
  entryId: string;
}) {
  const returned = await db
    .select()
    .from(entries)
    .where(eq(entries.id, props.entryId));
  if (!returned) {
    throw new Error("Entry not found in DB");
  }

  let entry = returned[0];

  // Create OpenAI File
  console.log(">>> Creating OpenAI File");
  const { id: openaiFileId } = await openai.files.create({
    file: await fetch(props.fileS3Url),
    purpose: "assistants",
  });

  // Create OpenAI Thread
  // Create Flashcards
  console.log(">>> Creating Thread and Flashcards");
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
  entry = await db
    .update(entries)
    .set({
      openaiFileId: openaiFileId,
      openaiThreadId: flashcardRun.thread_id,
    })
    .where(eq(entries.id, props.entryId))
    .returning()
    .get();

  // Wait for run to Finish
  console.log(">>> Waiting for Flashcards to finish running");
  const cardStatus = await waitForRun(openai, {
    runId: flashcardRun.id,
    threadId: flashcardRun.thread_id,
    runType: "flashcards",
  });
  console.log(">>> Flashcards to finished running");

  // Save Flashcards to DB
  if (cardStatus === "error") {
    entry = await db
      .update(entries)
      .set({ flashcardStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, props.entryId))
      .returning()
      .get();
    throw new Error("Failed to create flashcards!");
  }

  console.log(">>> Saving cards to DB");
  await saveCardsToDb(openai, {
    threadId: flashcardRun.thread_id,
    entryId: entry.id,
  });

  // Create Mindmap
  let ranThread;

  console.log(">>> Creating Mindmap");
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
      .where(eq(entries.id, props.entryId));
    throw new Error("There was an erorr creating/running mindmap!");
  }

  // Create Wait for run to Finish
  console.log(">>> Waiting for Mindmap to finish running");
  const mindmapStatus = await waitForRun(openai, {
    runId: ranThread.id,
    threadId: flashcardRun.thread_id,
    runType: "mindmap",
  });
  console.log(">>> Mindmap to finished running");

  // Save Mindmap to DB
  if (mindmapStatus === "error") {
    await db
      .update(entries)
      .set({ mindmapStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry.id));
    throw new Error("Failed to create flashcards!");
  }
  // Save Mindmap to DB

  console.log(">>> Saving Mindmap to DB");
  await saveMindmapToDb(openai, {
    threadId: flashcardRun.thread_id,
    entryId: entry.id,
  });

  // Create Title
  try {
    await openai.beta.threads.messages.create(flashcardRun.thread_id, {
      role: "user",
      content:
        "Create a short title for the attached file. It can only have 8 words max.",
    });
    ranThread = await openai.beta.threads.runs.create(flashcardRun.thread_id, {
      assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
    });
  } catch (e) {
    console.error(e);
    await db
      .update(entries)
      .set({ mindmapStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry.id));
    throw new Error("There was an erorr creating/running mindmap!");
  }
  // Create Wait for run to Finish
  console.log(">>> Waiting for Mindmap to finish running");
  const titleStatus = await waitForRun(openai, {
    runId: ranThread.id,
    threadId: flashcardRun.thread_id,
    runType: "title",
  });
  console.log(">>> Mindmap to finished running");
  // Save Title to DB
  if (titleStatus === "error") {
    await db
      .update(entries)
      .set({ titleStatus: "error", creationStatus: "error" })
      .where(eq(entries.id, entry.id));
    throw new Error("Failed to create title!");
  }
  // Update Entry DB
  await updateThreadTitle(openai, {
    threadId: flashcardRun.thread_id,
    entryId: entry.id,
  });

  // Create Quiz
  // === START OF PROMPT
  // `Hey, I'm a teacher and I need help.
  // Given the attached file, can you make a short multiple choice quiz with 4 choices for me?
  // It can at most have 10 questions. Format your answer in JSON with this shape:
  // \`\`\`ts
  // type QuizEntry = {
  //     question: string
  //     choices: number[]
  // }
  // type Quiz = {
  //     answers: string[],
  //     quiz: QuizEntry[]
  // }
  // \`\`\`
  //Where "answers" is an array of the index of the correct answers with the type of number.
  //Your reply must only be the JSON block and nothing else.`
  // === END OF PROMPT
  // Create Wait for run to Finish
  // Save Quiz to DB
  // Update Entry DB

  return;
}

export default defer(createEntry);
