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
import type { ThreadType } from "~/server/db/types";
import { api } from "~/trpc/react";
import Link from "next/link";
export default function FileList(props: { initialThreads: ThreadType[] }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: threads } = api.threads.getThreads.useQuery(undefined, {
    initialData: props.initialThreads,
  });
  const { mutate } = api.threads.deleteThread.useMutation({
    onSuccess: async () => {
      await utils.threads.getThreads.invalidate();
    },
  });

  return (
    <ul className="flex w-full flex-col gap-3 md:grid md:grid-cols-2">
      {threads?.map((cell) => (
        <li
          key={cell.id}
          className="flex h-24 flex-row items-center rounded-xl border-2 p-3 shadow-brut 
              [&:nth-child(3n-1)]:shadow-yellow-400
              [&:nth-child(3n-2)]:shadow-red-400
              [&:nth-child(3n-3)]:shadow-blue-400
              "
        >
          <h3 className="w-full">{cell.title ?? "Creating title..."}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="p-0">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={cell.flashcardStatus === "created" ? false : true}
                asChild
              >
                <Link href={`/${cell.id}/cards`}>
                  <Dot
                    className={cn(
                      {
                        "animate-pulse text-yellow-500":
                          cell.flashcardStatus === "creating",
                      },
                      { "text-green-500": cell.flashcardStatus === "created" },
                      { "text-red-500": cell.flashcardStatus === "error" },
                    )}
                  />
                  Flashcards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={cell.mindmapStatus === "created" ? false : true}
                asChild
              >
                <Link href={`/${cell.id}/map`}>
                  <Dot
                    className={cn(
                      {
                        "animate-pulse text-yellow-500":
                          cell.mindmapStatus === "creating",
                      },
                      { "text-green-500": cell.mindmapStatus === "created" },
                      { "text-red-500": cell.mindmapStatus === "error" },
                    )}
                  />
                  Mindmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={cell.testStatus === "created" ? false : true}
              >
                <Dot
                  className={cn(
                    {
                      "animate-pulse text-yellow-500":
                        cell.testStatus === "creating",
                    },
                    { "text-green-500": cell.testStatus === "created" },
                    { "text-red-500": cell.testStatus === "error" },
                  )}
                />
                Pre-test
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={cell.testStatus === "created" ? false : true}
              >
                <Dot
                  className={cn(
                    {
                      "animate-pulse text-yellow-500":
                        cell.testStatus === "creating",
                    },
                    { "text-green-500": cell.testStatus === "created" },
                    { "text-red-500": cell.testStatus === "error" },
                  )}
                />
                Post-test
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => mutate({ threadId: cell.id })}
                className="flex justify-center  bg-red-500 text-white focus:bg-red-400 focus:text-white"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
  );
}
