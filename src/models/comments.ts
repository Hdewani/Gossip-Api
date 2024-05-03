import mongoose, { Schema, Document, ObjectId } from "mongoose"
import { v4 } from "uuid"
export interface comments extends Document {
  id: string
  commentedBy: ObjectId
  post: ObjectId
  createdOn: Date
  editedOn: Date
  visibility: boolean
  comment: string
  tags: string[]
}
const commentsSchema = new Schema<comments>({
  id: { type: String, unique: true, required: true, default: v4 },
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  post: { type: Schema.Types.ObjectId, ref: "posts", required: true },
  createdOn: { type: Date, default: Date.now, required: true },
  editedOn: { type: Date },
  visibility: { type: Boolean, default: true, required: true },
  comment: { type: String, required: true },
  tags: { type: [String], default: [] },
})
commentsSchema.index({ commentedBy: 1 })
commentsSchema.index({ post: 1 })
export default mongoose.model<comments>("comments", commentsSchema)
