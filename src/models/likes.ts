import mongoose, { Schema, Document, ObjectId } from 'mongoose'

export interface likes extends Document{
    likedBy: ObjectId
    createdOn: Date
    post: ObjectId
}
const likeSchema=new Schema<likes>({
    likedBy: { type:Schema.Types.ObjectId, ref: 'users'},
    createdOn:{type:Date,default:Date.now} ,
    post: {type:Schema.Types.ObjectId, ref: 'posts'},
})
likeSchema.index({ post: 1 })
export default mongoose.model<likes>('likes', likeSchema)