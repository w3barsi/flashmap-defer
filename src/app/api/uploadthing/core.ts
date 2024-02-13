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
      const { key, url, name } = file;

      await db.insert(files).values({
        key,
        url,
        name,
        uploadedBy: metadata.userId,
      });

      let thread = await db
        .insert(threads)
        .values({
          fileUrl: url,
          createdBy: metadata.userId,
        })
        .returning();



      console.log(">>> CREATING FILE!!!")
      const fileId = await openai.files.create({
        file: await fetch(thread[0]!.fileUrl),
        purpose: "assistants",
      });
      console.log("<<< CREATED FILE")


      thread = await db
        .update(threads)
        .set({
          openaiFileId: fileId.id,
        })
        .where(eq(threads.id, thread[0]!.id))
        .returning();

      console.log("EXECUTING THREADS")
      console.log(thread);


      console.log(">>> RUNNING INGEST flashmap/create.cards")
      await inngest.send({
        name: "flashmap/create.cards",
        data: {
          threadId: thread[0]?.id,
          fileId: fileId.id

        },
      });

      console.log(">>> RUNNING INGEST flashmap/create.cards")
      await inngest.send({
        name: "flashmap/create.mindmap",
        data: {
          threadId: thread[0]?.id,
          fileId: fileId.id

        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
