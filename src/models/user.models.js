import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: "https://placehold.co/200x200",
        localpath: "",
      },
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullname: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
    },

    forgotPasswordToken: {
      type: String,
    },

    forgotPasswordExpiry: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// HOOK: Hash password before saving
// ======================================================

userSchema.pre("save", async function () {
  // If password is not changed, don't hash again
  if (!this.isModified("password")) {
    return;
  }

  // Hash password
  this.password = await bcrypt.hash(this.password, 10);
});


// ======================================================
// METHOD: Check password
// ======================================================

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// ======================================================
// METHOD: Generate access token
// ======================================================

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


// ======================================================
// METHOD: Generate refresh token
// ======================================================

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


// ======================================================
// METHOD: Generate temporary token
// ======================================================

userSchema.methods.generateTemporaryToken = function () {
  // Create random unhashed token
  const unHashedToken = crypto
    .randomBytes(20)
    .toString("hex");

  // Hash the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // Token valid for 20 minutes
  const tokenExpiry = Date.now() + 20 * 60 * 1000;

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  };
};


// ======================================================
// MODEL
// ======================================================

export const User = mongoose.model("User", userSchema);