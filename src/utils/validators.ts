import { z } from "zod";

const ThreadShapeValidator = z.object({
    threadId: z.string(),
    fileId: z.string()
});
export type ThreadShape = z.infer<typeof ThreadShapeValidator>;

export const validateThreadShape = (data: any): ThreadShape => {
    return ThreadShapeValidator.parse(data);
};
