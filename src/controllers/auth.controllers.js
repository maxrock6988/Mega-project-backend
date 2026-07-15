// Import model and required utility functions
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, EmailVerificationContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
// ======================================================
// Generate access token and refresh token
// ======================================================

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find user by ID
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw new ApiError(404, "User not found");
    }

    // Generate access token
    const accessToken = foundUser.generateAccessToken();

    // Generate refresh token
    const refreshToken = foundUser.generateRefreshToken();

    // Store refresh token in database
    foundUser.refreshToken = refreshToken;

    await foundUser.save({
      validateBeforeSave: false,
    });

    // Return both tokens
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ======================================================
// Register a new user
// ======================================================

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from request body
  const { email, username, password } = req.body;

  // Check if email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // ======================================================
  // Create new user
  // ======================================================

  const newUser = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  // ======================================================
  // Generate temporary email verification token
  // ======================================================

  const { unHashedToken, hashedToken, tokenExpiry } =
    newUser.generateTemporaryToken();

  // Store HASHED token in database
  newUser.emailVerificationToken = hashedToken;

  // Store token expiry time
  newUser.emailVerificationExpiry = tokenExpiry;

  await newUser.save({
    validateBeforeSave: false,
  });

  // ======================================================
  // Send verification email
  // ======================================================

  await sendEmail({
    email: newUser.email,

    subject: "Verify your email",

    mailgenContent: EmailVerificationContent(
      newUser.username,

      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  // ======================================================
  // Fetch created user without sensitive fields
  // ======================================================

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  // Check if user creation failed
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // ======================================================
  // Send success response
  // ======================================================

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
      },
      "User registered successfully and verification email has been sent",
    ),
  );
});

// ======================================================
// login controller
// ======================================================
const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user doesnot exist");
  }

  const ispasswordValid = await user.isPasswordCorrect(password);

  if (!ispasswordValid) {
    throw new ApiError(400, "password invalid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User logged in succesfully",
      ),
    );
});

// ======================================================
// logout controller
// ======================================================
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

// ======================================================
// current user controller
// ======================================================
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched succesfully"));
});

// ======================================================
//verify email controller
// ======================================================
const VerifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "email verification token is missing");
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },

      "email is verified",
    ),
  );
});

// ======================================================
//Resend Email Verification controller
// ======================================================
const ResendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "user doesnot exist");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    User.generateTemporaryToken();

  // Store HASHED token in database
  user.emailVerificationToken = hashedToken;

  // Store token expiry time
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    mailgenContent: EmailVerificationContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "mail has been sent to your email id"));
});

// ======================================================
//Refresh Access Token controller
// ======================================================
const RefreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newrefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "AccessToken refresh",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "invalid refresh token");
  }
});

// ======================================================
//Forgot Password Request controller
// ======================================================
const ForgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  await sendEmail({
    email: user?.email,
    subject: "password reset",
    mailgenContent: ForgorPasswordVerificationContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "PASSSWORD REset mail sent to your mail is"),
    );
});

// ======================================================
//Reset Forgot Password controller
// ======================================================

const ResetPassword = asyncHandler(async (req, res) => {
  
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

 const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }
});

  if (!user) {
    throw new ApiError(401, "token is invalid or expired");
  }

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  user.password = newPassword;
  
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password reset succesfully"));
});

// ======================================================
//change Current Password controller
// ======================================================

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldpassword);

  if(!isPasswordValid){
    throw new ApiError(400,"invalid old password")
  }

  user.password=newPassword;
  await user.save({
    validateBeforeSave:false,
  })
 return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change succesfully"));
});

// ======================================================
// Export controller functions
// ======================================================
export {
  registerUser,
  generateAccessAndRefreshTokens,
  login,
  logoutUser,
  getCurrentUser,
  VerifyEmail,
  ResendEmailVerification,
  RefreshAccessToken,
  ForgotPasswordRequest,
  ResetPassword,
  changeCurrentPassword,
};
