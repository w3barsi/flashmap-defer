import { clerkClient } from "@clerk/nextjs";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const openaiRouter = createTRPCRouter({
  hello: protectedProcedure.mutation(async ({ input, ctx }) => {
    const listMessages = await openai.beta.threads.messages.list( "thread_kSG6V2HaTO2z6WFrTD8Sy7bQ");
    console.log(listMessages)
  }),
});
