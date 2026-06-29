import { Router } from "express";
import { commentOnTweet, commentOnVideo, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)
router.route("/add-comment-video").post(commentOnVideo)
router.route("/add-comment-delete").post(commentOnTweet)
router.route("/delete-comment/:id").delete(deleteComment)


export default router