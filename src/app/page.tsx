import { currentUser, useUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import UserTest from "./_components/user-test";

export default async function Home() {
  noStore();
  const user = await currentUser();
  console.log(">>>",user?.publicMetadata)

  const hello = await api.post.hello.query({ text: "from tRPC" });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <UserTest />
    </main>
  );
}
