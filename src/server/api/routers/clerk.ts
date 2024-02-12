import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const clerkRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ role: z.enum(["teacher", "student"]) }))
    .mutation(async ({ input, ctx }) => {
      const {role} = input
      console.log(ctx.session.sessionClaims?.metadata.role)
      await clerkClient.users.updateUserMetadata(ctx.session.userId, {
        publicMetadata: {
          role,
        },
      });
    }),
});
