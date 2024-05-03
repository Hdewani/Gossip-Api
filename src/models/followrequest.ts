import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface FollowRequest extends Document {
  followedUser: ObjectId;
  createdOn: Date;
  accepted: Boolean;
  unfollowed: Boolean;
  followedBy: ObjectId;
}

const FollowRequestSchema = new Schema<FollowRequest>({
  followedUser: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
  accepted: { type: Boolean, default: true },
  unfollowed: { type: Boolean, default: false },
  followedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
});

FollowRequestSchema.index({ followedUser: 1 });
FollowRequestSchema.index({ followedBy: 1 });

export default mongoose.model<FollowRequest>(
  "FollowRequest",
  FollowRequestSchema
);
