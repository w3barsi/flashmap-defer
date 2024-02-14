import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { env } from "~/env";
import { inngest } from "~/inngest/client";
import { db } from "~/server/db";
import { files, threads } from "~/server/db/schema";

const f = createUploadthing();

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const ourFileRouter = {
  threadFileUpload: f({
    blob: { maxFileSize: "128MB", maxFileCount: 1 },
    pdf: { maxFileSize: "128MB", maxFileCount: 1 },
    text: { maxFileSize: "128MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await currentUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(">>> start of onUploadComplete");
      const { key, url, name } = file;

      await db.insert(files).values({
        key,
        url,
        name,
        uploadedBy: metadata.userId,
      });

      await inngest.send({
        name: "test-timeout",
      });

      console.log(">>> end of onUploadComplete");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
