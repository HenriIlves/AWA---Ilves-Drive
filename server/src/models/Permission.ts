import mongoose, { Schema } from "mongoose"

export interface IPermission {
  userId: mongoose.Types.ObjectId
  username: string
  type: "view" | "edit"
}

export const PermissionSchema = new Schema<IPermission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    type: { type: String, enum: ["view", "edit"], required: true },
  },
  { _id: false }
)