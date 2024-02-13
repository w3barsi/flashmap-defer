import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { flashcards, mindmap, threads } from "~/server/db/schema";

export const threadsRouter = createTRPCRouter({
  getThreads: protectedProcedure.query(({ ctx }) => {
    const val = ctx.db
      .select()
      .from(threads)
      .where(
        and(
          eq(threads.createdBy, ctx.session.userId),
          ne(threads.isDeleted, true),
        ),
      );
    return val;
  }),
  getCards: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(({ ctx, input }) => {
      const val = ctx.db
        .select()
        .from(flashcards)
        .where(and(eq(flashcards.threadId, input.threadId)));
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
        .update(threads)
        .set({ isDeleted: true })
        .where(eq(threads.id, input.threadId));
    }),
});
