import OpenAI from "openai";
import { env } from "~/env";

export default async function Page() {
  const openai = new OpenAI({
    apiKey: env.OPENAI_KEY,
  });

  const title = await openai.beta.threads.messages.list(
    "thread_e3lb13ul3chhgkkeVmWWXCyw",
  );
  // console.log(title.data[0]?.content[0].text.value);
  // const card = await openai.beta.threads.messages.list("thread_3Iujh9QlrZS8IeQpxbfzHnjz");
  // console.log(card.data[0]?.content[0].text.value)
  // const map = await openai.beta.threads.messages.list("thread_gUNmmNc6pszCfwIfaw32Sx6r");
  // console.log(map.data[0]?.content[0].text.value)
  return <div>a</div>;
}
