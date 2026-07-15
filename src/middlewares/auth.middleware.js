import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  //grabing token
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log("Cookies:", req.cookies);
console.log("Authorization:", req.header("Authorization"));
console.log("Token:", token);

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const DecodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(DecodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user=user
    next()
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});

export{verifyJWT}
