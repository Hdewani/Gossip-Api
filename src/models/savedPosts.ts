import mongoose, { Schema, Document, ObjectId } from 'mongoose'
 
export interface savedPosts extends Document{
   post:ObjectId
   user:ObjectId
   createdAt:Date
}
const savedPostsSchema = new Schema<savedPosts>({ 
    post:{ type:Schema.Types.ObjectId, ref: 'posts'},
    user:{ type:Schema.Types.ObjectId, ref: 'users'},
    createdAt:{type:Date, default:Date.now,required:true}
})
savedPostsSchema.index({user:1})
savedPostsSchema.index({post:1})
export default mongoose.model('savedPosts', savedPostsSchema)