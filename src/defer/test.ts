import { defer } from "@defer/client"

async function waitTen() {
  await new Promise((resolve) => setTimeout(resolve, 10_000))
}

export default defer(waitTen)
