import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllPublishedVideos = asyncHandler(async (req, res) => {
  const page = Number(req.params.pages) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;
  const videos = await Videos.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        isPublish: true,
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
        as: "ownerDetail",
      },
    },
    {
      $unwind: "$ownerDetail",
    },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetail.username",
          fullName: "$ownerDetail.fullName",
          avatar: "$ownerDetail.avatar",
        },
      },
    },
  ]);
  if (videos.length < 1) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No video found! Please upload some videos")
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos fetch successfully"));
});

const getVideoPageDetail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });
  const videoDetail = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
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
        foreignField: "video",
        as: "videoLikes",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: {
          videoId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", "$$videoId"] },
                  {
                    $eq: [
                      "$likedBy",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "isLiked",
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
        foreignField: "video",
        as: "videoComment",
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
              as: "commentOwner",
            },
          },
          {
            $unwind: {
              path: "$commentOwner",
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
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublish: 1,
        likesCount: { $size: "$videoLikes" },
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
        isLiked: {
          $gt: [{ $size: "$isLiked" }, 0],
        },
      },
    },
  ]);

  // if (!videoDetail) {
  //   return res.status(404).json(new ApiResponse(404, [], "No video found"));
  // }

  if (videoDetail.length === 0) {
    return res.status(404).json(new ApiResponse(404, [], "No video found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoDetail, "Video fetch successful"));
});

const getUserVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = Number(req.params.pages) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;
  const videos = await Videos.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        isPublish: true,
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
        as: "ownerDetail",
      },
    },
    {
      $unwind: "$ownerDetail",
    },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$ownerDetail.username",
          fullName: "$ownerDetail.fullName",
          avatar: "$ownerDetail.avatar",
        },
      },
    },
  ]);
  if (videos.length < 1) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No video found! Please upload some videos")
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All user videos fetch successfully"));
});

const uploadVideo = asyncHandler(async (req, res) => {
  const { description, title, isPublish } = req.body;
  const userId = req.user?._id;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All field is required");
  }
  const publish = isPublish === "true";
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if (!thumbnailLocalPath || !videoFileLocalPath) {
    throw new ApiError(400, "Video or thumbnail is required");
  }

  const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFilePath = await uploadOnCloudinary(videoFileLocalPath);

  console.log("Video upload cloudinary return result: ", videoFilePath);
  const video = await Video.create({
    title,
    description,
    isPublish: publish,
    videoFile: videoFilePath.url,
    duration: videoFilePath.duration,
    thumbnail: thumbnailPath.url,
    owner: userId,
  });

  if (!video) {
    return res
      .status(500)
      .json(new ApiResponse(500, [], "Something went wrong"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video successfully uploaded"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req?.params;
  const videoDelete = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!videoDelete) {
    throw new ApiError(400, "You are not authorized to delete this video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoDelete, "Successfully video deleted"));
});

export {
  getAllPublishedVideos,
  getVideoPageDetail,
  getUserVideos,
  uploadVideo,
  deleteVideo,
};
