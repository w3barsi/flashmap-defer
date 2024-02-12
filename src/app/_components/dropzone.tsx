"use client";

import { UploadDropzone } from "~/lib/uploadthing";

export default function FileDropzone() {
  return (
    <UploadDropzone
      endpoint="threadFileUpload"
      className="h-80 rounded-xl border-2 border-solid cursor-pointer  border-black  shadow-[0.25rem_0.25rem_hsl(0,0%,0%)]"
      appearance={{
      button: "bg-white text-black border-2 shadow-brut",
      uploadIcon: "hidden"
      }}
    />
  );
}
