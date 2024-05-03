import { RequestHandler, Router } from "express";
import { z } from "zod";
import FollowRequestSchema, { FollowRequest } from "../models/followrequest";
import tokenRequired, {
  TokenRequiredRes,
} from "../../middlewares/tokenRequired";
import UserSchema, { User } from "../models/users";

const router = Router();
router.use(tokenRequired);

const uidSchema = z
  .string()
  .min(0, { message: "User ID Cannot be Blank" })
  .max(40, { message: "User ID must be at least 40 characters" });

router.post("/follow/:uid", async (req, res: TokenRequiredRes) => {
  try {
    const CurrentUserId = res.locals.user.uid;
    const userid = uidSchema.parse(req.params.uid);
    console.log(userid);
    const UserToFollow = await UserSchema.findOne({ uid: userid });
    console.log(UserToFollow);

    if (!UserToFollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (CurrentUserId === UserToFollow.uid) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingFollow = await FollowRequestSchema.findOne({
      followedUser: UserToFollow._id,
      followedBy: res.locals.user._id,
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    const followRequest = new FollowRequestSchema({
      followedUser: UserToFollow._id,
      followedBy: res.locals.user._id,
      unfollowed: false,
    });

    await followRequest.save();
    res.json({ message: "Follow request sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/unFollow/:uid", async (req, res: TokenRequiredRes) => {
  try {
    const CurrentUserId = res.locals.user.uid;
    console.log(CurrentUserId);
    const userid = uidSchema.parse(req.params.uid);
    console.log(userid);

    const UserToFollow = await UserSchema.findOne({ uid: userid });
    console.log(UserToFollow);

    if (!UserToFollow) {
      return res.status(404).json({
        message: "User to follow not found",
      });
    }

    const existingFollow = await FollowRequestSchema.findOne({
      followedUser: UserToFollow._id,
      followedBy: res.locals.user._id,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      return res.status(200).json({ message: "User Unfollowed Succesfully" });
    } else {
      return res.status(400).json({ message: "User is not being followed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
