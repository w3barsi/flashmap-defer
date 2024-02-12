"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function OnboardingPicker() {
  const router = useRouter();
  const { user } = useUser();
  const { mutate } = api.clerk.hello.useMutation({
    onSuccess: async () => {
      await user?.reload();
      router.push("/");
    },
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1>Pick a role</h1>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex h-32 w-32 items-center justify-center rounded border"
          onClick={() => mutate({ role: "teacher" })}
        >
          Teacher
        </Button>
        <Button
          variant="ghost"
          className="flex h-32 w-32 items-center justify-center rounded border"
          onClick={() => mutate({ role: "student" })}
        >
          Student
        </Button>
      </div>
    </div>
  );
}
