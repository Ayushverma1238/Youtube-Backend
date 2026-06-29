import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteTweet, getAllTweet, getUserTweet, uploadTweet } from "../controllers/tweet.controller.js";

const router =Router();

router.route("/get-all-tweets/:pages").get(getAllTweet)
router.route("/get-user-tweets/:pages").get(verifyJWT, getUserTweet)
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet)
router.route('/upload-tweet').post(verifyJWT, uploadTweet)


export default router;