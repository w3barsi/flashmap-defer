"use client";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function UserTest() {
  const { user } = useUser();

  return (
    <div>
      <div>
        <Button >Inngest</Button>
      </div>
    </div>
  );
}
