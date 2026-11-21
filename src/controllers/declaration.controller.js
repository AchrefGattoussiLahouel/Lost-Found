import declarationService from "../services/declaration.service.js";

const create = async (req, res) => {
  const data = await declarationService.create(req.validated.body, req.user);
  return res.status(201).json({ message: "Declaration created.", data });
};

const getById = async (req, res) => {
  const data = await declarationService.getById(req.validated.params.id, req.user);
  return res.status(200).json({ data });
};

const listAll = async (req, res) => {
  const data = await declarationService.listAll(req.user, req.validated.query);
  return res.status(200).json({ data });
}

const mine = async (req, res) => {
  const data = await declarationService.mine(req.user, req.validated.query);
  return res.status(200).json({ data });
};

export default { create, getById, listAll, mine };