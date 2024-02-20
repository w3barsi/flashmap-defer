import { api } from "~/trpc/server";
import FileDropzone from "./_components/dropzone";
import FileList from "./_components/file-list";
import MaxWidthWrapper from "./_components/max-width-wrapper";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import TestButton from "./_components/test-button";

export default async function Home() {
  const threads = await api.threads.getThreads.query();
  console.log(threads);


  return (
    <main className="flex min-h-screen flex-col items-center bg-white p-3 transition-all">
      <MaxWidthWrapper className="flex justify-between h-12 items-center">
        <h1>Flashmap</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <UserButton />
        </Suspense>
      </MaxWidthWrapper>
      <MaxWidthWrapper>
        <FileDropzone />
      </MaxWidthWrapper>
      <MaxWidthWrapper>
        <h1 className="p-3 pt-5 text-4xl">Uploaded Files:</h1>
        <FileList initialThreads={threads} />
      </MaxWidthWrapper>
      <TestButton/>
    </main>
  );
}
