import { requestIdParamsSchema, userIdParamsSchema } from "./user.validation";

import { z } from "zod";

export type IUserIdParamsDTO = z.infer<typeof userIdParamsSchema.params>;
export type IRequestIdParamsDTO = z.infer<typeof requestIdParamsSchema.params>;
