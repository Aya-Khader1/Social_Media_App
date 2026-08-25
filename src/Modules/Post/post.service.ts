import { Request, Response } from "express";
import {
  ICreateCommentDTO,
  ICreatePostDTO,
  IPostIdParamsDTO,
  IUpdatePostDTO,
  ICommentIdParamsDTO,
  IUpdateCommentDTO,
} from "./post.dto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { PostModel } from "../../DB/Models/post.model";
import { CommentModel } from "../../DB/Models/comment.model";

class PostService {
  constructor() {}
  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content }: ICreatePostDTO = req.body;
    const files = (req.files as Express.Multer.File[]) || undefined;
    if (!content && !req.files?.length)
      throw new BadRequestException("Post must have content or attachments");

    const post = await PostModel.create({
      ...(content && { content }),
      ...(files?.length && { attachments: files.map((file) => file.path) }),
      createdBy: req.user?._id,
    });
    return res.status(201).json({ message: "Post Created Successfully", post });
  };
  getSpecificPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    }).populate("createdBy", "firtName lastName email");
    if (!post) throw new NotFoundException("Post Not Found");

    return res.status(200).json({ message: "Done", data: { post } });
  };
  toggleLikePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const userId = req!.user._id;
    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("Post Not Found");
    const alreadyLiked = post.likes?.some((id) => id.equals(userId));
    const updated = await PostModel.findByIdAndUpdate(
      postId,
      alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { new: true },
    );

    return res.status(200).json({
      message: alreadyLiked ? "Post unlike" : "Post like",
      data: { updated },
    });
  };
  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const { content }: IUpdatePostDTO = req.body;
    const post = await PostModel.findOneAndUpdate(
      {
        _id: postId,
        createdBy: req.user!._id,
      },
      { content, $inc: { __v: 1 } },
      { new: true },
    );
    if (!post)
      throw new ForbiddenException("Post not found or you are not the author");

    return res
      .status(200)
      .json({ message: "Post Updated successfully", data: { post } });
  };
  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const post = await PostModel.findOneAndDelete({
      _id: postId,
      createdBy: req.user!._id,
    });
    if (!post)
      throw new ForbiddenException("Post not found or you are not the author");

    return res.status(200).json({ message: "Post Deleted  successfully" });
  };

  /*-----------------------------------------------------------*/
  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const { content, parentId }: ICreateCommentDTO = req.body;
    const post = await PostModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("Post not found ");
    if (parentId) {
      const parent = await CommentModel.findOne({ _id: parentId, postId });
      if (!parent) throw new NotFoundException("Parent Comment not exists");
    }
    const comment = await CommentModel.create({
      postId,
      ...(parentId && { parentId }),
      content,
      createdBy: req.user!._id,
    });
    return res
      .status(201)
      .json({ message: "Comment Created Successfully", data: { comment } });
  };
  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIdParamsDTO = req.params as {
      commentId: string;
    };
    const { content }: IUpdateCommentDTO = req.body;
    const comment = await CommentModel.findOneAndUpdate(
      { _id: commentId, createdBy: req.user!._id },
      { content },
      { new: true },
    );
    if (!comment)
      throw new ForbiddenException(
        "Comment not found or you are not the author",
      );
    return res
      .status(200)
      .json({ message: "Comment Updated Successfully", data: { comment } });
  };
  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIdParamsDTO = req.params as {
      commentId: string;
    };
    const comment = await CommentModel.findById(commentId);
    if (!comment) throw new NotFoundException("Comment Not Found");
    const post = await PostModel.findById(comment.postId);
    const isCommentAuthor = comment.createdBy.equals(req.user!._id);
    const isPostOwner = post?.createdBy.equals(req.user!._id);

    if (!isCommentAuthor && !isPostOwner)
      throw new ForbiddenException("not unthorized to delete this comment");

    await Promise.all([
      CommentModel.deleteOne({ _id: commentId }),
      CommentModel.deleteMany({ parentId: commentId }),
    ]);
    return res
      .status(200)
      .json({ message: "Comment Deleted Successfully", data: { comment } });
  };
}

export default new PostService();
