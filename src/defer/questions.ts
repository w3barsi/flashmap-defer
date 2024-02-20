import { defer } from "@defer/client";
import OpenAI from "openai";
import { env } from "~/env";
import {
    saveMindmapToDb,
    saveQuestionsToDB,
    waitForRun
} from "~/utils/flashmap";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

async function createQuestions() {
  const flashcardRun = {
    thread_id: "thread_X9uMPBRnpD7bEpi40zX6Qip1",
  };

  // Create Questions
  // let ranThread;
  //
  // console.log(">>> Creating Questions");
  // try {
  //   await openai.beta.threads.messages.create(flashcardRun.thread_id, {
  //     role: "user",
  //     content: `Hey, I need help.
  //               Given the attached file, can you make a short multiple choice quiz with 4 choices for me?
  //               It can at most have 10 questions. Format your answer in JSON with this shape:
  //               \`\`\`ts
  //               type QuizEntry = {
  //                   question: string
  //                   choices: number[]
  //               }
  //               type Quiz = {
  //                   answers: string[],
  //                   quiz: QuizEntry[]
  //               }
  //               \`\`\`
  //               Where "answers" is an array of the index of the correct answers with the type of number.
  //               Your reply must only be the JSON block and nothing else.`,
  //   });
  //   ranThread = await openai.beta.threads.runs.create(flashcardRun.thread_id, {
  //     assistant_id: "asst_L1loiTWtWASq3gHHvC9GrIOb",
  //   });
  // } catch (e) {
  //   console.error(e);
    // await db
    // .update(entries)
    // .set({ mindmapStatus: "error", creationStatus: "error" })
    // .where(eq(entries.id, props.entryId));
  //   throw new Error("There was an erorr creating/running mindmap!");
  // }
  //
  // Create Wait for run to Finish
  // console.log(">>> Waiting for Mindmap to finish running");
  // const questionStatus = await waitForRun(openai, {
  //   runId: ranThread.id,
  //   threadId: flashcardRun.thread_id,
  //   runType: "quiz",
  // });
  // console.log(">>> Mindmap to finished running");
  //
  // // Save Mindmap to DB
  // if (questionStatus === "error") {
    // await db
    //   .update(entries)
    //   .set({ mindmapStatus: "error", creationStatus: "error" })
    //   .where(eq(entries.id, entry.id));
  //   throw new Error("Failed to create flashcards!");
  // }
  // // Save Mindmap to DB
  //
  console.log(">>> Saving Mindmap to DB");
  await saveQuestionsToDB(openai, {
    threadId: flashcardRun.thread_id,
    entryId: "ujc78ujjr9fd",
  });
}

export default defer(createQuestions);
