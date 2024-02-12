import { currentUser, useUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import UserTest from "./_components/user-test";
import MaxWidthWrapper from "./_components/max-width-wrapper";
import FileDropzone from "./_components/dropzone";
import FileList from "./_components/file-list";

export default async function Home() {
  const topics = [
    " Algebra and Geometry ",
    " Biology: Cells, Genetics, Evolution ",
    " World History: Ancient to Modern ",
    " Literature: Novels, Plays, Poems ",
    " Chemistry: Matter, Reactions, Atomic Structure ",
    " Physics: Forces, Energy, Motion ",
    " Spanish: Language, Culture, Communication ",
    " Environmental Science: Ecology, Conservation, Sustainability ",
    " Economics: Supply, Demand, Market Systems ",
    " Computer Science: Coding, Algorithms, Software Development ",
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-white p-3 transition-all">
      <MaxWidthWrapper>
        <FileDropzone />
      </MaxWidthWrapper>
      <MaxWidthWrapper>
        <h1 className="p-3 pt-5 text-4xl">Uploaded Files:</h1>
        <FileList topics={topics} />
      </MaxWidthWrapper>
    </main>
  );
}
