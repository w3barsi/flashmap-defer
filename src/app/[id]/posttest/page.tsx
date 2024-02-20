import Link from "next/link";
import PostTest from "~/app/_components/post-test";
import { api } from "~/trpc/server";


export default async function Page({ params }: { params: { id: string } }) {
  const [preTest] = await api.quiz.getScore.query({entryId: params.id, testType: "post"})

  if(preTest?.score != null){
    return <div className="flex flex-col h-screen items-center justify-center text-4xl"><h1>Your pre-test score is: {preTest.score}</h1><Link  className="underline hover:underline-offset-4" href="/">Return to home</Link></div>
  }


  return (<PostTest entryId={params.id}/>)
}
