import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";
import e from "express";

const addPlaylist = asyncHandler(async (req, res) => {
  const { name, videoId } = req.body;
  const owner = req.user._id;

  // Validate input
  if (!name?.trim() || !videoId) {
    throw new ApiError(400, "Playlist name and videoId are required");
  }

  // Check if playlist already exists for this user
  let playlist = await Playlist.findOne({
    name: name.trim(),
    owner,
  });

  // If playlist doesn't exist, create it
  if (!playlist) {
    playlist = await Playlist.create({
      name: name.trim(),
      owner,
      video: [videoId],
    });

    return res
      .status(201)
      .json(new ApiResponse(201, playlist, "Playlist created successfully"));
  }

  // Check if video already exists in playlist
  const isVideoExist = playlist.video.some((id) => id.equals(videoId));

  if (isVideoExist) {
    throw new ApiError(409, "Video already exists in this playlist");
  }

  // Add video to playlist
  playlist.video.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const getPlaylistVideos = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const page = Number(req.params.pages) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const userId = req.user._id;

  const playList = await Playlist.aggregate([
    {
      $match: {
        name: name,
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $unwind: "$playlistOwner",
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
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
              as: "videoOwner",
            },
          },
          {
            $unwind: "$videoOwner",
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
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "videoComments",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "commentUser",
                  },
                },
                {
                  $unwind: "$commentUser",
                },
                {
                  $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "commentLikes",
                  },
                },
                {
                  $project: {
                    _id: 1,
                    content: 1,
                    commentOwner: {
                      fullName: "$commentUser.fullName",
                      username: "$commentUser.username",
                      avatar: "$commentUser.avatar",
                    },
                    commentLikeCount: { $size: "$commentLikes" },
                  },
                },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              views: 1,
              videoLikeCount: { $size: "$videoLikes" },
              owner: {
                _id: "$videoOwner._id",
                fullName: "$videoOwner.fullName",
                username: "$videoOwner.username",
                avatar: "$videoOwner.avatar",
              },
              videoCommentCount: { $size: "$videoComments" },
              comment: "$videoComments",
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        owner: {
          fullName: "$playlistOwner.fullName",
          username: "$playlistOwner.username",
          avatar: "$playlistOwner.avatar",
        },
        videos: "$videos",
      },
    },
  ]);

  if (playList.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist data fetched"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const deletedPlaylist = await Playlist.findOneAndDelete({
    name,
    owner: req.user?._id,
  });

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted"));
});

const deletePlaylistVideo = asyncHandler(async (req, res) => {
  const { videoId, name } = req.body;
  const userId = req.user._id;

  if (!videoId || !name) {
    throw new ApiError(400, "Playlist name and video id are required");
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      name,
      owner: userId,
    },
    {
      $pull: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    );
});

export { addPlaylist, getPlaylistVideos, deletePlaylist,deletePlaylistVideo };
