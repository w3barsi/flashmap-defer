import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { entries, questions, testScores } from "~/server/db/schema";

const getScore = (a: number[], b: number[]) => {
  let score = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      score += 1;
    }
  }

  return score;
};

export const quizRouter = createTRPCRouter({
  getQuestions: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { entryId } = input;
      const [title] = await ctx.db
        .select({ title: entries.title })
        .from(entries)
        .where(eq(entries.id, entryId));
      const values = await ctx.db
        .select()
        .from(questions)
        .where(eq(questions.entryId, entryId));
      // console.log(values);
      const retVal = { title: title?.title, questions: values };
      // console.log(retVal)
      return retVal
    }),
  checkPretestScores: protectedProcedure
    .input(z.object({ answers: z.array(z.number()), entryId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [ret] = await ctx.db
        .select({ answers: entries.testAnswers })
        .from(entries)
        .where(eq(entries.id, input.entryId));

      if (!ret?.answers) {
        throw new TRPCError({
          message: "FAILED to get correct answers from DB",
          code: "NOT_FOUND",
        });
      }

      const correctAnswers = z.array(z.number()).parse(JSON.parse(ret.answers));
      const actualScore = getScore(correctAnswers, input.answers);
      await db
        .update(testScores)
        .set({ preTestScore: actualScore })
        .where(and(eq(testScores.entryId, input.entryId), eq(testScores.scoredBy, ctx.session.userId)));
    }),

  checkPosttestScores: protectedProcedure
    .input(z.object({ answers: z.array(z.number()), entryId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [ret] = await ctx.db
        .select({ answers: entries.testAnswers })
        .from(entries)
        .where(eq(entries.id, input.entryId));
      if (!ret?.answers) {
        throw new TRPCError({
          message: "FAILED to get correct answers from DB",
          code: "NOT_FOUND",
        });
      }
      const correctAnswers = z.array(z.number()).parse(JSON.parse(ret.answers));
      const actualScore = getScore(correctAnswers, input.answers);
      await db
        .update(testScores)
        .set({ postTestScore: actualScore })
        .where(and(eq(testScores.entryId, input.entryId), eq(testScores.scoredBy, ctx.session.userId)));
    }),
  getScore: protectedProcedure
    .input(z.object({ entryId: z.string(), testType: z.enum(["pre", "post"]) }))
    .query(async ({ ctx, input }) => {
      // first check if entry on testScores table exists
      const exists = await ctx.db.select().from(testScores).where(eq(testScores.scoredBy, ctx.session.userId))
      if (exists.length === 0) {
        console.log("Does not exist")
        const ret = await ctx.db.insert(testScores).values({ "scoredBy": ctx.session.userId, "entryId": input.entryId }).returning()
        console.log(ret)
      }

      // if ()


      if (input.testType === "pre") {
        return await ctx.db
          .select({ score: testScores.preTestScore })
          .from(testScores)
          .where(and(eq(testScores.entryId, input.entryId), eq(testScores.scoredBy, ctx.session.userId)));
      }

      return await ctx.db
        .select({ score: testScores.postTestScore })
        .from(testScores)
        .where(and(eq(testScores.entryId, input.entryId), eq(testScores.scoredBy, ctx.session.userId)));
    }),
});
