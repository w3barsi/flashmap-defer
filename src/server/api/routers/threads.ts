import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { flashcards, mindmap, entries } from "~/server/db/schema";

export const threadsRouter = createTRPCRouter({
  getEntry: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const val = await ctx.db
        .select({
          id: entries.id,
          title: entries.title,
          creationStatus: entries.creationStatus,
          flashcardStatus: entries.flashcardStatus,
          mindmapStatus: entries.mindmapStatus,
          titleStatus: entries.titleStatus,
          quizStatus: entries.quizStatus,
        })
        .from(entries)
        .where(
          and(
            eq(entries.createdBy, ctx.session.userId),
            ne(entries.isDeleted, true),
            eq(entries.id, input.entryId)
          ),
        );
      return val[0];
    }),
  getAdminEntries: protectedProcedure.query(async ({ ctx }) => {
    const val = await ctx.db
      .select({
        id: entries.id,
        title: entries.title,
        creationStatus: entries.creationStatus,
        flashcardStatus: entries.flashcardStatus,
        mindmapStatus: entries.mindmapStatus,
        titleStatus: entries.titleStatus,
        quizStatus: entries.quizStatus,
      })
      .from(entries)
      .where(
        and(
          eq(entries.createdBy, "user_2cZv9XlqXoBTxgSJJSXAFMTEshF"),
          ne(entries.isDeleted, true),
        ),
      );
    return val;
  }),
  getEntries: protectedProcedure.query(async ({ ctx }) => {
    const val = await ctx.db
      .select({
        id: entries.id,
        title: entries.title,
        creationStatus: entries.creationStatus,
        flashcardStatus: entries.flashcardStatus,
        mindmapStatus: entries.mindmapStatus,
        titleStatus: entries.titleStatus,
        quizStatus: entries.quizStatus,
      })
      .from(entries)
      .where(
        and(
          eq(entries.createdBy, ctx.session.userId),
          ne(entries.isDeleted, true),
        ),
      );
    return val;
  }),
  getCards: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .query(({ ctx, input }) => {
      const val = ctx.db
        .select()
        .from(flashcards)
        .where(and(eq(flashcards.entryId, input.entryId)));
      return val;
    }),
  getMindmapMarkdown: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const md = await ctx.db
        .select()
        .from(mindmap)
        .where(eq(mindmap.threadId, input.threadId));
      console.log(md);
      return md[0];
    }),
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(entries)
        .set({ isDeleted: true })
        .where(eq(entries.id, input.threadId));
    }),
});
