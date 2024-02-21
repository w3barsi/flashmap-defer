"use client";

import { UploadDropzone } from "~/lib/uploadthing";
import { api } from "~/trpc/react";

export default function FileDropzone() {
  const utils = api.useUtils();
  return (
    <UploadDropzone
      endpoint="threadFileUpload"
      className="h-80 cursor-pointer rounded-xl border-2 border-solid  border-black  shadow-[0.25rem_0.25rem_hsl(0,0%,0%)]"
      onClientUploadComplete={async (res) => {
        await utils.threads.getEntries.invalidate();
      }}
      appearance={{
        button: "bg-white text-black border-2 shadow-brut",
        uploadIcon: "hidden",
      }}
    />
  );
}
