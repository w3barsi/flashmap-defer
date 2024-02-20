import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import PreTest from "~/app/_components/pre-test";
import { api } from "~/trpc/server";


export default async function Page({ params }: { params: { id: string } }) {
  const [preTest] = await api.quiz.getScore.query({entryId: params.id, testType: "pre"})

  if(preTest?.score != null){
    return <div className="flex flex-col h-screen items-center justify-center text-4xl"><h1>Your pre-test score is: {preTest.score}</h1><Link  className="underline hover:underline-offset-4" href="/">Return to home</Link></div>
  }


  return (<PreTest entryId={params.id}/>)
}
