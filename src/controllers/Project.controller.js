import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
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
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";

const getproject = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectMembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectMembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        project: {
          _id: "$project._id",
          name: "$project.name",
          description: "$project.description",
          members: "$project.members",
          createdAt: "$project.createdAt",
          createdBy: "$project.createdBy",
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getprojectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params; //taking id from url
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "project not found ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "project fetched successully"));
});

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

const AddMemberToproject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user doesnot exist");
  }
  await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  );
  return res.status(200).json(new ApiResponse(201, {}, "Project member added"));
});

const GetMemberToproject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(req.params);

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $arrayElemAt: ["user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        createdBy: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "project Members fetched successully",
      ),
    );
});

const UpdateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(404, "role not exist");
  }

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      relw: newRole,
    },
    {
      new: true,
    },
  );

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "project Member role updated successully",
      ),
    );
});

const DeleteMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id);

  if (!projectMember) {
    throw new ApiError(404, "project member not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "project Member deleted successully",
      ),
    );
});

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
