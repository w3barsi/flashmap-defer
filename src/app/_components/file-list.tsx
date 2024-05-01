"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Dot, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { FileList, ThreadType } from "~/server/db/types";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function FileListEntry(props: { entry: FileList }) {
  const {user} = useUser()

  const utils = api.useUtils();
  const {
    data: entry,
    isFetching,
    isRefetching,
    isError
  } = api.threads.getEntry.useQuery(
    { entryId: props.entry.id },
    {
      initialData: props.entry,
      refetchInterval: (data) =>
        data?.creationStatus === "done" || data?.creationStatus === "error"
          ? false
          : 5000,
    },
  );

  if(isError){
    console.log("FUUUUUUUUCK")
  }


  const { mutate } = api.threads.deleteThread.useMutation({
    onSuccess: async () => {
      await utils.threads.getEntries.invalidate();
    },
  });

  if (isFetching) {
    console.log(`Fetching ${entry?.id} : ${entry?.creationStatus}`);
  }

  if (isRefetching) {
    console.log(`Refetching ${entry?.id} : ${entry?.creationStatus}`);
  }

  return (
    <li
      className="flex h-24 flex-row items-center rounded-xl border-2 p-3 shadow-brut 
              [&:nth-child(3n-1)]:shadow-yellow-400
              [&:nth-child(3n-2)]:shadow-red-400
              [&:nth-child(3n-3)]:shadow-blue-400
              "
    >
      <h3 className="w-full">{entry?.title ?? "Creating title..."}</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-0">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={entry?.flashcardStatus === "created" ? false : true}
            asChild
          >
            <Link href={`/${entry?.id}/cards`}>
              <Dot
                className={cn(
                  {
                    "animate-pulse text-yellow-500":
                      entry!.flashcardStatus === "creating",
                  },
                  { "text-green-500": entry!.flashcardStatus === "created" },
                  { "text-red-500": entry!.flashcardStatus === "error" },
                )}
              />
              Flashcards
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={entry!.mindmapStatus === "created" ? false : true}
            asChild
          >
            <Link href={`/${entry!.id}/map`}>
              <Dot
                className={cn(
                  {
                    "animate-pulse text-yellow-500":
                      entry!.mindmapStatus === "creating",
                  },
                  { "text-green-500": entry!.mindmapStatus === "created" },
                  { "text-red-500": entry!.mindmapStatus === "error" },
                )}
              />
              Mindmap
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={entry!.quizStatus === "created" ? false : true}
            asChild
          >
            <Link href={`/${entry!.id}/pretest`}>
              <Dot
                className={cn(
                  {
                    "animate-pulse text-yellow-500":
                      entry!.quizStatus === "creating",
                  },
                  { "text-green-500": entry!.quizStatus === "created" },
                  { "text-red-500": entry!.quizStatus === "error" },
                )}
              />
              Pre-test
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={entry!.quizStatus === "created" ? false : true}
            asChild
          >
            <Link href={`/${entry!.id}/posttest`}>
              <Dot
                className={cn(
                  {
                    "animate-pulse text-yellow-500":
                      entry!.quizStatus === "creating",
                  },
                  { "text-green-500": entry!.quizStatus === "created" },
                  { "text-red-500": entry!.quizStatus === "error" },
                )}
              />
              Post-test
            </Link>
          </DropdownMenuItem>
          {user?.id === "user_2cZv9XlqXoBTxgSJJSXAFMTEshF" ?
            <DropdownMenuItem
            onClick={() => mutate({ threadId: entry!.id })}
            className="flex justify-center  bg-red-500 text-white focus:bg-red-400 focus:text-white"
            >
            Delete
            </DropdownMenuItem>
            : null
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export default function FileList(props: { initialThreads: FileList[] }) {
  const { data: threads } = api.threads.getEntries.useQuery(undefined, {
    initialData: props.initialThreads,
    staleTime: Infinity,
  });

  return (
    <ul className="flex w-full flex-col gap-3 md:grid md:grid-cols-2">
      {threads?.map((cell) => <FileListEntry key={cell.id} entry={cell} />)}
    </ul>
  );
}
