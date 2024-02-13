export const maxDuration = 240
import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { createCards, createFile, createMindmap } from "~/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createCards, createMindmap, createFile],
});
