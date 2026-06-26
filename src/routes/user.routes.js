import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/password-reset").post(changeCurrentPassword);
router.route("/getUser").get(getCurrUser);
router.route("/change-avatar").post(
  upload.field({
    name: "avatar",
    maxCount: 1,
  })
);
router.route("/change-coverImage").post(
  upload.field({
    name: "coverImage",
    maxCount: 1,
  })
);

export default router;
