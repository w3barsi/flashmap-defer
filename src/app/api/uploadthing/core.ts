import { currentUser } from "@clerk/nextjs";
import OpenAI from "openai";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { entries, files } from "~/server/db/schema";
import createEntry from "~/defer/flashmap"
import createQuestions from "~/defer/questions"

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

      const entry = await db.insert(entries).values(
        {
          fileS3Url: url,
          createdBy: metadata.userId,
        }
      ).returning().get()

      await createEntry({
        fileS3Url: url,
        userId: metadata.userId,
        entryId: entry.id
      })



      console.log(">>> end of onUploadComplete");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
