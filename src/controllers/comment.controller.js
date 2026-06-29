import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";

const commentOnVideo = asyncHandler(async (req, res) => {
  const { content, videoId } = req.body;
  if (!content || !videoId) {
    throw new ApiError(400, "Content and videoIs is required");
  }

  const commentedVideo = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!commentedVideo) {
    throw new ApiError(500, "Something went wrong, comment video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentedVideo, "Comment on video successful"));
});

const commentOnTweet = asyncHandler(async (req, res) => {
  const { content, tweetId } = req.body;
  if (!content || !tweetId) {
    throw new ApiError(400, "Content and tweetIs is required");
  }

  const commentedtweet = await Comment.create({
    content,
    tweet: tweetId,
    owner: req.user._id,
  });

  if (!commentedtweet) {
    throw new ApiError(500, "Something went wrong, comment tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentedtweet, "Comment on tweet successful"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findOneAndDelete({
    _id: id,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export { commentOnTweet, commentOnVideo, deleteComment };
