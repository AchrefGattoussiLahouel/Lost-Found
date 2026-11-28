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

const update = async (req, res) => {
  const data = await postService.update(
    req.validated.params.id,
    req.validated.body,
    req.user,
  );
  return res.status(200).json({ message: "Post updated.", data });
};

const mine = async (req, res) => {
  const data = await postService.mine(req.user, req.validated.query);
  return res.status(200).json({ data });
};

const getTrash = async (req, res) => {
  const data = await postService.getTrash(req.user, req.validated.query);
  return res.status(200).json({ data });
};

const deleteById = async (req, res) => {
  await postService.deleteById(req.user, req.validated.params.id);
  return res.status(200).json({ message: "Post deleted successfully." });
};

const declareDeposit = async (req, res) => {
  const data = await postService.declareDeposit(req.validated.params.id, req.user);
  return res.status(200).json({ message: "Deposit recorded.", data });
};
const receiveAtOffice = async (req, res) => {
  const data = await postService.receiveAtOffice(req.validated.params.id, req.validated.body, req.user);
  return res.status(200).json({ message: "Object received at the office.", data });
};

export default { create, getById, listAll, mine, update, getTrash, deleteById,declareDeposit, receiveAtOffice };
