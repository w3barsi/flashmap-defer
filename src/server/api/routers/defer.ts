import { clerkClient } from "@clerk/nextjs";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "~/env";
import createQuestions from "~/defer/questions"

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const deferRouter = createTRPCRouter({
  questions: protectedProcedure.mutation(async () => {
    await createQuestions()
  }),
});
