import { RequestHandler, Response } from 'express'
import { checkAccessToken } from '../src/controller/auth'
import UserSchema, { User } from '../src/models/users'

export type TokenRequiredRes = Response<
	any,
	{
		user?: User
	}
>
const tokenRequired: RequestHandler = async (
	req,
	res: TokenRequiredRes,
	next
) => {
	try {
		const authorization = req.headers.authorization

		if (!authorization)
			return res
				.status(401)
				.json({ message: 'authorization header is required' })

		const result = checkAccessToken<{ email: string }>(authorization)

		if (!result.success) {
			return res.status(401).json({ message: result.message })
		}

		// check if the user is in the database
		const user = await UserSchema.findOne({
			email: result.decoded.email,
		})
		//  console.log(user)
		//  console.log(result)
		if (!user) return res.status(404).json({ message: 'User not found' })

		if (!result.success)
			return res.status(401).json({ message: result.message })

		console.log(result)
		res.locals.user = user
		next()
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
}

export default tokenRequired
