"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const { data } = api.threads.getCards.useQuery({ entryId: id });
  console.log(data)
  return (
    <div className="flex h-screen snap-y snap-mandatory flex-col overflow-y-scroll ">
      {data?.map((d, i) => {
        return (
          <Flashcard
            data={{ keyword: d.keyword, definition: d.definition }}
            key={i}
          />
        );
      })}
    </div>
  );
}

const Flashcard = ({
  data,
}: {
  data: {
    keyword: string;
    definition: string;
  };
}) => {
  const [ref] = useAutoAnimate();
  const [isRevealed, setIsRevealed] = useState(false);
  const size = useWindowSize();
  const { keyword, definition } = data;

  useEffect(() => {
    console.log(isRevealed);
  }, [isRevealed]);

  return (
    <div
      onClick={() => setIsRevealed((prev) => !prev)}
      className="flex min-h-screen snap-start flex-col items-center  justify-center p-3 odd:bg-yellow-500 even:bg-green-500"
    >
      <div
        ref={ref}
        className=" flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded bg-neutral-50 "
      >

        <div className="text-balance text-center max-w-2xl">{definition}</div>
        {isRevealed && (
            <div className="text-4xl font-bold ">{keyword}</div>
        )}
        <div className="absolute bottom-4">Click card to reveal answer</div>
      </div>
    </div>
  );
};
