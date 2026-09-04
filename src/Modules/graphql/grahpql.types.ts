import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { UserModel } from "../../DB/Models/user.model";

export const UserType: any = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    gender: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    profilePic: { type: GraphQLString },
    friends: { type: new GraphQLList(GraphQLID) },
    deviceTokens: { type: new GraphQLList(GraphQLID) },

    coverImage: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
    fullname: {
      type: GraphQLString,
      resolve: (parent) => `${parent.firstName} ${parent.lastName}`,
    },
  }),
});
export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    attachments: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
    author: {
      type: UserType,
      resolve: (parent) => {
        return UserModel.findById(parent.createdBy);
      },
    },
    likes: { type: new GraphQLList(GraphQLID) },
    tags: { type: new GraphQLList(GraphQLID) },
  }),
});
