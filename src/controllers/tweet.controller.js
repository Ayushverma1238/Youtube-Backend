import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose from "mongoose";

const getAllTweet = asyncHandler(async (req, res) => {
  const page = Number(req.params.pages) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const tweets = await Tweet.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limits: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likeTweet",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: {
          ownerId: "$owner",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$channel", "$$ownerId"] },
                  {
                    $eq: [
                      "$subscriber",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "isSubscribed",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "tweet",
        as: "tweetComment",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "tweetOwner",
            },
          },
          {
            $unwind: {
              path: "$tweetOwner",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              updatedAt: 1,
              owner: {
                username: "$commentOwner.username",
                fullName: "$commentOwner.fullName",
                avatar: "$commentOwner.avatar",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          fullName: "$ownerDetails.fullName",
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
          subscriberCount: {
            $size: "$subscribers",
          },
          isSubscribed: {
            $gt: [{ $size: "$isSubscribed" }, 0],
          },
        },
        comments: "$videoComment",
        likes: "$likeTweet",
      },
    },
  ]);
  if (tweets.length === 0) {
    return res.status(400).json(new ApiResponse(400, [], "No tweet yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "All tweet fetched"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = Number(req.params.pages) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;
  const tweets = await Tweet.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likeTweet",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: {
          ownerId: "$owner",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$channel", "$$ownerId"] },
                  {
                    $eq: [
                      "$subscriber",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "isSubscribed",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "tweet",
        as: "tweetComment",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "tweetOwner",
            },
          },
          {
            $unwind: {
              path: "$tweetOwner",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              updatedAt: 1,
              owner: {
                username: "$commentOwner.username",
                fullName: "$commentOwner.fullName",
                avatar: "$commentOwner.avatar",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          fullName: "$ownerDetails.fullName",
          username: "$ownerDetails.username",
          avatar: "$ownerDetails.avatar",
          subscriberCount: {
            $size: "$subscribers",
          },
          isSubscribed: {
            $gt: [{ $size: "$isSubscribed" }, 0],
          },
        },
        comments: "$videoComment",
        likes: "$likeTweet",
      },
    },
  ]);

  if (tweets.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, [], "User is not posting any tweets"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched"));
});

// const getTweet = asyncHandler(async(req, res)=>{})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user?._id,
  });

  if (!deletedTweet) {
    throw new ApiResponse(400, "Unauthorized to delete this tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

const uploadTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const tweet = await Tweet.create({
    content,
    owenr: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while uploading a tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet uploaded successfully"));
});

export {
  getAllTweet,
  getUserTweet,
  //   getTweet,
  deleteTweet,
  //   updateTweet,
  uploadTweet,
};
