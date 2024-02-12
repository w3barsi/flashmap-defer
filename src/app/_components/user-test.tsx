"use client";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function UserTest() {
  const { user } = useUser();
  const {mutate} = api.inngest.hello.useMutation()

  return (
    <div>
      {user?.publicMetadata.role}
      <div>
        <Button onClick={() => mutate()}>Inngest</Button>
      </div>
    </div>
  );
}
