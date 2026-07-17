import { User } from "../models/user.models.js";
import { Project, project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  sendEmail,
  EmailVerificationContent,
  ForgorPasswordVerificationContent,
} from "../utils/mail.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constant.js";

const getproject = asyncHandler(async (req, res) => {
  const project = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projects",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "projects",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind:"$project"
    },
    {
      $project:{
        project:{
          _id:1,
          name:1,
          description:1,
          memebers:1,
          createdAt:1,
          createdBy:1,
        },
        role:1,
        _id:0,
      }
    }
  ]);
});

const getprojectById = asyncHandler(async (req, res) => {});

const CreateProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "project created succesfully"));
});

const UpdateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );

  if (!project) {
    throw new ApiError(400, "project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "project update succesfully"));
});

const DeleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(400, "project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "project deleted succesfully"));
});

const AddMemberToproject = asyncHandler(async (req, res) => {});

const GetMemberToproject = asyncHandler(async (req, res) => {});

const UpdateMemberRole = asyncHandler(async (req, res) => {});

const DeleteMemberRole = asyncHandler(async (req, res) => {});

export {
  getproject,
  getprojectById,
  CreateProject,
  UpdateProject,
  DeleteProject,
  AddMemberToproject,
  GetMemberToproject,
  UpdateMemberRole,
  DeleteMemberRole,
};
