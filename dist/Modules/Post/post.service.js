"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const post_model_1 = require("../../DB/Models/post.model");
const comment_model_1 = require("../../DB/Models/comment.model");
class PostService {
    constructor() { }
    createPost = async (req, res) => {
        const { content } = req.body;
        const files = req.files || undefined;
        if (!content && !req.files?.length)
            throw new error_response_1.BadRequestException("Post must have content or attachments");
        const post = await post_model_1.PostModel.create({
            ...(content && { content }),
            ...(files?.length && { attachments: files.map((file) => file.path) }),
            createdBy: req.user?._id,
        });
        return res.status(201).json({ message: "Post Created Successfully", post });
    };
    getSpecificPost = async (req, res) => {
        const { postId } = req.params;
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            freezedAt: { $exists: false },
        }).populate("createdBy", "firtName lastName email");
        if (!post)
            throw new error_response_1.NotFoundException("Post Not Found");
        return res.status(200).json({ message: "Done", data: { post } });
    };
    toggleLikePost = async (req, res) => {
        const { postId } = req.params;
        const userId = req.user._id;
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            freezedAt: { $exists: false },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post Not Found");
        const alreadyLiked = post.likes?.some((id) => id.equals(userId));
        const updated = await post_model_1.PostModel.findByIdAndUpdate(postId, alreadyLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } }, { new: true });
        return res.status(200).json({
            message: alreadyLiked ? "Post unlike" : "Post like",
            data: { updated },
        });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const { content } = req.body;
        const post = await post_model_1.PostModel.findOneAndUpdate({
            _id: postId,
            createdBy: req.user._id,
        }, { content, $inc: { __v: 1 } }, { new: true });
        if (!post)
            throw new error_response_1.ForbiddenException("Post not found or you are not the author");
        return res
            .status(200)
            .json({ message: "Post Updated successfully", data: { post } });
    };
    deletePost = async (req, res) => {
        const { postId } = req.params;
        const post = await post_model_1.PostModel.findOneAndDelete({
            _id: postId,
            createdBy: req.user._id,
        });
        if (!post)
            throw new error_response_1.ForbiddenException("Post not found or you are not the author");
        return res.status(200).json({ message: "Post Deleted  successfully" });
    };
    /*-----------------------------------------------------------*/
    createComment = async (req, res) => {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        const post = await post_model_1.PostModel.findOne({
            _id: postId,
            freezedAt: { $exists: false },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found ");
        if (parentId) {
            const parent = await comment_model_1.CommentModel.findOne({ _id: parentId, postId });
            if (!parent)
                throw new error_response_1.NotFoundException("Parent Comment not exists");
        }
        const comment = await comment_model_1.CommentModel.create({
            postId,
            ...(parentId && { parentId }),
            content,
            createdBy: req.user._id,
        });
        return res
            .status(201)
            .json({ message: "Comment Created Successfully", data: { comment } });
    };
    updateComment = async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await comment_model_1.CommentModel.findOneAndUpdate({ _id: commentId, createdBy: req.user._id }, { content }, { new: true });
        if (!comment)
            throw new error_response_1.ForbiddenException("Comment not found or you are not the author");
        return res
            .status(200)
            .json({ message: "Comment Updated Successfully", data: { comment } });
    };
    deleteComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = await comment_model_1.CommentModel.findById(commentId);
        if (!comment)
            throw new error_response_1.NotFoundException("Comment Not Found");
        const post = await post_model_1.PostModel.findById(comment.postId);
        const isCommentAuthor = comment.createdBy.equals(req.user._id);
        const isPostOwner = post?.createdBy.equals(req.user._id);
        if (!isCommentAuthor && !isPostOwner)
            throw new error_response_1.ForbiddenException("not unthorized to delete this comment");
        await Promise.all([
            comment_model_1.CommentModel.deleteOne({ _id: commentId }),
            comment_model_1.CommentModel.deleteMany({ parentId: commentId }),
        ]);
        return res
            .status(200)
            .json({ message: "Comment Deleted Successfully", data: { comment } });
    };
}
exports.default = new PostService();
