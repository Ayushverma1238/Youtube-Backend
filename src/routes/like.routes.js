import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likeComment, likeTweet, likeVideo } from "../controllers/like.controller.js";
const router = Router();

router.use(verifyJWT)
router.route("/video/:videoId").post(likeVideo)
router.route("/tweet/:tweetId").post(likeTweet)
router.route('/comment/:commentId').post(likeComment)

export default router;