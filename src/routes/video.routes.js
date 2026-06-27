import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllPublishedVideos,
  getUserVideos,
  getVideoPageDetail,
  uploadVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/all-videos").get(getAllPublishedVideos);
router.route("/user-videos").post(verifyJWT, getUserVideos);
router.route("get-video-page-detail/:videoId").get(getVideoPageDetail);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "videoFile",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default router;