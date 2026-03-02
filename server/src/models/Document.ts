import mongoose, { Document as MongooseDocument, Schema } from "mongoose"
import { IPermission, PermissionSchema } from "./Permission"

// Represents a text document owned by a user
export interface IDocument extends MongooseDocument {
  title: string
  content: string
  ownerId: mongoose.Types.ObjectId
  ownerUsername: string
  createdAt: Date
  lastEditedAt: Date
  isPublicReadOnly: boolean
  publicLinkToken?: string
  permissions: IPermission[]
  // Edit lock — only one user can hold the lock at a time
  currentEditor?: mongoose.Types.ObjectId
  currentEditorUsername?: string
  editingStartedAt?: Date  // used to detect stale locks (> 30 min)
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastEditedAt: { type: Date, default: Date.now },
    isPublicReadOnly: { type: Boolean, default: false },
    publicLinkToken: { type: String, sparse: true },
    permissions: [PermissionSchema],
    currentEditor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    currentEditorUsername: { type: String, default: null },
    editingStartedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Index for public link lookups
DocumentSchema.index({ publicLinkToken: 1 })

// Index for owner lookups
DocumentSchema.index({ ownerId: 1 })

const Document = mongoose.model<IDocument>("Document", DocumentSchema)

export { Document }