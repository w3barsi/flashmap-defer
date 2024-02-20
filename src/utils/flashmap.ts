import { eq } from "drizzle-orm";
import type OpenAI from "openai";
import { z } from "zod";
import { db } from "~/server/db";
import { entries, flashcards, mindmap, questions } from "~/server/db/schema";
import { questionsSchema } from "./validators";

export async function waitForRun(
  openai: OpenAI,
  props: {
    runId: string;
    threadId: string;
    runType: "flashcards" | "mindmap" | "title" | "quiz";
  },
) {
  let completedRun = await openai.beta.threads.runs.retrieve(
    props.threadId,
    props.runId,
  );

  while (
    completedRun.status === "in_progress" ||
    completedRun.status === "queued"
  ) {
    completedRun = await openai.beta.threads.runs.retrieve(
      props.threadId,
      props.runId,
    );
    console.log(`Waiting of type ${props.runType}`);
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  if (completedRun.status !== "completed") {
    console.log("Run status:", completedRun.status);
  }
  return completedRun.status === "completed" ? "completed" : "error";
}

export const saveCardsToDb = async (
  openai: OpenAI,
  props: { threadId: string; entryId: string },
) => {
  const listMessages = await openai.beta.threads.messages.list(props.threadId);
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
  for (const d of flashcardData) {
    await db.insert(flashcards).values({
      keyword: d.keyword,
      definition: d.definition,
      entryId: props.entryId,
    });
  }

  await db
    .update(entries)
    .set({ flashcardStatus: "created", creationStatus: "mindmap" })
    .where(eq(entries.id, props.entryId));
};

export async function saveMindmapToDb(
  openai: OpenAI,
  props: { threadId: string; entryId: string },
) {
  const listMessages = await openai.beta.threads.messages.list(props.threadId);
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
  } else if (content.endsWith("```")) {
    content = content.slice(0, -3);
  }

  console.log(content);
  await db
    .insert(mindmap)
    .values({ markdown: content, threadId: props.entryId });

  await db
    .update(entries)
    .set({ mindmapStatus: "created", creationStatus: "title" })
    .where(eq(entries.id, props.entryId));
}

export async function updateThreadTitle(
  openai: OpenAI,
  props: { threadId: string; entryId: string },
) {
  try {
    const listMessages = await openai.beta.threads.messages.list(
      props.threadId,
    );
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
    let title = messages[0].content;

    // Removes leading and trailing quotaiton marks.
    if (title.startsWith('"')) {
      title = title.substring(1);
    }
    if (title.endsWith('"')) {
      title = title.substring(0, title.length - 1);
    }

    console.log(`Title >>> ${title}`);

    await db
      .update(entries)
      .set({ title, titleStatus: "created", creationStatus: "quiz" })
      .where(eq(entries.id, props.entryId));
  } catch (e) {
    throw new Error("[TITLE] An Error occured while trying to update db.");
  }
}

export async function saveQuestionsToDB(
  openai: OpenAI,
  props: { threadId: string; entryId: string },
) {
  const listMessages = await openai.beta.threads.messages.list(props.threadId);
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

  let content = messages[0].content;

  if (content.startsWith("```json\n")) {
    content = content.slice(8);
  } else if (content.startsWith("```")) {
    content = content.slice(3);
  }

  if (content.endsWith("```\n")) {
    content = content.slice(0, -5);
  } else if (content.endsWith("```")) {
    content = content.slice(0, -3);
  }

  const parsed = questionsSchema.parse(await JSON.parse(content));
  const answers = JSON.stringify(parsed.answers);

  console.log(answers);
  await db
    .update(entries)
    .set({ testAnswers: answers })
    .where(eq(entries.id, props.entryId));

  for (const [index, value] of parsed.quiz.entries()) {
    const stringifiedChoices = JSON.stringify(value.choices);
    await db.insert(questions).values({
      choices: stringifiedChoices,
      question: value.question,
      entryId: props.entryId,
      number: index,
    });
  }
  // await Promise.all(
  //   parsed.quiz.map(async (q) => {
  //     const stringifiedChoices = JSON.stringify(q.choices);
  //     console.log(stringifiedChoices);
  //     return await db.insert(questions).values({
  //       choices: stringifiedChoices,
  //       question: q.question,
  //       entryId: props.entryId,
  //     });
  //   }),
  // );
}
