import { Router } from 'express'
import UserSchema, { User } from '../models/users'
import {
	checkAccessToken,
	createAccessToken,
	createHash,
	verifyHash,
} from '../controller/auth'

interface LoginInput {
	email?: string
	password?: string
}

interface UserInput extends LoginInput {
	email?: string
	password?: string
	fullname?: string
	phone?: string
}

const router = Router()

router.post('/signup', async (req, res) => {
	try {
		const formData = req.body as UserInput
		//1. username and password are required fields

		if (!formData.email)
			return res.status(400).json({ message: 'email is required' })

		if (!formData.password)
			return res.status(400).json({ message: 'password is required' })

		// 1.1 username should be unique
		const existingUser = await UserSchema.findOne({
			email: formData.email,
		}) // find [] fineOne {}

		if (existingUser)
			return res.status(400).json({ message: 'email already exists' })

		//2. password has to be atleast 8 characters long
		if (formData.password.length < 8) {
			return res.status(400).json({
				message: 'password should be atleast 8 characters long',
			})
		}
		//3. hash the password
		const hashedPassword = await createHash(formData.password)

		//4. save the user in the database
		const newUser = await UserSchema.create({
			email: formData.email,
			password: hashedPassword,
			fullname: formData.fullname,
			phone: formData.phone,
		})
		//5. return the user & accesstoken

		return res.json({
			message: 'user created successfully',
			payload: {
				fullname: newUser.fullname,
				email: newUser.email,
				phone: newUser.phone,
			},
			accessToken: createAccessToken({
				email: newUser.email,
			}),
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		// 1. username and password are required fields
		const { email, password } = req.body as LoginInput
		if (!email)
			return res.status(400).json({ message: 'email is required' })

		if (!password)
			return res.status(400).json({ message: 'password is required' })

		// 2. email should exist in the database
		const user = await UserSchema.findOne({ email })

		// 2.1 if not user then return error 404
		if (!user) return res.status(404).json({ message: 'user not found' })

		// 3. verify the password
		const result = await verifyHash(password, user.password)

		// 3.1 if password is wrong then return error 400
		if (!result) return res.status(400).json({ message: 'wrong password' })

		// 3.2 if password is correct then return the user with accessToken

		// 4. return the user and accesstoken
		return res.json({
			message: 'user logged in successfully',
			payload: {
				user: {
					email: user.email,
					fullname: user.fullname,
					phone: user.phone,
					uid: user.uid,
					bio: user.bio,
					dialCode: user.dialCode,
					age: user.age,
					image: user.image,
					verified: user.verified,
					gender: user.gender,
				},
				accessToken: createAccessToken({
					email: user.email,
				}),
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

export default router
