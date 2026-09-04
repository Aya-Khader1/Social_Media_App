"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const grahpql_types_1 = require("./grahpql.types");
const error_response_1 = require("../../Utils/response/error.response");
const post_model_1 = require("../../DB/Models/post.model");
const rootQuery = new graphql_1.GraphQLObjectType({
    name: "Query",
    fields: {
        me: {
            type: grahpql_types_1.UserType,
            resolve: (_parent, _args, context) => {
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("You must be logged in to access this resource");
                return context.user;
            },
        },
        posts: {
            type: new graphql_1.GraphQLList(grahpql_types_1.PostType),
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: (_parent, args, context) => {
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("You must be logged in to access this resource");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                const authors = context.user.id;
                return post_model_1.PostModel.find({ createdBy: authors })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
            },
        },
    },
});
exports.schema = new graphql_1.GraphQLSchema({
    query: rootQuery,
});
