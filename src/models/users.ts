import mongoose, { Schema, Document } from 'mongoose'
import { v4 } from 'uuid'
export enum Gender {
	male = 'MALE',
	female = 'FEMALE',
	other = 'OTHER',
}

export interface User extends Document {
	uid: string // no update
	email: string // no update
	fullname: string
	bio: string
	password: string
	phone: string
	dialCode: string
	age: number
	image: string // no update
	verified: boolean // no update
	gender: Gender
}

const UserSchema = new Schema<User>({
	uid: { type: String, unique: true, required: true, default: v4 },
	fullname: { type: String },
	bio: { type: String },
	email: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
	},
	dialCode: {
		type: String,
	},
	image: {
		type: String,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	age: {
		type: Number,
		min: 1,
		max: 100,
	},

	gender: {
		type: String,
		enum: Object.values(Gender),
	},
})

export default mongoose.model<User>('users', UserSchema)
