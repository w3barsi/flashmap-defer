import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
export default function FileList(props: { topics: string[] }) {
  return (
    <ul className="flex w-full flex-col gap-3 md:grid md:grid-cols-2">
      {props.topics.map((cell, i) => (
        <li
          key={i}
          className="flex h-24 flex-row items-center rounded-xl border-2 p-3 shadow-brut 
              [&:nth-child(3n-1)]:shadow-yellow-400
              [&:nth-child(3n-2)]:shadow-red-400
              [&:nth-child(3n-3)]:shadow-blue-400
              "
        >
          <h3 className="w-full">{cell}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="p-0">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Flashcards</DropdownMenuItem>
              <DropdownMenuItem>Mindmap</DropdownMenuItem>
              <DropdownMenuItem>Pre-test</DropdownMenuItem>
              <DropdownMenuItem>Post-test</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
  );
}
