import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { flashcards, mindmap, entries } from "~/server/db/schema";

export const threadsRouter = createTRPCRouter({
  getThreads: protectedProcedure.query(({ ctx }) => {
    const val = ctx.db
      .select()
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
