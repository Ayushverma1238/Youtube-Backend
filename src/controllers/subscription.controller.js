import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  const alreadySubs = await Subscription.findOneAndDelete({
    subscriber: userId,
    channel: channelId,
  });

  if (alreadySubs) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, { subscribed: false }, "Channel unsubscribed")
      );
  }

  const subs = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  if (!subs) {
    throw new ApiError(500, "Something went wrong, while subscribing.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Channel subscribed"));
});

export { toggleSubscription };
