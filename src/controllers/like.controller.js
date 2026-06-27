import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";

const likeVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?.params
    const alreadyLiked = await Like.findOneAndUpdate({
        video:videoId,
        likedBy: userId
    });

    if(alreadyLiked){
        return res.status(204).json(
            new ApiResponse(204, {liked:false}, "Video unlike")
        )
    }

    const like = await Like.create({
        video:videoId,
        likeBy : userId
    })

    if(!like){
        throw new ApiError(500, "Something went wrong!(Video Like)")
    }

    return res.status(200).json(
        new ApiResponse(200, {liked:true}, "Video liked successfully")
    )

});

const likeTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?.params
    const alreadyLiked = await Like.findOneAndUpdate({
        tweet:tweetId,
        likedBy: userId
    });

    if(alreadyLiked){
        return res.status(204).json(
            new ApiResponse(204, {liked:false}, "tweet unlike")
        )
    }

    const like = await Like.create({
        tweet:tweetId,
        likeBy : userId
    })

    if(!like){
        throw new ApiError(500, "Something went wrong!(tweet Like)")
    }

    return res.status(200).json(
        new ApiResponse(200, {liked:true}, "tweet liked successfully")
    )
});

const likeComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?.params
    const alreadyLiked = await Like.findOneAndUpdate({
        comment:commentId,
        likedBy: userId
    });

    if(alreadyLiked){
        return res.status(204).json(
            new ApiResponse(204, {liked:false}, "comment unlike")
        )
    }

    const like = await Like.create({
        comment:commentId,
        likeBy : userId
    })

    if(!like){
        throw new ApiError(500, "Something went wrong!(comment Like)")
    }

    return res.status(200).json(
        new ApiResponse(200, {liked:true}, "comment liked successfully")
    )
});

export { likeComment, likeVideo, likeTweet };
