import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    incompleted: {
      type: Boolean,
      default: false,
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const SubTasks = mongoose.model("SubTasks", subTaskSchema);
