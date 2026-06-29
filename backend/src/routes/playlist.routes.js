import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addPlaylist,
  deletePlaylist,
  deletePlaylistVideo,
  getPlaylistVideos,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/add-playlist-video").post(addPlaylist);
router.route("/delete-playlist").delete(deletePlaylist);
router.route("/delete-video/").delete(deletePlaylistVideo);
router.route("/playlist-video/:pages").post(getPlaylistVideos);

export default router;
