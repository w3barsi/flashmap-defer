import { z } from "zod";

const ThreadShapeValidator = z.object({
  threadId: z.string(),
  fileId: z.string(),
});

const InngestCreateFileValidator = z.object({
  fileUrl: z.string(),
  userId: z.string()
});

export type ThreadShape = z.infer<typeof ThreadShapeValidator>;
export type InngestCreateFileInput = z.infer<typeof InngestCreateFileValidator>;

export const validateInngestCreateFileInput = (data: any): InngestCreateFileInput => {
  return InngestCreateFileValidator.parse(data);
};

export const validateThreadShape = (data: any): ThreadShape => {
  return ThreadShapeValidator.parse(data);
};

export const questionsSchema = z.object({
  answers: z.array(z.number()),
  quiz: z.array(z.object({
    question: z.string(),
    choices: z.array(z.string())
  }))
})
