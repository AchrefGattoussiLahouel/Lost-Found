import moderationService from "../services/moderation.service.js";

const hidePost = async (req, res) => {
  const post = await moderationService.hidePost(
    req.validated.params.id,
    req.user,
  );

  return res.status(200).json({
    message: "Post hidden successfully.",
    data: { post },
  });
};

const restorePost = async (req, res) => {
  const post = await moderationService.restorePost(req.validated.params.id);

  return res.status(200).json({
    message: "Post restored successfully.",
    data: { post },
  });
};

const deletePost = async (req, res) => {
  const post = await moderationService.deletePost(
    req.validated.params.id,
    req.user,
  );

  return res.status(200).json({
    message: "Post deleted successfully.",
    data: { post },
  });
};

const restoreDeletedPost = async (req, res) => {
  const post = await moderationService.restoreDeletedPost(
    req.validated.params.id,
  );

  return res.status(200).json({
    message: "Deleted post restored successfully.",
    data: { post },
  });
};

const changePostStatus = async (req, res) => {
  const post = await moderationService.changePostStatus(
    req.validated.params.id,
    req.validated.body.status,
  );

  return res.status(200).json({
    message: "Post status updated successfully.",
    data: { post },
  });
};

const suspendUser = async (req, res) => {
  const user = await moderationService.suspendUser(req.validated.params.id);

  return res.status(200).json({
    message: "User suspended successfully.",
    data: { user },
  });
};

const reactivateUser = async (req, res) => {
  const user = await moderationService.reactivateUser(req.validated.params.id);

  return res.status(200).json({
    message: "User reactivated successfully.",
    data: { user },
  });
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
