import { inngest } from "~/inngest/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const deferRouter = createTRPCRouter({
  hello: publicProcedure
    .mutation(async () => {
      await inngest.send({
        name:"test/hello.world",
        data: {
          email: "test@test.com"
        }
      })
      return "test"
    }),
});
