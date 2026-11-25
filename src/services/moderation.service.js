import User from "../models/user.js";
import Post from "../models/post.js";
import Errors from "../errors/index.js";
import { POST_STATUS } from "../constants/post.js";
import { USER_STATUS } from "../constants/user.js";

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Errors.NotFoundError("User", userId);
  }

  return user;
};

const getPostById = async (postId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Errors.PostNotFoundError();
  }

  return post;
};

const hidePost = async (postId, actor) => {
  const post = await getPostById(postId);

  if (post.isDeleted) {
    throw new Errors.ConflictError("A deleted post cannot be hidden again.");
  }

  if (post.isHidden) {
    throw new Errors.ConflictError("Post is already hidden.");
  }

  post.isHidden = true;
  post.hiddenAt = new Date();
  post.hiddenBy = actor._id;

  await post.save();

  return post;
};

const restorePost = async (postId) => {
  /* Makes a hidden post visible again. */
  const post = await getPostById(postId);

  if (post.isDeleted) {
    throw new Errors.ConflictError(
      "A deleted post must be restored using restore-deleted.",
    );
  }

  if (!post.isHidden) {
    throw new Errors.ConflictError("Post is not hidden.");
  }

  post.isHidden = false;

  await post.save();

  return post;
};

const deletePost = async (postId, actor) => {
  /* Deletes a post softly so it can be restored later. */
  const post = await getPostById(postId);

  if (post.isDeleted) {
    throw new Errors.ConflictError("Post is already deleted.");
  }

  post.isHidden = true;
  post.isDeleted = true;
  post.deletedAt = new Date();
  post.deletedBy = actor._id;

  await post.save();

  return post;
};

const restoreDeletedPost = async (postId) => {
  /* Restores a deleted post. */
  const post = await getPostById(postId);

  if (!post.isDeleted) {
    throw new Errors.ConflictError("Post is not deleted.");
  }

  post.isDeleted = false;
  post.isHidden = false;

  await post.save();

  return post;
};

const changePostStatus = async (postId, status) => {
  const post = await getPostById(postId);

  if (!Object.values(POST_STATUS).includes(status)) {
    throw new Errors.InvalidPostStatusError();
  }

  if (post.status === status) {
    throw new Errors.ConflictError("Post already has this status.");
  }

  post.status = status;

  await post.save();

  return post;
};

const suspendUser = async (userId) => {
  const user = await getUserById(userId);

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new Errors.ConflictError("User is already suspended.");
  }

  user.status = USER_STATUS.SUSPENDED;

  await user.save();

  return user;
};

const reactivateUser = async (userId) => {
  /* Reactivates a suspended user. */
  const user = await getUserById(userId);

  if (user.status !== USER_STATUS.SUSPENDED) {
    throw new Errors.ConflictError("User is not suspended.");
  }

  user.status = USER_STATUS.ACTIVE;

  await user.save();

  return user;
};

export default {
  hidePost,
  restorePost,
  deletePost,
  restoreDeletedPost,
  changePostStatus,
  suspendUser,
  reactivateUser,
};
