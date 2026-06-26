import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user detail from user
  // check all the required data are availabe
  // check user already exist : username, email
  // check files image
  // upload them to cloudinary
  // check avatar uploading or not
  // create user object
  // add user into user
  // remove refresh token and password from response
  // check for user creation
  // return response

  const { username, email, fullName, password } = await req.body;
  // console.log(`Email: ${email}, Username: ${username}. FullName: ${fullName}`);
  // if(fullName === ""){
  //     throw new ApiError(400, "FullName is require");

  // }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field is required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError("400", "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const converImageLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is require");
  }

  const avatarPath = await uploadOnCloudinary(avatarLocalPath);
  const converImage = await uploadOnCloudinary(converImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar cloudinary upload error");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    converImage: converImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successfully"));
});

export { registerUser };
