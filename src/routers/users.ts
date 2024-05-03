import { RequestHandler, Router } from 'express'
import { z } from 'zod'
import UsersModal from '../models/users'
import FollowUserRoute from './followrequest'
import tokenRequired, {
	TokenRequiredRes,
} from '../../middlewares/tokenRequired'
import { Gender } from '../models/users'
import { createHash } from '../controller/auth'

const router = Router()
router.use(tokenRequired)
router.use('/followRequest', FollowUserRoute)

router.get('/getUserInfo', (req, res) => {
	console.log('this is from getUserInfo', res.locals.user)

	return res.json({
		message: 'Fetched User Successfully',
		payload: {
			email: res.locals.user.email,
			fullname: res.locals.user.fullname,
			phone: res.locals.user.phone,
			uid: res.locals.user.uid,
			verified: res.locals.user.verified,
			image: res.locals.user.image,
		},
	})
})

const UpdateUserSchema = z.object({
	fullname: z
		.string()
		.min(2, { message: 'Username must be at least 2 character long' })
		.max(50, {
			message: 'Username must be at most 50 characters long',
		})
		.optional(),
	password: z
		.string()
		.min(8, {
			message: 'Password must be at least 8 characters long',
		})
		.max(50, { message: 'Password must be at most 50 characters' })
		.optional(),
	bio: z
		.string()
		.min(0)
		.max(50, { message: 'bio must be atmost 50 characters' })
		.optional(),
	phone: z
		.string()
		.min(10, { message: 'phone number cannot have less than 10 chars' })
		.max(14, { message: 'please enter valid phone number' })
		.optional(),
	dialCode: z
		.string()
		.min(0)
		.max(4, { message: 'dialCode must be atmost 4 characters' })
		.optional(),
	age: z.number().int().positive({ message: 'invalid age' }).optional(),

	gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
})

const validate: RequestHandler = (req, res, next) => {
	try {
		UpdateUserSchema.parse(req.body)
		return next()
	} catch (error) {
		return res.status(400).json(error)
	}
}

router.put('/updateUser', validate, async (req, res: TokenRequiredRes) => {
	try {
		const updateData = req.body as z.infer<typeof UpdateUserSchema>
		// const hashedPassword = await createHash(updateData.password);

		let hashedPassword: string | undefined = undefined

		if (updateData.password) {
			hashedPassword = await createHash(updateData.password)
		}

		// res.locals.user.fullname = updateData.fullname;
		// res.locals.user.password = updateData.password

		const toUpdate = {
			fullname: updateData.fullname,
			password: hashedPassword,
			bio: updateData.bio,
			phone: updateData.phone,
			dialCode: updateData.dialCode,
			age: updateData.age,
			gender: updateData.gender as Gender,
		}

		const newUser = await UsersModal.findOneAndUpdate(
			{ uid: res.locals.user.uid },
			{
				$set: toUpdate,
			},
			{
				new: true,
			}
		)

		return res.json({
			message: 'Data base updated',
			payload: {
				uid: newUser.uid,
				email: newUser.email,
				fullname: newUser.fullname,
				phone: newUser.phone,
				verified: newUser.verified,
				bio: newUser.bio,
				age: newUser.age,
				gender: newUser.gender,
			},
		})
		// res.send(user);
	} catch (error) {
		return res
			.status(500)
			.json({ message: error.message || 'internal server error' })
	}
})

export default router
