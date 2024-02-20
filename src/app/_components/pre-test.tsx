
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const choicesSchema = z.array(z.string());

export default function PreTest( props : {  entryId: string  }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<number[]>([4, 4, 4, 4]);
  // const { data } = api.quiz.getQuestions.useQuery({ entryId: props.entryId });
  const {mutate} = api.quiz.checkPretestScores.useMutation({onSuccess: () => {
    router.refresh()
  }})
  const tempData = {
    title: "Test Title",
    questions: [
      {
        id: "hlkghwghnte2",
        entryId: "ujc78ujjr9fd",
        number: 0,
        question: "What primarily concerns electronics?",
        choices:
          '["Mechanical engineering","Transistor and microchip circuit design","Food technology","Cosmology"]',
      },
      {
        id: "c22u3cwurzr8",
        entryId: "ujc78ujjr9fd",
        number: 1,
        question: "What is an example of an input device?",
        choices: '["Keyboard","Speaker","Projector","Printer"]',
      },
      {
        id: "y4jojthctdtv",
        entryId: "ujc78ujjr9fd",
        number: 2,
        question: "What does an output device do?",
        choices: `["Input data to the computer","Receive and translate information from the computer","Charge the computer","Cool down the computer's hardware"]`,
      },
      {
        id: "r48ihfnrawj3",
        entryId: "ujc78ujjr9fd",
        number: 3,
        question: "Which of the following is an output device?",
        choices: '["Mouse","Headphones","Scanner","Webcam"]',
      },
    ],
  };

  const onChoicesClick = (props: {
    questionNumber: number;
    answerIdx: number;
  }) => {
    console.log(props.questionNumber, props.answerIdx);
    const newAnswers = [...answers];
    newAnswers[props.questionNumber] = props.answerIdx;
    setAnswers(newAnswers);
    console.log()
  };

  const onSubmitAnswers = () => {
    if(answers.includes(4)) {
      return alert("Please answer all questions!")
    }
    mutate({answers, entryId: props.entryId})
  }

  return (
    <div>
      <MaxWidthWrapper className="flex flex-col text-3xl h-32 max-w-screen-md items-center justify-center">
        <h1 className="font-extrabold">{tempData.title}</h1>
        <h3 className="font-semibold">[PRE-TEST]</h3>
      </MaxWidthWrapper>
      <div className="flex w-full flex-col gap-3">
        {tempData?.questions.map((q, questionIdx) => {
          const choices = choicesSchema.parse(JSON.parse(q.choices));
          return (
            <MaxWidthWrapper
              key={q.id}
              className="flex max-w-screen-md flex-col items-start gap-3 rounded-xl border-2 p-3 shadow-brut
              [&:nth-child(3n-1)]:shadow-yellow-400
              [&:nth-child(3n-2)]:shadow-red-400
              [&:nth-child(3n-3)]:shadow-blue-400
              "
            >
              <h3 className="text-3xl">
                {questionIdx + 1}) {q.question}
              </h3>
              <div className="flex w-full flex-col items-start justify-start gap-2">
                {choices.map((c, choicesIdx) => (
                  <button
                    className={cn(
                      "w-full rounded-xl border-2 p-2 text-left shadow-brut transition-shadow",
                      {
                        "bg-black text-white shadow-none":
                          answers[q.number] === choicesIdx,
                      },
                    )}
                    key={c}
                    onClick={() =>
                      onChoicesClick({
                        questionNumber: q.number,
                        answerIdx: choicesIdx,
                      })
                    }
                  >
                    <p>{c}</p>
                  </button>
                ))}
              </div>
            </MaxWidthWrapper>
          );
        })}
        <MaxWidthWrapper className="flex max-w-screen-md justify-end">
          <Button className="bg-green-500 text-xl hover:bg-green-800" onClick={onSubmitAnswers}>
            Submit Answers
          </Button>
        </MaxWidthWrapper>
      </div>
    </div>
  );
}
