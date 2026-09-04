"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostType = exports.UserType = void 0;
const graphql_1 = require("graphql");
const user_model_1 = require("../../DB/Models/user.model");
exports.UserType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        password: { type: graphql_1.GraphQLString },
        gender: { type: graphql_1.GraphQLString },
        role: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        profilePic: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        deviceTokens: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        coverImage: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLString)) },
        fullname: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => `${parent.firstName} ${parent.lastName}`,
        },
    }),
});
exports.PostType = new graphql_1.GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLString)) },
        author: {
            type: exports.UserType,
            resolve: (parent) => {
                return user_model_1.UserModel.findById(parent.createdBy);
            },
        },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    }),
});
