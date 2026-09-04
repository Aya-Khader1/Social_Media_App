import { HUserDocument } from "./../../DB/Models/user.model";
import { decodedToken } from "./../../Utils/security/token";
export interface IGraphQLContext {
  user?: HUserDocument;
}

export const buildContext = async (
  authorization: string | undefined,
): Promise<IGraphQLContext> => {
  if (!authorization) return {};
  try {
    const { user } = await decodedToken({ authorization });
    return { user };
  } catch (error) {
    return {};
  }
};
