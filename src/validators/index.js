import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constant.js";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLowercase()
      .withMessage("username must be in lowercase")
      .isLength({ min: 3, max: 20 })
      .withMessage("more long "),
    body("password").trim().notEmpty().withMessage("password required"),
    body("fullname").optional().trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("email is invalid"),
    body("password").notEmpty().withMessage("password is required"),
  ];
};

const userchangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
};

const UserForgotPasswordValidator = () => {
  return [
    body("email")
      .isEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email in invalid"),
  ];
};

const userResetForgotpassword = () => {
  return [body("newPassword").notEmpty().withMessage("password is required")];
};

const createprojectValidator = () => {
  return [
    body("name").notEmpty().withMessage("name is required"),
    body("description").optional(),
  ];
};

const addMemberToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .isEmail()
      .withMessage("email invalid")
      .notEmpty()
      .withMessage("email is required"),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableUserRole)
      .withMessage("role in invalid"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userchangeCurrentPasswordValidator,
  UserForgotPasswordValidator,
  userResetForgotpassword,
  createprojectValidator,
  addMemberToProjectValidator,
};
