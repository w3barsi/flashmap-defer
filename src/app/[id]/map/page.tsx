import { redirect } from "next/navigation";
import MindmapRenderer from "~/app/_components/mindmap-renderer";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  const initValue = await api.threads.getMindmapMarkdown.query({threadId: id});
  if(!initValue?.markdown){
    redirect("/")
  }

  return <MindmapRenderer markdown={initValue?.markdown} />;
}
