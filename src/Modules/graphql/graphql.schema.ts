import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
} from "graphql";
import { PostType, UserType } from "./grahpql.types";
import { UnauthorizedException } from "../../Utils/response/error.response";
import { PostModel } from "../../DB/Models/post.model";
const rootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    me: {
      type: UserType,
      resolve: (_parent, _args, context) => {
        if (!context.user)
          throw new UnauthorizedException(
            "You must be logged in to access this resource",
          );
        return context.user;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: (_parent, args, context) => {
        if (!context.user)
          throw new UnauthorizedException(
            "You must be logged in to access this resource",
          );
        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        const authors = context.user.id;
        return PostModel.find({ createdBy: authors })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: rootQuery,
});
