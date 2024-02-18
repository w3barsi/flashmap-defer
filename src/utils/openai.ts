import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "~/env";
import { db } from "~/server/db";
import { flashcards, mindmap, entries } from "~/server/db/schema";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const saveCardsToDb = async (threadId: string, dbThreadId: string) => {
  const listMessages = await openai.beta.threads.messages.list(threadId);
  const messages = listMessages.data.map((d) => {
    const role = d.role;
    const createdAt = d.created_at;
    const content =
      d?.content[0]!.type === "text" ? d.content[0].text.value : null;
    return { role, content, createdAt };
  });

  if (!messages[0]?.content) {
    throw new Error("NO MESSAGES");
  }
  const splitted = messages[0].content.split("\n").map((r) => r);
  const parsed = splitted.slice(1, splitted.length - 1).join("");
  const flashcardDataSchema = z.array(
    z.object({ keyword: z.string(), definition: z.string() }),
  );

  const flashcardData = flashcardDataSchema.parse(JSON.parse(parsed));
  console.log(flashcardData);
  flashcardData.map(async (d) => {
    await db.insert(flashcards).values({
      keyword: d.keyword,
      definition: d.definition,
      threadId: dbThreadId,
    });
  });

  await db
    .update(entries)
    .set({ flashcardStatus: "created" })
    .where(eq(entries.id, dbThreadId));
};

export const saveMindmapToDb = async (threadId: string, dbThreadId: string) => {
  const listMessages = await openai.beta.threads.messages.list(threadId);
  const messages = listMessages.data.map((d) => {
    const role = d.role;
    const createdAt = d.created_at;
    const fileId = d.file_ids;
    console.log(fileId);
    const content =
      d?.content[0]!.type === "text" ? d.content[0].text.value : null;
    return { role, content, createdAt };
  });

  if (!messages[0]?.content) {
    throw new Error("NO MESSAGES");
  }
  console.log(messages[0].content);

  let content = messages[0].content;

  if (content.startsWith("```markdown\n")) {
    content = content.slice(13);
  } else if (content.startsWith("```")) {
    content = content.slice(3);
  }

  if (content.endsWith("```\n")) {
    content = content.slice(0, -5);
  }else if (content.endsWith("```\n")) {
    content = content.slice(0, -3);
  }

  console.log(content);
  await db.insert(mindmap).values({ markdown: content, threadId: dbThreadId });

  await db
    .update(entries)
    .set({ mindmapStatus: "created" })
    .where(eq(entries.id, dbThreadId));
};

export const updateThreadTitle = async (
  threadId: string,
  dbThreadId: string,
) => {
  try {
    const listMessages = await openai.beta.threads.messages.list(threadId);
    const messages = listMessages.data.map((d) => {
      const role = d.role;
      const createdAt = d.created_at;
      const fileId = d.file_ids;
      console.log(fileId);
      const content =
        d?.content[0]!.type === "text" ? d.content[0].text.value : null;
      return { role, content, createdAt };
    });

    if (!messages[0]?.content) {
      throw new Error("Error: No TITLE");
    }
    console.log("UPDATING");
    await db
      .update(entries)
      .set({ title: messages[0].content })
      .where(eq(entries.id, dbThreadId));
  } catch (e) {
    throw new Error("[TITLE] An Error occured while trying to update db.");
  }
};

export const waitForThreadRun = async (threadId: string, runId: string) => {
  let isCompleted = false;

  while (!isCompleted) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "completed" || runStatus.status === "failed") {
      isCompleted = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

export const createTitle = async (threadId: string) => {
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content:
      "Create a short title for the attached file. It can only have 8 words max.",
  });

  const ranThread = await openai.beta.threads.runs.create(threadId, {
    assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
  });
  return ranThread.id;
};
