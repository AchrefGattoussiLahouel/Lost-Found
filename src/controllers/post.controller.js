import postService from "../services/post.service.js";

const create = async (req, res) => {
  const data = await postService.create(req.validated.body, req.user);
  return res.status(201).json({ message: "Post created.", data });
};

const getById = async (req, res) => {
  const data = await postService.getById(req.validated.params.id, req.user);
  return res.status(200).json({ data });
};

const listAll = async (req, res) => {
  const data = await postService.listAll(req.user, req.validated.query);
  return res.status(200).json({ data });
};

const mine = async (req, res) => {
  const data = await postService.mine(req.user, req.validated.query);
  return res.status(200).json({ data });
};

export default { create, getById, listAll, mine };
