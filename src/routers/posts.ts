import { RequestHandler, Router } from 'express'
import { z } from 'zod'

import tokenRequired, {
	TokenRequiredRes,
} from '../../middlewares/tokenRequired'
import PostsModal, { posts } from '../models/posts'
import { User } from '../models/users'
import CommentsRoute from './comments'

// input pust body schema
const createPostSchema = z.object({
	caption: z
		.string()
		.min(3, {
			message: 'caption must be at least 3 characters long',
		})
		.max(500, {
			message: 'caption must be at most 500 characters long',
		}),
	body: z.string().min(10).max(1000).optional(),
	tags: z.array(z.string().min(10)).max(50).optional(),
	originalPostId: z.string().max(40).optional(),
})

const updatePostSchema = z.object({
	caption: z
		.string()
		.min(3, {
			message: 'caption must be at least 3 characters long',
		})
		.max(500, {
			message: 'caption must be at most 500 characters long',
		})
		.optional(),
	body: z.string().min(10).max(1000).optional(),
	tags: z.array(z.string().max(50)).max(10).optional(),
})

const getAllPostQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(10).optional(),
	skip: z.coerce.number().min(0).default(0).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
})

const getFeedsQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(10).optional(),
	skip: z.coerce.number().min(0).default(0).optional(),
	sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
})

type CreatePostInput = z.infer<typeof createPostSchema>
type UpdatePostInput = z.infer<typeof updatePostSchema>
type GetAllPostInput = z.infer<typeof getAllPostQuerySchema>
type GetFeedsInput = z.infer<typeof getFeedsQuerySchema>

const router = Router()
router.use(tokenRequired)
router.use('/comments', CommentsRoute)

const validateCreatePostInput: RequestHandler = (req, res, next) => {
	try {
		createPostSchema.parse(req.body)
		next()
	} catch (error) {
		return res.status(400).json(error)
	}
}

const validateUpdatePostInput: RequestHandler = (req, res, next) => {
	try {
		updatePostSchema.parse(req.body)
		next()
	} catch (error) {
		return res.status(400).json(error)
	}
}

const validateGetAllPostInput: RequestHandler = (req, res, next) => {
	try {
		getAllPostQuerySchema.parse(req.query)
		next()
	} catch (error) {
		return res.status(400).json(error)
	}
}

const validateGetFeedsInput: RequestHandler = (req, res, next) => {
	try {
		getFeedsQuerySchema.parse(req.query)
		next()
	} catch (error) {
		return res.status(400).json(error)
	}
}

interface PopuplatedPosts extends Omit<posts, 'originalPost' | 'user'> {
	originalPost: posts
	user: User
}

// Create Post
router.post(
	'/createPost',
	validateCreatePostInput,
	async (req, res: TokenRequiredRes) => {
		try {
			console.log('create post')
			const { caption, tags, originalPostId, body } =
				req.body as CreatePostInput

			let originalPost: posts | undefined

			if (originalPostId) {
				originalPost = await PostsModal.findOne({
					id: originalPostId,
				})
				if (!originalPost) {
					return res.status(404).json({
						message: 'Original post not found',
					})
				}
			}
			console.log(req.body, res.locals.user)
			const newPost = await PostsModal.create({
				caption,
				body,
				tags,
				user: res.locals.user._id,
				originalPost: originalPost ? originalPost._id : undefined,
			})

			return res.status(200).json({
				message: 'Post created Successfully',
				payload: {
					id: newPost.id,
					caption: newPost.caption,
					body: newPost.body,
					tags: newPost.tags,
					createdOn: newPost.createdOn,
					lastEdited: newPost.lastEdited,
					user: res.locals.user.uid,
					originalPost: originalPost ? originalPost.id : undefined,
				},
			})
		} catch (error) {
			console.log(error)

			return res.status(500).json({
				message: 'Internal Server Error',
			})
		}
	}
)

// Update Post
router.put(
	'/updatePost/:id',
	validateUpdatePostInput,
	async (req, res: TokenRequiredRes) => {
		try {
			const { caption, tags, body } = req.body as UpdatePostInput

			const post = (await PostsModal.findOneAndUpdate(
				{ id: req.params.id },
				{
					$set: {
						caption,
						tags,
						body,
					},
				},
				{
					new: true,
				}
			).populate(['originalPost', 'user'])) as PopuplatedPosts

			if (!post)
				return res.status(404).json({ message: 'Post not found' })
			console.log('updated post successfully')

			return res.status(200).json({
				message: 'Post created',
				payload: {
					id: post.id,
					caption: post.caption,
					body: post.body,
					tags: post.tags,
					createdOn: post.createdOn,
					lastEdited: post.lastEdited,
					user: post.user?.uid,
					originalPost: post.originalPost?.id,
				},
			})
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal Server error' })
		}
	}
)

// Get Post
router.get('/getPost/:id', async (req, res: TokenRequiredRes) => {
	try {
		const post: PopuplatedPosts = await PostsModal.findOne({
			id: req.params.id,
		}).populate(['originalPost', 'user'])

		if (!post) {
			return res.status(404).json({
				message: 'Post not found',
			})
		}

		return res.status(200).json({
			message: 'Post fetched successfully',
			payload: {
				id: post.id,
				caption: post.caption,
				body: post.body,
				tags: post.tags,
				createdOn: post.createdOn,
				lastEdited: post.lastEdited,
				user: post.user?.uid,
				originalPost: post.originalPost?.id,
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})
// Delete Post2
router.delete('/deletePost/:id', async (req, res: TokenRequiredRes) => {
	try {
		const post = await PostsModal.findOneAndDelete({ id: req.params.id })
		// console.log(post)
		if (!post) return res.status(404).json({ message: 'post not found' })

		return res.send({
			message: 'Post deleted successfully',
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

// posts that user have created
router.get(
	'/getAllPosts',
	validateGetAllPostInput,
	async (req, res: TokenRequiredRes) => {
		try {
			// const query = getAllPostQuerySchema.parse(req.query)

			const { limit, skip, sortOrder } = req.query as GetAllPostInput

			const posts: PopuplatedPosts[] = await PostsModal.find({
				user: res.locals.user._id,
			})
				.populate(['originalPost', 'user'])
				.sort({ createdOn: sortOrder })
				.limit(limit)
				.skip(skip)
				.lean() // the lean() method is used to convert to plain JavaScript objects

			return res.status(200).json({
				message: 'Posts fetched successfully',
				payload: posts.map((post) => ({
					id: post.id,
					caption: post.caption,
					body: post.body,
					tags: post.tags,
					createdOn: post.createdOn,
					lastEdited: post.lastEdited,
					user: {
						uid: post.user.uid,
						fullname: post.user.fullname,
						image: post.user.image,
					},
					originalPost: post.originalPost?.id,
				})),
			})
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal Server Error' })
		}
	}
)

export default router

// feeds of the user
router.get(
	'/getFeeds',
	validateGetFeedsInput,
	async (req, res: TokenRequiredRes) => {
		try {
			const { limit, skip, sortOrder } = req.query as GetFeedsInput

			const posts: PopuplatedPosts[] = await PostsModal.find({})
				.populate(['originalPost', 'user'])
				.sort({ createdOn: sortOrder })
				.limit(limit)
				.skip(skip)
				.lean() // the lean() method is used to convert to plain JavaScript objects

			return res.status(200).json({
				message: 'Posts fetched successfully',
				payload: posts.map((post) => ({
					id: post.id,
					caption: post.caption,
					body: post.body,
					tags: post.tags,
					createdOn: post.createdOn,
					lastEdited: post.lastEdited,
					user: {
						uid: post.user.uid,
						fullname: post.user.fullname,
						image: post.user.image,
					},
					originalPost: post.originalPost?.id,
				})),
			})
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal Server Error' })
		}
	}
)
