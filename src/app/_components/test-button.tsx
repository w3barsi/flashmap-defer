"use client"

import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export default function TestButton() {
const {mutateAsync} = api.defer.questions.useMutation()
  return (<Button onClick={async () => await mutateAsync()}>Test OpenAI</Button>)
}
